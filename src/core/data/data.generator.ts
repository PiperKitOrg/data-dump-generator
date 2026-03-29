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
      return Number(`${100000 + rowIndex}`);
    case "float":
      return Number((rng.next() * 1000).toFixed(2));
    case "decimal":
      return Number((rng.next() * 10000).toFixed(4));
    case "boolean":
      return rng.bool();
    case "text":
      return `text_${entityName}_${rowIndex + 1}`;
    case "date":
      return new Date(2024, 0, 1 + (rowIndex % 27)).toISOString().slice(0, 10);
    case "timestamp":
      return new Date(2024, 0, 1 + (rowIndex % 27), rng.int(0, 23)).toISOString();
    case "json":
      return {
        row: rowIndex + 1,
        entity: entityName,
        flag: rng.bool(),
      };
    case "enum":
      return field.enumValues?.length ? rng.pick(field.enumValues) : "v_1";
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
  const pkName = toEntity?.primaryKey[0] ?? "id";

  for (const row of fromRows) {
    if (relationship.nullable && rng.bool(0.25)) {
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
        if (field.nullable && rng.bool(0.15)) {
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
