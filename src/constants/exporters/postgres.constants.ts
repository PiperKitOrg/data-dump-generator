import type { FieldType } from "@/src/core/schema/schema.model";

export const POSTGRES_TYPE_BY_FIELD_TYPE: Record<FieldType, string> = {
  uuid: "UUID",
  int: "INTEGER",
  bigint: "BIGINT",
  float: "REAL",
  decimal: "DECIMAL(18,4)",
  boolean: "BOOLEAN",
  string: "VARCHAR(255)",
  text: "TEXT",
  date: "DATE",
  timestamp: "TIMESTAMP",
  json: "JSONB",
  enum: "TEXT",
};
