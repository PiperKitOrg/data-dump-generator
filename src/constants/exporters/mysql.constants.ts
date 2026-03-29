import type { FieldType } from "@/src/core/schema/schema.model";

export const MYSQL_TYPE_BY_FIELD_TYPE: Record<FieldType, string> = {
  uuid: "CHAR(36)",
  int: "INT",
  bigint: "BIGINT",
  float: "FLOAT",
  decimal: "DECIMAL(18,4)",
  boolean: "BOOLEAN",
  string: "VARCHAR(255)",
  text: "TEXT",
  date: "DATE",
  timestamp: "DATETIME",
  json: "JSON",
  enum: "VARCHAR(64)",
};
