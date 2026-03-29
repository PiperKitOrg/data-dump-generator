export type FieldType =
  | "uuid"
  | "int"
  | "bigint"
  | "float"
  | "decimal"
  | "boolean"
  | "string"
  | "text"
  | "date"
  | "timestamp"
  | "json"
  | "enum";

export type RelationshipType =
  | "one-to-many"
  | "many-to-many"
  | "one-to-one"
  | "self";

export type ComplexityPreset = "easy" | "medium" | "hard";

export type Field = {
  name: string;
  type: FieldType;
  nullable: boolean;
  enumValues?: string[];
};

export type Entity = {
  name: string;
  fields: Field[];
  primaryKey: string[];
  uniques?: string[][];
  indexes?: string[][];
};

export type Relationship = {
  type: RelationshipType;
  fromEntity: string;
  toEntity: string;
  fkField: string;
  nullable: boolean;
  joinTable?: string;
};

export type Schema = {
  entities: Entity[];
  relationships: Relationship[];
};

export type GeneratorConfig = {
  entityCount: number;
  fieldsPerEntity: number;
  relationshipDensity: number;
  manyToManyCount: number;
  selfRefCount: number;
  compositeKeyRate: number;
  enumRate: number;
  jsonRate: number;
  optionalFieldRate: number;
  includeCycles: boolean;
};
