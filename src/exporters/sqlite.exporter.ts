import type { DataSet } from "@/src/core/data/data.model";
import type { FieldType, Relationship, Schema } from "@/src/core/schema/schema.model";
import {
  EXPORT_BANNER,
  PROJECT_REMARK,
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
    const stmts: string[] = [
      `-- ${PROJECT_REMARK}`,
      EXPORT_BANNER.sqlite,
      "PRAGMA foreign_keys = ON;",
    ];

    const relationshipsByFromEntity = new Map<string, Relationship[]>();
    for (const relationship of schema.relationships) {
      if (relationship.type === "many-to-many") {
        continue;
      }
      const list = relationshipsByFromEntity.get(relationship.fromEntity) ?? [];
      list.push(relationship);
      relationshipsByFromEntity.set(relationship.fromEntity, list);
    }

    for (const entity of schema.entities) {
      const columns = entity.fields.map((field) => {
        const nullable = field.nullable ? "" : " NOT NULL";
        return `  "${field.name}" ${mapType(field.type)}${nullable}`;
      });
      columns.push(
        `  PRIMARY KEY (${entity.primaryKey.map((key) => `"${key}"`).join(", ")})`
      );
      for (const relationship of relationshipsByFromEntity.get(entity.name) ?? []) {
        columns.push(
          `  FOREIGN KEY ("${relationship.fkField}") REFERENCES "${relationship.toEntity}" ("id")`,
        );
      }
      stmts.push(`CREATE TABLE "${entity.name}" (\n${columns.join(",\n")}\n);`);
    }
    for (const relationship of schema.relationships) {
      if (relationship.type !== "many-to-many" || !relationship.joinTable) {
        continue;
      }
      const fromFk = `${relationship.fromEntity.toLowerCase()}_id`;
      const toFk = `${relationship.toEntity.toLowerCase()}_id`;
      stmts.push(
        `CREATE TABLE "${relationship.joinTable}" (\n` +
          `  "${fromFk}" TEXT NOT NULL,\n` +
          `  "${toFk}" TEXT NOT NULL,\n` +
          `  PRIMARY KEY ("${fromFk}", "${toFk}"),\n` +
          `  FOREIGN KEY ("${fromFk}") REFERENCES "${relationship.fromEntity}" ("id"),\n` +
          `  FOREIGN KEY ("${toFk}") REFERENCES "${relationship.toEntity}" ("id")\n` +
          `);`,
      );
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
    for (const relationship of schema.relationships) {
      if (relationship.type !== "many-to-many" || !relationship.joinTable) {
        continue;
      }
      const rows = data[relationship.joinTable] ?? [];
      for (const row of rows) {
        const columns = Object.keys(row).map((name) => `"${name}"`);
        const values = Object.values(row).map((value) => quote(value));
        stmts.push(
          `INSERT INTO "${relationship.joinTable}" (${columns.join(", ")}) VALUES (${values.join(", ")});`,
        );
      }
    }

    return `${stmts.join("\n\n")}\n`;
  }
}
