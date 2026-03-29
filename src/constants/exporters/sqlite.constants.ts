import type { FieldType } from "@/src/core/schema/schema.model";

export const SQLITE_TYPE_BY_FIELD_TYPE: Record<FieldType, string> = {
  uuid: "TEXT",
  int: "INTEGER",
  bigint: "INTEGER",
  float: "REAL",
  decimal: "REAL",
  boolean: "INTEGER",
  string: "TEXT",
  text: "TEXT",
  date: "TEXT",
  timestamp: "TEXT",
  json: "TEXT",
  enum: "TEXT",
};
