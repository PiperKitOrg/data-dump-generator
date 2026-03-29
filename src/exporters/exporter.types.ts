import type { DataSet } from "@/src/core/data/data.model";
import type { Schema } from "@/src/core/schema/schema.model";

export interface DialectExporter {
  export(schema: Schema, data: DataSet): string;
}
