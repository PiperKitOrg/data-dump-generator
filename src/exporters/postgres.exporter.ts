import type { DataSet } from "@/src/core/data/data.model";
import type { FieldType, Relationship, Schema } from "@/src/core/schema/schema.model";
import {
  EXPORT_BANNER,
  PROJECT_REMARK,
  SQL_NULL_LITERAL,
} from "@/src/constants/exporters/exporter.constants";
import { POSTGRES_TYPE_BY_FIELD_TYPE } from "@/src/constants/exporters/postgres.constants";
import type { DialectExporter } from "@/src/exporters/exporter.types";

function mapType(fieldType: FieldType): string {
  return POSTGRES_TYPE_BY_FIELD_TYPE[fieldType] ?? "VARCHAR(255)";
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

function createTableStatements(schema: Schema): string[] {
  const stmts: string[] = [];
  for (const entity of schema.entities) {
    const columns = entity.fields.map((field) => {
      const nullable = field.nullable ? "" : " NOT NULL";
      return `  "${field.name}" ${mapType(field.type)}${nullable}`;
    });
    const pk = entity.primaryKey.map((key) => `"${key}"`).join(", ");
    columns.push(`  PRIMARY KEY (${pk})`);
    for (const unique of entity.uniques ?? []) {
      columns.push(`  UNIQUE (${unique.map((key) => `"${key}"`).join(", ")})`);
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
        `  "${fromFk}" VARCHAR(255) NOT NULL,\n` +
        `  "${toFk}" VARCHAR(255) NOT NULL,\n` +
        `  PRIMARY KEY ("${fromFk}", "${toFk}")\n` +
        `);`,
    );
  }
  return stmts;
}

function createForeignKeyStatements(schema: Schema): string[] {
  const stmts: string[] = [];
  const directedRelationships = schema.relationships.filter(
    (relationship) => relationship.type !== "many-to-many",
  );
  for (const relationship of directedRelationships) {
    stmts.push(
      `ALTER TABLE "${relationship.fromEntity}" ADD CONSTRAINT "fk_${relationship.fromEntity.toLowerCase()}_${relationship.fkField.toLowerCase()}" ` +
        `FOREIGN KEY ("${relationship.fkField}") REFERENCES "${relationship.toEntity}" ("id");`,
    );
  }
  for (const relationship of schema.relationships) {
    if (relationship.type !== "many-to-many" || !relationship.joinTable) {
      continue;
    }
    stmts.push(...createManyToManyConstraints(relationship));
  }
  return stmts;
}

function createManyToManyConstraints(relationship: Relationship): string[] {
  if (!relationship.joinTable) {
    return [];
  }
  const fromFk = `${relationship.fromEntity.toLowerCase()}_id`;
  const toFk = `${relationship.toEntity.toLowerCase()}_id`;
  return [
    `ALTER TABLE "${relationship.joinTable}" ADD CONSTRAINT "fk_${relationship.joinTable.toLowerCase()}_${fromFk}" ` +
      `FOREIGN KEY ("${fromFk}") REFERENCES "${relationship.fromEntity}" ("id");`,
    `ALTER TABLE "${relationship.joinTable}" ADD CONSTRAINT "fk_${relationship.joinTable.toLowerCase()}_${toFk}" ` +
      `FOREIGN KEY ("${toFk}") REFERENCES "${relationship.toEntity}" ("id");`,
  ];
}

function insertStatements(schema: Schema, data: DataSet): string[] {
  const stmts: string[] = [];
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
  return stmts;
}

export class PostgresExporter implements DialectExporter {
  export(schema: Schema, data: DataSet): string {
    const sections: string[] = [
      `-- ${PROJECT_REMARK}`,
      EXPORT_BANNER.postgres,
      ...createTableStatements(schema),
      ...createForeignKeyStatements(schema),
      ...insertStatements(schema, data),
    ];
    return `${sections.join("\n\n")}\n`;
  }
}
