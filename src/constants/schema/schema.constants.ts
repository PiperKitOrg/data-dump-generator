import type { FieldType } from "@/src/core/schema/schema.model";

export const SCHEMA_FIELD_NAMES = {
  primaryId: "id",
  compositeCode: "code",
  fieldPrefix: "field_",
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

export const ENUM_VALUE_RANGE = {
  min: 3,
  max: 6,
} as const;
