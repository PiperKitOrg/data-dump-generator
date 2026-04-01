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

const FIRST_NAMES = ["Liam", "Olivia", "Noah", "Emma", "Ava", "Mason", "Mia", "Lucas"];
const LAST_NAMES = ["Nguyen", "Patel", "Johnson", "Kim", "Garcia", "Brown", "Davis", "Lee"];
const CITIES = ["San Francisco", "New York", "Seattle", "Austin", "Chicago", "Denver"];
const COUNTRIES = ["US", "CA", "GB", "DE", "JP", "AU"];
const INDUSTRIES = ["SaaS", "Retail", "Finance", "Healthcare", "Logistics", "Education"];
const PAYMENT_PROVIDERS = ["stripe", "adyen", "paypal"];
const CURRENCIES = ["USD", "EUR", "GBP", "JPY"];

function deterministicUuidLike(entityName: string, rowIndex: number, rng: SeededRandom): string {
  const hashSeed = `${entityName}:${rowIndex}:${rng.int(0, 1_000_000)}`;
  let hash = 0;
  for (let i = 0; i < hashSeed.length; i += 1) {
    hash = (hash * 31 + hashSeed.charCodeAt(i)) >>> 0;
  }
  const hex = (value: number, width: number) =>
    (value >>> 0).toString(16).padStart(width, "0").slice(-width);
  const p1 = hex((hash ^ 0xa3b1c2d3) >>> 0, 8);
  const p2 = hex((hash * 2654435761) >>> 0, 4);
  const p3 = hex(((hash >>> 8) | 0x4000) & 0xffff, 4); // version-like nibble
  const p4 = hex(((hash >>> 3) | 0x8000) & 0xffff, 4); // variant-like nibble
  const p5 = `${hex((hash ^ 0x9e3779b9) >>> 0, 8)}${hex(rowIndex + 1, 4)}`;
  return `${p1}-${p2}-${p3}-${p4}-${p5}`;
}

