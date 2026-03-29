import { describe, expect, it } from "vitest";
import { PRESET_CONFIGS } from "@/src/constants/ui/presets.constants";
import { generateData } from "@/src/core/data/data.generator";
import { resolveDependencies } from "@/src/core/data/dependency.resolver";
import { validateGeneratorConfig } from "@/src/core/schema/config.validation";
import { generateSchema } from "@/src/core/schema/schema.generator";

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
});
