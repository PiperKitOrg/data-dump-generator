import type { DataSet } from "@/src/core/data/data.model";
import type { FieldType, Schema } from "@/src/core/schema/schema.model";
import {
  EXPORT_BANNER,
  SQL_NULL_LITERAL,
} from "@/src/constants/exporters/exporter.constants";
import { SQLITE_TYPE_BY_FIELD_TYPE } from "@/src/constants/exporters/sqlite.constants";
import type { DialectExporter } from "@/src/exporters/exporter.types";

function mapType(fieldType: FieldType): string {
  return SQLITE_TYPE_BY_FIELD_TYPE[fieldType] ?? "TEXT";
}

function quote(value: unknown): string {
  if (value === null || value === undefined) {
    return SQL_NULL_LITERAL;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (typeof value === "object") {
    return `'${JSON.stringify(value).replaceAll("'", "''")}'`;
  }
  return `'${String(value).replaceAll("'", "''")}'`;
}

export class SqliteExporter implements DialectExporter {
  export(schema: Schema, data: DataSet): string {
    const stmts: string[] = [EXPORT_BANNER.sqlite];

    for (const entity of schema.entities) {
      const columns = entity.fields.map((field) => {
        const nullable = field.nullable ? "" : " NOT NULL";
        return `  "${field.name}" ${mapType(field.type)}${nullable}`;
      });
      columns.push(
        `  PRIMARY KEY (${entity.primaryKey.map((key) => `"${key}"`).join(", ")})`,
      );
      stmts.push(`CREATE TABLE "${entity.name}" (\n${columns.join(",\n")}\n);`);
    }

    for (const entity of schema.entities) {
      const rows = data[entity.name] ?? [];
      for (const row of rows) {
        const columns = Object.keys(row).map((name) => `"${name}"`);
        const values = Object.values(row).map((value) => quote(value));
        stmts.push(
          `INSERT INTO "${entity.name}" (${columns.join(", ")}) VALUES (${values.join(", ")});`,
        );
      }
    }

    return `${stmts.join("\n\n")}\n`;
  }
}
