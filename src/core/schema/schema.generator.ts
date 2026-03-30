import {
  type Entity,
  type Field,
  type FieldType,
  type GeneratorConfig,
  type Schema,
} from "@/src/core/schema/schema.model";
import { ENTITY_TEMPLATES } from "@/src/constants/schema/entity-templates.constants";
import {
  ENUM_VALUE_RANGE,
  SCHEMA_FIELD_NAMES,
  SCALAR_FIELD_TYPES,
} from "@/src/constants/schema/schema.constants";
import { generateRelationships } from "@/src/core/schema/relationship.generator";
import { SeededRandom } from "@/src/utils/seededRandom";

function createField(
  name: string,
  type: FieldType,
  nullable: boolean,
  rng: SeededRandom,
): Field {
  if (type !== "enum") {
    return { name, type, nullable };
  }

  const enumSize = rng.int(ENUM_VALUE_RANGE.min, ENUM_VALUE_RANGE.max);
  const enumValues = Array.from(
    { length: enumSize },
    (_, i) => `${SCHEMA_FIELD_NAMES.enumPrefix}${i + 1}`,
  );
  return {
    name,
    type,
    nullable,
    enumValues,
  };
}

function paddingTypePlan(
  paddingCount: number,
  config: GeneratorConfig,
  rng: SeededRandom,
): Array<"enum" | "json" | "scalar"> {
  if (paddingCount <= 0) {
    return [];
  }
  const enumCount = Math.min(
    paddingCount,
    Math.round(config.enumRate * paddingCount),
  );
  const jsonCount = Math.min(
    paddingCount - enumCount,
    Math.round(config.jsonRate * paddingCount),
  );
  const scalarCount = paddingCount - enumCount - jsonCount;
  const plan: Array<"enum" | "json" | "scalar"> = [];
  for (let i = 0; i < enumCount; i += 1) {
    plan.push("enum");
  }
  for (let i = 0; i < jsonCount; i += 1) {
    plan.push("json");
  }
  for (let i = 0; i < scalarCount; i += 1) {
    plan.push("scalar");
  }
  for (let i = plan.length - 1; i > 0; i -= 1) {
    const j = rng.int(0, i);
    [plan[i], plan[j]] = [plan[j], plan[i]];
  }
  return plan;
}

function buildPaddingFields(
  count: number,
  startSuffix: number,
  config: GeneratorConfig,
  rng: SeededRandom,
): Field[] {
  if (count <= 0) {
    return [];
  }
  const types = paddingTypePlan(count, config, rng);
  const nullableQuota = Math.min(
    count,
    Math.round(config.optionalFieldRate * count),
  );
  const fields: Field[] = [];
  for (let i = 0; i < count; i += 1) {
    const name = `${SCHEMA_FIELD_NAMES.fieldPrefix}${startSuffix + i}`;
    const kind = types[i] ?? "scalar";
    const nullable = i < nullableQuota;
    if (kind === "enum") {
      fields.push(createField(name, "enum", nullable, rng));
    } else if (kind === "json") {
      fields.push({ name, type: "json", nullable });
    } else {
      fields.push(
        createField(name, rng.pick(SCALAR_FIELD_TYPES), nullable, rng),
      );
    }
  }
  return fields;
}

function createEntity(
  template: EntityTemplate,
  index: number,
  config: GeneratorConfig,
  rng: SeededRandom,
  useComposite: boolean,
): Entity {
  const targetColumns = config.fieldsPerEntity;
  const bodyTarget = targetColumns - (useComposite ? 1 : 0);

  const baseTemplate = template.fields;
  const truncated =
    baseTemplate.length <= bodyTarget
      ? [...baseTemplate]
      : baseTemplate.slice(0, bodyTarget);

  const padCount = bodyTarget - truncated.length;
  const padding = buildPaddingFields(padCount, 1, config, rng);

  const fields: Field[] = [...truncated, ...padding];

  if (fields.length !== bodyTarget) {
    throw new Error(
      `Internal: expected ${bodyTarget} body columns, got ${fields.length}`,
    );
  }

  const primaryKey: string[] = [SCHEMA_FIELD_NAMES.primaryId];
  if (useComposite) {
    fields.push({
      name: SCHEMA_FIELD_NAMES.compositeCode,
      type: "string",
      nullable: false,
    });
    primaryKey.push(SCHEMA_FIELD_NAMES.compositeCode);
  }

  if (fields.length !== targetColumns) {
    throw new Error(
      `Internal: expected ${targetColumns} columns, got ${fields.length}`,
    );
  }

  const name = index < ENTITY_TEMPLATES.length ? template.name : `${template.name}_${index + 1}`;

  return {
    name,
    fields,
    primaryKey,
  };
}

function ensureRelationshipForeignKeys(entities: Entity[], schema: Schema): void {
  const byName = new Map(entities.map((entity) => [entity.name, entity]));
  for (const relationship of schema.relationships) {
    if (relationship.type === "many-to-many") {
      continue;
    }
    const entity = byName.get(relationship.fromEntity);
    if (!entity) {
      continue;
    }
    if (entity.fields.some((field) => field.name === relationship.fkField)) {
      continue;
    }
    entity.fields.push({
      name: relationship.fkField,
      type: "uuid",
      nullable: relationship.nullable,
    });
  }
}

export function generateSchema(config: GeneratorConfig, seed: number): Schema {
  const rng = new SeededRandom(seed);
  const templates = rng.shuffle(ENTITY_TEMPLATES);
  const entityCount = config.entityCount;

  const compositeTarget = Math.min(
    entityCount,
    config.fieldsPerEntity >= 2
      ? Math.round(config.compositeKeyRate * entityCount)
      : 0,
  );
  const compositeSlots = new Set(
    rng.shuffle(
      Array.from({ length: entityCount }, (_, entityIndex) => entityIndex),
    ).slice(0, compositeTarget),
  );

  const entities = Array.from({ length: entityCount }, (_, i) => {
    const template = templates[i % templates.length];
    return createEntity(
      template,
      i,
      config,
      rng,
      compositeSlots.has(i),
    );
  });
  const relationships = generateRelationships(entities, config, rng);
  const schema: Schema = { entities, relationships };
  ensureRelationshipForeignKeys(entities, schema);
  return schema;
}

type EntityTemplate = (typeof ENTITY_TEMPLATES)[number];
