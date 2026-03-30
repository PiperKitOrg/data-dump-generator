import {
  type Entity,
  type Field,
  type GeneratorConfig,
  type Schema,
} from "@/src/core/schema/schema.model";
import { ENTITY_TEMPLATES } from "@/src/constants/schema/entity-templates.constants";
import { MAX_COLUMNS_PER_ENTITY, SCHEMA_FIELD_NAMES } from "@/src/constants/schema/schema.constants";
import { generateRelationships } from "@/src/core/schema/relationship.generator";
import { SeededRandom } from "@/src/utils/seededRandom";

function cloneTemplateFields(fields: Field[]): Field[] {
  return fields.map((field) => ({
    ...field,
    enumValues: field.enumValues ? [...field.enumValues] : undefined,
  }));
}

const OVERFLOW_TABLE_QUALIFIERS = [
  "ledger",
  "archive",
  "queue",
  "stream",
  "batch",
  "mirror",
  "cache",
  "relay",
  "hub",
  "vault",
] as const;

function pickTableName(template: EntityTemplate, repeatIndex: number): string {
  if (repeatIndex === 0) {
    return template.name;
  }
  const alternate = template.alternateTableNames[repeatIndex - 1];
  if (alternate) {
    return alternate;
  }
  const overflowStep = repeatIndex - 1 - template.alternateTableNames.length;
  const a = OVERFLOW_TABLE_QUALIFIERS[overflowStep % OVERFLOW_TABLE_QUALIFIERS.length];
  const b =
    OVERFLOW_TABLE_QUALIFIERS[
      Math.floor(overflowStep / OVERFLOW_TABLE_QUALIFIERS.length) %
        OVERFLOW_TABLE_QUALIFIERS.length
    ];
  return `${template.name}_${a}_${b}`;
}

function createEntity(template: EntityTemplate, tableName: string, useComposite: boolean): Entity {
  const maxBodyColumns = MAX_COLUMNS_PER_ENTITY - (useComposite ? 1 : 0);
  const bodyFields = cloneTemplateFields(template.fields).slice(0, maxBodyColumns);
  const fields: Field[] = [...bodyFields];

  const primaryKey: string[] = [SCHEMA_FIELD_NAMES.primaryId];
  if (useComposite) {
    fields.push({
      name: SCHEMA_FIELD_NAMES.compositeCode,
      type: "string",
      nullable: false,
    });
    primaryKey.push(SCHEMA_FIELD_NAMES.compositeCode);
  }

  return {
    name: tableName,
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
    Math.round(config.compositeKeyRate * entityCount),
  );
  const compositeSlots = new Set(
    rng.shuffle(
      Array.from({ length: entityCount }, (_, entityIndex) => entityIndex),
    ).slice(0, compositeTarget),
  );

  const templateRepeatIndex = new Map<string, number>();
  const entities = Array.from({ length: entityCount }, (_, i) => {
    const template = templates[i % templates.length];
    const repeat = templateRepeatIndex.get(template.name) ?? 0;
    templateRepeatIndex.set(template.name, repeat + 1);
    const tableName = pickTableName(template, repeat);
    return createEntity(template, tableName, compositeSlots.has(i));
  });
  const relationships = generateRelationships(entities, config, rng);
  const schema: Schema = { entities, relationships };
  ensureRelationshipForeignKeys(entities, schema);
  return schema;
}

type EntityTemplate = (typeof ENTITY_TEMPLATES)[number];
