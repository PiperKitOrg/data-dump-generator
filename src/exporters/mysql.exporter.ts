import type { DataSet } from "@/src/core/data/data.model";
import type { FieldType, Relationship, Schema } from "@/src/core/schema/schema.model";
import {
  EXPORT_BANNER,
  PROJECT_REMARK,
  SQL_NULL_LITERAL,
} from "@/src/constants/exporters/exporter.constants";
import { MYSQL_TYPE_BY_FIELD_TYPE } from "@/src/constants/exporters/mysql.constants";
import type { DialectExporter } from "@/src/exporters/exporter.types";

function mapType(fieldType: FieldType): string {
  return MYSQL_TYPE_BY_FIELD_TYPE[fieldType] ?? "VARCHAR(255)";
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

export class MysqlExporter implements DialectExporter {
  export(schema: Schema, data: DataSet): string {
    const stmts: string[] = [`-- ${PROJECT_REMARK}`, EXPORT_BANNER.mysql];
    const idTypeByEntity = new Map(
      schema.entities.map((entity) => {
        const idField = entity.fields.find((field) => field.name === "id");
        return [entity.name, mapType(idField?.type ?? "uuid")];
      }),
    );

    for (const entity of schema.entities) {
      const columns = entity.fields.map((field) => {
        const nullable = field.nullable ? "" : " NOT NULL";
        return `  \`${field.name}\` ${mapType(field.type)}${nullable}`;
      });
      columns.push(
        `  PRIMARY KEY (${entity.primaryKey.map((key) => `\`${key}\``).join(", ")})`,
      );
      for (const unique of entity.uniques ?? []) {
        columns.push(
          `  UNIQUE (${unique.map((key) => `\`${key}\``).join(", ")})`,
        );
      }
      stmts.push(`CREATE TABLE \`${entity.name}\` (\n${columns.join(",\n")}\n);`);
    }
    for (const relationship of schema.relationships) {
      if (relationship.type !== "many-to-many" || !relationship.joinTable) {
        continue;
      }
      const fromFk = `${relationship.fromEntity.toLowerCase()}_id`;
      const toFk = `${relationship.toEntity.toLowerCase()}_id`;
      const fromType = idTypeByEntity.get(relationship.fromEntity) ?? "CHAR(36)";
      const toType = idTypeByEntity.get(relationship.toEntity) ?? "CHAR(36)";
      stmts.push(
        `CREATE TABLE \`${relationship.joinTable}\` (\n` +
          `  \`${fromFk}\` ${fromType} NOT NULL,\n` +
          `  \`${toFk}\` ${toType} NOT NULL,\n` +
          `  PRIMARY KEY (\`${fromFk}\`, \`${toFk}\`)\n` +
          `);`,
      );
    }
    for (const relationship of schema.relationships.filter(
      (relationship) => relationship.type !== "many-to-many",
    )) {
      stmts.push(
        `ALTER TABLE \`${relationship.fromEntity}\` ADD CONSTRAINT \`fk_${relationship.fromEntity.toLowerCase()}_${relationship.fkField.toLowerCase()}\` ` +
          `FOREIGN KEY (\`${relationship.fkField}\`) REFERENCES \`${relationship.toEntity}\` (\`id\`);`,
      );
    }
    for (const relationship of schema.relationships) {
      if (relationship.type !== "many-to-many" || !relationship.joinTable) {
        continue;
      }
      stmts.push(...createManyToManyConstraints(relationship));
    }

    const entityNameSet = new Set(schema.entities.map((entity) => entity.name));
    const entityInsertOrder = Object.keys(data).filter((name) => entityNameSet.has(name));
    for (const entityName of entityInsertOrder) {
      const entity = schema.entities.find((item) => item.name === entityName);
      if (!entity) {
        continue;
      }
      const rows = data[entity.name] ?? [];
      for (const row of rows) {
        const columns = Object.keys(row).map((name) => `\`${name}\``);
        const values = Object.values(row).map((value) => quote(value));
        stmts.push(
          `INSERT INTO \`${entity.name}\` (${columns.join(", ")}) VALUES (${values.join(", ")});`,
        );
      }
    }
    for (const relationship of schema.relationships) {
      if (relationship.type !== "many-to-many" || !relationship.joinTable) {
        continue;
      }
      const rows = data[relationship.joinTable] ?? [];
      for (const row of rows) {
        const columns = Object.keys(row).map((name) => `\`${name}\``);
        const values = Object.values(row).map((value) => quote(value));
        stmts.push(
          `INSERT INTO \`${relationship.joinTable}\` (${columns.join(", ")}) VALUES (${values.join(", ")});`,
        );
      }
    }

    return `${stmts.join("\n\n")}\n`;
  }
}

function createManyToManyConstraints(relationship: Relationship): string[] {
  if (!relationship.joinTable) {
    return [];
  }
  const fromFk = `${relationship.fromEntity.toLowerCase()}_id`;
  const toFk = `${relationship.toEntity.toLowerCase()}_id`;
  return [
    `ALTER TABLE \`${relationship.joinTable}\` ADD CONSTRAINT \`fk_${relationship.joinTable.toLowerCase()}_${fromFk}\` ` +
      `FOREIGN KEY (\`${fromFk}\`) REFERENCES \`${relationship.fromEntity}\` (\`id\`);`,
    `ALTER TABLE \`${relationship.joinTable}\` ADD CONSTRAINT \`fk_${relationship.joinTable.toLowerCase()}_${toFk}\` ` +
      `FOREIGN KEY (\`${toFk}\`) REFERENCES \`${relationship.toEntity}\` (\`id\`);`,
  ];
}