function valueByFieldName(
  field: Field,
  entityName: string,
  rowIndex: number,
  rng: SeededRandom,
): PrimitiveValue | undefined {
  const name = field.name.toLowerCase();
  const isStringLike = field.type === "string" || field.type === "text";
  const isNumeric = field.type === "int" || field.type === "bigint" || field.type === "float" || field.type === "decimal";
  const firstName = rng.pick(FIRST_NAMES);
  const lastName = rng.pick(LAST_NAMES);

  if (isStringLike && name.includes("email")) {
    return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${rowIndex + 1}@example.com`;
  }
  if (isStringLike && name === "first_name") return firstName;
  if (isStringLike && name === "last_name") return lastName;
  if (isStringLike && name.includes("name")) return `${firstName} ${lastName}`;
  if (isStringLike && name.includes("phone")) return `+1-415-555-${String(1000 + (rowIndex % 9000))}`;
  if (isStringLike && name.includes("city")) return rng.pick(CITIES);
  if (isStringLike && name.includes("country")) return rng.pick(COUNTRIES);
  if (isStringLike && name.includes("industry")) return rng.pick(INDUSTRIES);
  if (isStringLike && name.includes("postal_code")) return String(10000 + (rowIndex % 89999));
  if (isStringLike && name.includes("line1")) return `${100 + (rowIndex % 900)} Market Street`;
  if (isStringLike && name.includes("line2")) return `Suite ${1 + (rowIndex % 20)}`;
  if (isStringLike && name.includes("order_number")) return `ORD-${2026 + (rowIndex % 5)}-${String(rowIndex + 1).padStart(6, "0")}`;
  if (isStringLike && name.includes("invoice_number")) return `INV-${String(rowIndex + 1).padStart(7, "0")}`;
  if (isStringLike && name === "sku") return `SKU-${String(rowIndex + 1000).padStart(6, "0")}`;
  if (isStringLike && name.includes("currency")) return rng.pick(CURRENCIES);
  if (isStringLike && name.includes("provider")) return rng.pick(PAYMENT_PROVIDERS);
  if (isStringLike && name.includes("ip_address")) return `10.0.${rowIndex % 255}.${rng.int(2, 250)}`;
  if (isStringLike && name.includes("user_agent")) return "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)";
  if (isStringLike && name.includes("event_type")) return rng.pick(["user.created", "order.created", "payment.captured"]);
  if ((field.type === "enum" || isStringLike) && name.includes("status")) return rng.pick(field.enumValues ?? ["active", "pending", "disabled"]);
  if (isNumeric && (name.includes("amount") || name.includes("price") || name.includes("subtotal") || name.includes("total"))) {
    return Number((20 + rng.next() * 5000).toFixed(2));
  }
  if ((field.type === "int" || field.type === "bigint") && name.includes("quantity")) return rng.int(1, 10);
  if (isStringLike && (name.includes("description") || name.includes("body"))) {
    return `Generated ${entityName} record ${rowIndex + 1} for testing export pipelines.`;
  }
  if (isStringLike && name.includes("subject")) return `Notification ${rowIndex + 1}`;
  if (isStringLike && (name.includes("reference_code") || name.includes("plan_code"))) {
    return `REF-${String(rowIndex + 1).padStart(6, "0")}`;
  }
  return undefined;
}

function valueForField(
  field: Field,
  entityName: string,
  rowIndex: number,
  rng: SeededRandom,
): PrimitiveValue {
  const byName = valueByFieldName(field, entityName, rowIndex, rng);
  if (byName !== undefined) {
    return byName;
  }

  switch (field.type) {
    case "uuid":
      return deterministicUuidLike(entityName, rowIndex, rng);
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
        source: "dump-generator",
        entity: entityName,
        version: 1,
        index: rowIndex + 1,
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

  for (let rowIndex = 0; rowIndex < fromRows.length; rowIndex += 1) {
    const row = fromRows[rowIndex];
    if (
      relationship.nullable &&
      rng.bool(DATA_GENERATOR_DEFAULTS.nullableFkNullRate)
    ) {
      row[relationship.fkField] = null;
      continue;
    }
    // Self references must point to an already inserted row, otherwise per-row
    // INSERT order can violate the FK constraint.
    const isSameEntityReference =
      relationship.type === "self" ||
      relationship.fromEntity === relationship.toEntity;
    const targetPool = isSameEntityReference ? toRows.slice(0, rowIndex) : toRows;
    if (!targetPool.length) {
      row[relationship.fkField] = null;
      continue;
    }
    const target = rng.pick(targetPool);
    row[relationship.fkField] = (target[pkName] ?? null) as PrimitiveValue;
  }
}

function setManyToManyRows(
  data: DataSet,
  relationship: Relationship,
  byEntityName: Map<string, Entity>,
  rng: SeededRandom,
): void {
  if (relationship.type !== "many-to-many" || !relationship.joinTable) {
    return;
  }

  const fromRows = data[relationship.fromEntity] ?? [];
  const toRows = data[relationship.toEntity] ?? [];
  if (!fromRows.length || !toRows.length) {
    data[relationship.joinTable] = [];
    return;
  }

  const fromEntity = byEntityName.get(relationship.fromEntity);
  const toEntity = byEntityName.get(relationship.toEntity);
  const fromPkName = fromEntity?.primaryKey[0] ?? SCHEMA_FIELD_NAMES.primaryId;
  const toPkName = toEntity?.primaryKey[0] ?? SCHEMA_FIELD_NAMES.primaryId;
  const fromJoinField = `${relationship.fromEntity.toLowerCase()}_id`;
  const toJoinField = `${relationship.toEntity.toLowerCase()}_id`;

  const rows: DataSet[string] = [];
  const seenPairs = new Set<string>();
  for (const fromRow of fromRows) {
    const picks = Math.max(1, rng.int(1, Math.min(3, toRows.length)));
    for (let i = 0; i < picks; i += 1) {
      const toRow = rng.pick(toRows);
      const fromValue = fromRow[fromPkName];
      const toValue = toRow[toPkName];
      const pairKey = `${String(fromValue)}::${String(toValue)}`;
      if (seenPairs.has(pairKey)) {
        continue;
      }
      seenPairs.add(pairKey);
      rows.push({
        [fromJoinField]: (fromValue ?? null) as PrimitiveValue,
        [toJoinField]: (toValue ?? null) as PrimitiveValue,
      });
    }
  }

  data[relationship.joinTable] = rows;
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
        const pkField = entity.fields.find((field) => field.name === keyField);
        if (pkField?.type === "uuid") {
          row[keyField] = deterministicUuidLike(entity.name, rowIndex, rng);
        } else {
          row[keyField] = `${entity.name}-${keyField}-${rowIndex + 1}`;
        }
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

  // Deferred relations are cycle/self edges that should be applied in a later
  // update pass. We keep them unset during INSERT generation to preserve FK safety.

  for (const relationship of schema.relationships) {
    setManyToManyRows(data, relationship, byEntityName, rng);
  }

  return data;
};
