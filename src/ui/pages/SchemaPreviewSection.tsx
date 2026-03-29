import type { DataSet, DependencyPlan } from "@/src/core/data/data.model";
import type { Schema } from "@/src/core/schema/schema.model";
import { Panel } from "@/src/ui/components/Panel";

type Props = {
  schema: Schema | null;
  plan: DependencyPlan | null;
  data: DataSet | null;
  onGenerateData: () => void;
};

export function SchemaPreviewSection({ schema, plan, data, onGenerateData }: Props) {
  if (!schema || !plan) {
    return null;
  }

  const manyToManyCount = schema.relationships.filter(
    (relationship) => relationship.type === "many-to-many",
  ).length;
  const selfRefCount = schema.relationships.filter(
    (relationship) => relationship.type === "self",
  ).length;
  const compositePkCount = schema.entities.filter(
    (entity) => entity.primaryKey.length > 1,
  ).length;

  return (
    <Panel title="Step 2: Review Schema" subtitle="Check table names and relationships before data generation.">
      <div className="grid gap-2 text-sm md:grid-cols-2">
        <p>Entities: {schema.entities.length}</p>
        <p>Relationships: {schema.relationships.length}</p>
        <p>Many-to-many: {manyToManyCount}</p>
        <p>Self refs: {selfRefCount}</p>
        <p>Composite PKs: {compositePkCount}</p>
        <p>Deferred relations: {plan.deferredRelations.length}</p>
      </div>

      <p className="mt-3 text-sm">
        Insert order: <span className="font-mono">{plan.insertOrder.join(" -> ")}</span>
      </p>

      <div className="mt-4 max-h-52 overflow-auto rounded-md border border-black/10 p-3 text-sm dark:border-white/20">
        {schema.entities.slice(0, 8).map((entity) => (
          <p key={entity.name} className="mb-1">
            <strong>{entity.name}</strong>:{" "}
            {entity.fields
              .slice(0, 8)
              .map((field) => `${field.name}:${field.type}`)
              .join(", ")}
          </p>
        ))}
        {schema.entities.length > 8 ? <p>...and more entities</p> : null}
      </div>

      <button
        className="mt-4 rounded-md bg-black px-4 py-2 text-white hover:opacity-90 dark:bg-white dark:text-black"
        type="button"
        onClick={onGenerateData}
      >
        Generate Data
      </button>

      {data ? <p className="mt-2 text-sm text-green-700 dark:text-green-400">Data generated.</p> : null}
    </Panel>
  );
}
