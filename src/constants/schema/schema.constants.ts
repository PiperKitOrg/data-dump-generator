import type { FieldType } from "@/src/core/schema/schema.model";

export const MAX_COLUMNS_PER_ENTITY = 40;

export const SCHEMA_FIELD_NAMES = {
  primaryId: "id",
  compositeCode: "code",
  entityPrefix: "entity_",
  enumPrefix: "v_",
} as const;

export const SCALAR_FIELD_TYPES: FieldType[] = [
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

