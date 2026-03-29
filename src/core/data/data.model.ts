import type { Relationship, Schema } from "@/src/core/schema/schema.model";

export type PrimitiveValue =
  | string
  | number
  | boolean
  | null
  | Record<string, unknown>;

export type DataRow = Record<string, PrimitiveValue>;

export type DataSet = {
  [entityName: string]: DataRow[];
};

export type DependencyPlan = {
  insertOrder: string[];
  deferredRelations: Relationship[];
};

export type GenerateSchema = (config: GeneratorConfig, seed: number) => Schema;

export type GenerateData = (
  schema: Schema,
  plan: DependencyPlan,
  rowsPerEntity: number,
  seed: number,
) => DataSet;

type GeneratorConfig = import("@/src/core/schema/schema.model").GeneratorConfig;
