import {
  type Entity,
  type Field,
  type FieldType,
  type GeneratorConfig,
  type Schema,
} from "@/src/core/schema/schema.model";
import {
  ENTITY_TEMPLATES,
  EXTENSION_FIELDS,
} from "@/src/constants/schema/entity-templates.constants";
import {
  ENUM_VALUE_RANGE,
  SCHEMA_FIELD_NAMES,
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

function createEntity(
  template: EntityTemplate,
  index: number,
  config: GeneratorConfig,
  rng: SeededRandom,
): Entity {
  const fields: Field[] = template.fields.map((field) =>
    createField(field.name, field.type, field.nullable, rng),
  );
  const name = index < ENTITY_TEMPLATES.length ? template.name : `${template.name}_${index + 1}`;

  const extensionPool = rng.shuffle(EXTENSION_FIELDS);
  while (fields.length < config.fieldsPerEntity && extensionPool.length > 0) {
    const extension = extensionPool.pop();
    if (!extension) {
      break;
    }
    if (fields.some((field) => field.name === extension.name)) {
      continue;
    }
    fields.push({
      ...extension,
      nullable: extension.nullable || rng.bool(config.optionalFieldRate),
    });
  }

  const primaryKey: string[] = [SCHEMA_FIELD_NAMES.primaryId];
  if (rng.bool(config.compositeKeyRate)) {
    fields.push({
      name: SCHEMA_FIELD_NAMES.compositeCode,
      type: "string",
      nullable: false,
    });
    primaryKey.push(SCHEMA_FIELD_NAMES.compositeCode);
  }

  return {
    name,
    fields,
    primaryKey,
  };
}

function ensureRelationshipForeignKeys(
  entities: Entity[],
  schema: Schema,
): void {
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
  const entities = Array.from({ length: config.entityCount }, (_, i) => {
    const template = templates[i % templates.length];
    return createEntity(template, i, config, rng);
  });
  const relationships = generateRelationships(entities, config, rng);
  const schema: Schema = { entities, relationships };
  ensureRelationshipForeignKeys(entities, schema);
  return schema;
}

type EntityTemplate = (typeof ENTITY_TEMPLATES)[number];
