import {
  type Entity,
  type Field,
  type FieldType,
  type GeneratorConfig,
  type Schema,
} from "@/src/core/schema/schema.model";
import { generateRelationships } from "@/src/core/schema/relationship.generator";
import { SeededRandom } from "@/src/utils/seededRandom";

const SCALAR_TYPES: FieldType[] = [
  "int",
  "bigint",
  "float",
  "decimal",
  "boolean",
  "string",
  "text",
  "date",
  "timestamp",
];

function createField(
  name: string,
  type: FieldType,
  nullable: boolean,
  rng: SeededRandom,
): Field {
  if (type !== "enum") {
    return { name, type, nullable };
  }

  const enumSize = rng.int(3, 6);
  const enumValues = Array.from({ length: enumSize }, (_, i) => `v_${i + 1}`);
  return {
    name,
    type,
    nullable,
    enumValues,
  };
}

function chooseFieldType(config: GeneratorConfig, rng: SeededRandom): FieldType {
  if (rng.bool(config.enumRate)) {
    return "enum";
  }
  if (rng.bool(config.jsonRate)) {
    return "json";
  }
  return rng.pick(SCALAR_TYPES);
}

function createEntity(index: number, config: GeneratorConfig, rng: SeededRandom): Entity {
  const name = `entity_${index + 1}`;
  const fields: Field[] = [
    {
      name: "id",
      type: "uuid",
      nullable: false,
    },
  ];

  const additionalFields = Math.max(1, config.fieldsPerEntity - 1);
  for (let i = 0; i < additionalFields; i += 1) {
    const fieldName = `field_${i + 1}`;
    const fieldType = chooseFieldType(config, rng);
    const nullable = rng.bool(config.optionalFieldRate);
    fields.push(createField(fieldName, fieldType, nullable, rng));
  }

  const primaryKey = ["id"];
  if (rng.bool(config.compositeKeyRate)) {
    fields.push({
      name: "code",
      type: "string",
      nullable: false,
    });
    primaryKey.push("code");
  }

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
  const entities = Array.from({ length: config.entityCount }, (_, i) =>
    createEntity(i, config, rng),
  );
  const relationships = generateRelationships(entities, config, rng);
  const schema: Schema = { entities, relationships };
  ensureRelationshipForeignKeys(entities, schema);
  return schema;
}
