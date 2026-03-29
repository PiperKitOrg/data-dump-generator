import type {
  DataSet,
  DependencyPlan,
  GenerateData,
  PrimitiveValue,
} from "@/src/core/data/data.model";
import type {
  Entity,
  Field,
  Relationship,
  Schema,
} from "@/src/core/schema/schema.model";
import { DATA_GENERATOR_DEFAULTS } from "@/src/constants/data/data.constants";
import { SCHEMA_FIELD_NAMES } from "@/src/constants/schema/schema.constants";
import { SeededRandom } from "@/src/utils/seededRandom";

function valueForField(
  field: Field,
  entityName: string,
  rowIndex: number,
  rng: SeededRandom,
): PrimitiveValue {
  switch (field.type) {
    case "uuid":
      return `${entityName}-${rowIndex + 1}`;
    case "int":
      return rowIndex + 1;
    case "bigint":
      return Number(`${DATA_GENERATOR_DEFAULTS.bigintBase + rowIndex}`);
    case "float":
      return Number(
        (rng.next() * DATA_GENERATOR_DEFAULTS.floatMax).toFixed(
          DATA_GENERATOR_DEFAULTS.decimalPlacesFloat,
        ),
      );
    case "decimal":
      return Number(
        (rng.next() * DATA_GENERATOR_DEFAULTS.decimalMax).toFixed(
          DATA_GENERATOR_DEFAULTS.decimalPlacesDecimal,
        ),
      );
    case "boolean":
      return rng.bool();
    case "text":
      return `text_${entityName}_${rowIndex + 1}`;
    case "date":
      return new Date(
        DATA_GENERATOR_DEFAULTS.baseYear,
        DATA_GENERATOR_DEFAULTS.baseMonthIndex,
        1 + (rowIndex % DATA_GENERATOR_DEFAULTS.dayCycle),
      )
        .toISOString()
        .slice(0, 10);
    case "timestamp":
      return new Date(
        DATA_GENERATOR_DEFAULTS.baseYear,
        DATA_GENERATOR_DEFAULTS.baseMonthIndex,
        1 + (rowIndex % DATA_GENERATOR_DEFAULTS.dayCycle),
        rng.int(0, DATA_GENERATOR_DEFAULTS.maxHour),
      ).toISOString();
    case "json":
      return {
        row: rowIndex + 1,
        entity: entityName,
        flag: rng.bool(),
      };
    case "enum":
      return field.enumValues?.length
        ? rng.pick(field.enumValues)
        : DATA_GENERATOR_DEFAULTS.enumFallbackValue;
    case "string":
    default:
      return `${field.name}_${rowIndex + 1}`;
  }
}

function setRelationshipForeignKey(
  data: DataSet,
  relationship: Relationship,
  byEntityName: Map<string, Entity>,
  rng: SeededRandom,
): void {
  if (relationship.type === "many-to-many") {
    return;
  }
  const fromRows = data[relationship.fromEntity] ?? [];
  const toRows = data[relationship.toEntity] ?? [];
  if (!fromRows.length || !toRows.length) {
    return;
  }

  const toEntity = byEntityName.get(relationship.toEntity);
  const pkName = toEntity?.primaryKey[0] ?? SCHEMA_FIELD_NAMES.primaryId;

  for (const row of fromRows) {
    if (
      relationship.nullable &&
      rng.bool(DATA_GENERATOR_DEFAULTS.nullableFkNullRate)
    ) {
      row[relationship.fkField] = null;
      continue;
    }
    const target = rng.pick(toRows);
    row[relationship.fkField] = (target[pkName] ?? null) as PrimitiveValue;
  }
}

export const generateData: GenerateData = (
  schema: Schema,
  plan: DependencyPlan,
  rowsPerEntity: number,
  seed: number,
): DataSet => {
  const rng = new SeededRandom(seed);
  const byEntityName = new Map(schema.entities.map((entity) => [entity.name, entity]));
  const order =
    plan.insertOrder.length > 0
      ? plan.insertOrder
      : schema.entities.map((entity) => entity.name);

  const data: DataSet = {};

  for (const entityName of order) {
    const entity = byEntityName.get(entityName);
    if (!entity) {
      continue;
    }

    data[entityName] = Array.from({ length: rowsPerEntity }, (_, rowIndex) => {
      const row: Record<string, PrimitiveValue> = {};

      for (const keyField of entity.primaryKey) {
        row[keyField] = `${entity.name}-${keyField}-${rowIndex + 1}`;
      }

      for (const field of entity.fields) {
        if (row[field.name] !== undefined) {
          continue;
        }
        if (
          field.nullable &&
          rng.bool(DATA_GENERATOR_DEFAULTS.nullableFieldNullRate)
        ) {
          row[field.name] = null;
          continue;
        }
        row[field.name] = valueForField(field, entity.name, rowIndex, rng);
      }
      return row;
    });
  }

  const deferred = new Set(
    plan.deferredRelations.map(
      (rel) => `${rel.type}:${rel.fromEntity}:${rel.toEntity}:${rel.fkField}`,
    ),
  );

  for (const relationship of schema.relationships) {
    const key = `${relationship.type}:${relationship.fromEntity}:${relationship.toEntity}:${relationship.fkField}`;
    if (deferred.has(key)) {
      continue;
    }
    setRelationshipForeignKey(data, relationship, byEntityName, rng);
  }

  for (const relationship of plan.deferredRelations) {
    setRelationshipForeignKey(data, relationship, byEntityName, rng);
  }

  return data;
};
