"use client";

import { useMemo, useState } from "react";
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
  const [showAllTables, setShowAllTables] = useState(false);
  const entitiesToRender = useMemo(() => {
    if (!schema) {
      return [];
    }
    return showAllTables ? schema.entities : schema.entities.slice(0, 8);
  }, [schema, showAllTables]);

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
    <Panel
      title="Step 2: Review Schema"
      subtitle="Quickly check table shape and insert sequence."
    >
      <div className="grid gap-2 text-sm sm:grid-cols-3">
        <div className="rounded-md border border-black/10 px-3 py-2 dark:border-white/20">
          Tables: <strong>{schema.entities.length}</strong>
        </div>
        <div className="rounded-md border border-black/10 px-3 py-2 dark:border-white/20">
          Relationships: <strong>{schema.relationships.length}</strong>
        </div>
        <div className="rounded-md border border-black/10 px-3 py-2 dark:border-white/20">
          Deferred: <strong>{plan.deferredRelations.length}</strong>
        </div>
        <div className="rounded-md border border-black/10 px-3 py-2 dark:border-white/20">
          Many-to-many: <strong>{manyToManyCount}</strong>
        </div>
        <div className="rounded-md border border-black/10 px-3 py-2 dark:border-white/20">
          Self refs: <strong>{selfRefCount}</strong>
        </div>
        <div className="rounded-md border border-black/10 px-3 py-2 dark:border-white/20">
          Composite PKs: <strong>{compositePkCount}</strong>
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-sm font-medium">Insert order</p>
        <div className="flex flex-wrap gap-2">
          {plan.insertOrder.map((entityName, idx) => (
            <span
              key={`${entityName}-${idx}`}
              className="rounded-full border border-black/15 px-2 py-1 text-xs dark:border-white/25"
            >
              {idx + 1}. {entityName}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-md border border-black/10 dark:border-white/20">
        <div className="max-h-72 overflow-auto p-3">
          <div className="grid gap-3">
            {entitiesToRender.map((entity) => (
              <article
                key={entity.name}
                className="rounded-md border border-black/10 p-3 dark:border-white/20"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold">{entity.name}</h3>
                  <span className="text-xs opacity-75">
                    {entity.fields.length} columns
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {entity.fields.map((field) => (
                    <span
                      key={`${entity.name}-${field.name}`}
                      className="rounded-full bg-black/5 px-2 py-1 text-xs dark:bg-white/10"
                      title={field.nullable ? "nullable" : "required"}
                    >
                      {field.name}
                      <span className="opacity-70">:{field.type}</span>
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>

        {schema.entities.length > 8 ? (
          <div className="border-t border-black/10 p-2 dark:border-white/20">
            <button
              type="button"
              className="cursor-pointer rounded-md border px-3 py-1.5 text-xs"
              onClick={() => setShowAllTables((prev) => !prev)}
            >
              {showAllTables ? "Show less" : `Show all (${schema.entities.length})`}
            </button>
          </div>
        ) : null}
      </div>

      <button
        className="mt-4 cursor-pointer rounded-md bg-black px-4 py-2 text-white hover:opacity-90 dark:bg-white dark:text-black"
        type="button"
        onClick={onGenerateData}
      >
        Generate Data
      </button>

      {data ? <p className="mt-2 text-sm text-green-700 dark:text-green-400">Data generated.</p> : null}
    </Panel>
  );
}
