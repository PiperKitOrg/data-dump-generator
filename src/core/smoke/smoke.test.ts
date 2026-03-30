import { describe, expect, it } from "vitest";
import { PRESET_CONFIGS } from "@/src/constants/ui/presets.constants";
import { generateData } from "@/src/core/data/data.generator";
import { resolveDependencies } from "@/src/core/data/dependency.resolver";
import { validateGeneratorConfig } from "@/src/core/schema/config.validation";
import { generateSchema } from "@/src/core/schema/schema.generator";
import { PostgresExporter } from "@/src/exporters/postgres.exporter";

describe("smoke", () => {
  it("generates deterministic schema and data", () => {
    const seed = 42;
    const config = validateGeneratorConfig(PRESET_CONFIGS.medium);

    const schemaA = generateSchema(config, seed);
    const schemaB = generateSchema(config, seed);
    expect(schemaA).toEqual(schemaB);

    const planA = resolveDependencies(schemaA);
    const planB = resolveDependencies(schemaB);
    expect(planA).toEqual(planB);

    const dataA = generateData(schemaA, planA, 20, seed);
    const dataB = generateData(schemaB, planB, 20, seed);
    expect(dataA).toEqual(dataB);
  });

  it("returns insert order for all entities", () => {
    const config = validateGeneratorConfig(PRESET_CONFIGS.hard);
    const schema = generateSchema(config, 7);
    const plan = resolveDependencies(schema);

    expect(plan.insertOrder.length).toBe(schema.entities.length);
    expect(new Set(plan.insertOrder).size).toBe(schema.entities.length);
  });

  it("uses exact fieldsPerEntity when no foreign keys are added", () => {
    const config = validateGeneratorConfig({
      ...PRESET_CONFIGS.easy,
      entityCount: 5,
      fieldsPerEntity: 40,
      relationshipDensity: 0,
      manyToManyCount: 0,
      selfRefCount: 0,
      compositeKeyRate: 0,
    });
    const schema = generateSchema(config, 99);
    for (const entity of schema.entities) {
      expect(entity.fields.length).toBe(40);
    }
  });

  it("creates exact many-to-many and directed relationship counts", () => {
    const config = validateGeneratorConfig({
      ...PRESET_CONFIGS.easy,
      entityCount: 4,
      includeCycles: true,
      manyToManyCount: 3,
      relationshipDensity: 0.25,
      selfRefCount: 1,
      compositeKeyRate: 0,
    });
    const schema = generateSchema(config, 1);
    const N = 4 * 3;
    const m2m = schema.relationships.filter((r) => r.type === "many-to-many");
    const self = schema.relationships.filter((r) => r.type === "self");
    const directed = schema.relationships.filter(
      (r) => r.type === "one-to-one" || r.type === "one-to-many",
    );
    const directedQuota = Math.min(N, Math.round(0.25 * N));
    expect(self.length).toBe(1);
    expect(m2m.length).toBe(3);
    expect(directed.length).toBe(Math.min(directedQuota, N - 3));
  });

  it("exports explicit foreign keys and join tables", () => {
    const config = validateGeneratorConfig({
      ...PRESET_CONFIGS.easy,
      entityCount: 4,
      includeCycles: true,
      manyToManyCount: 1,
      relationshipDensity: 0.5,
      selfRefCount: 0,
      compositeKeyRate: 0,
    });
    const schema = generateSchema(config, 11);
    const plan = resolveDependencies(schema);
    const data = generateData(schema, plan, 3, 11);
    const sql = new PostgresExporter().export(schema, data);

    expect(sql).toContain("FOREIGN KEY");
    expect(sql).toContain("REFERENCES");
    const manyToMany = schema.relationships.find((rel) => rel.type === "many-to-many");
    expect(manyToMany?.joinTable).toBeTruthy();
    expect(sql).toContain(`CREATE TABLE "${manyToMany?.joinTable}"`);
  });
});
