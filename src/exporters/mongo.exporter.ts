import type { DataSet } from "@/src/core/data/data.model";
import type { Schema } from "@/src/core/schema/schema.model";
import {
  EXPORT_BANNER,
  MONGO_NULL_LITERAL,
} from "@/src/constants/exporters/exporter.constants";
import type { DialectExporter } from "@/src/exporters/exporter.types";

function toMongoLiteral(value: unknown): string {
  if (value === null || value === undefined) {
    return MONGO_NULL_LITERAL;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return JSON.stringify(String(value));
}

export class MongoExporter implements DialectExporter {
  export(schema: Schema, data: DataSet): string {
    const lines: string[] = [EXPORT_BANNER.mongo];

    for (const entity of schema.entities) {
      const rows = data[entity.name] ?? [];
      if (rows.length === 0) {
        continue;
      }
      const docs = rows.map((row) => {
        const entries = Object.entries(row).map(
          ([key, value]) => `"${key}": ${toMongoLiteral(value)}`,
        );
        return `{ ${entries.join(", ")} }`;
      });
      lines.push(`db.getCollection("${entity.name}").insertMany([`);
      lines.push(`  ${docs.join(",\n  ")}`);
      lines.push("]);");
      lines.push("");
    }

    return `${lines.join("\n").trimEnd()}\n`;
  }
}
