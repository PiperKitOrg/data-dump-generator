"use client";

import { useMemo, useState } from "react";
import type { DataSet, DependencyPlan } from "@/src/core/data/data.model";
import type { Schema } from "@/src/core/schema/schema.model";

/** Emoji arrows for relationship chips (avoid ASCII <-> and ->). */
const ARROW_TO = "➡️";
const ARROW_BIDI = "↔️";

type Props = {
  schema: Schema | null;
  plan: DependencyPlan | null;
  data: DataSet | null;
  onGenerateData: () => void;
};

export function SchemaPreviewSection({ schema, plan, data, onGenerateData }: Props) {
  const [showAllTables, setShowAllTables] = useState(false);

  const entitiesToRender = useMemo(() => {
    if (!schema) return [];
    return showAllTables ? schema.entities : schema.entities.slice(0, 8);
  }, [schema, showAllTables]);

  if (!schema || !plan) return null;

  const manyToManyCount = schema.relationships.filter((r) => r.type === "many-to-many").length;
  const selfRefCount = schema.relationships.filter((r) => r.type === "self").length;
  const compositePkCount = schema.entities.filter((e) => e.primaryKey.length > 1).length;

  const stats = [
    { label: "Tables", value: schema.entities.length },
    { label: "Relations", value: schema.relationships.length },
    { label: "Deferred", value: plan.deferredRelations.length },
    { label: "M2M", value: manyToManyCount },
    { label: "Self Refs", value: selfRefCount },
    { label: "Composite PKs", value: compositePkCount },
  ];

  return (
    <div className="piper-panel">
      <div className="piper-panel-header">
        <div>
          <div className="piper-panel-step">STEP 02</div>
          <h2 className="piper-panel-title">Review Schema</h2>
          <p className="piper-panel-subtitle">Check table shape and insert sequence.</p>
        </div>
        {data && (
          <span className="piper-success piper-success-inline">
            ✓ Data ready
          </span>
        )}
      </div>

      <div className="piper-panel-body">
        <div className="piper-stats-grid">
          {stats.map(({ label, value }) => (
            <div className="piper-stat" key={label}>
              <span className="piper-stat-label">{label}</span>
              <span className="piper-stat-value">{value}</span>
            </div>
          ))}
        </div>

        <div className="piper-section-label">Insert order</div>
        <div className="piper-insert-order">
          {plan.insertOrder.map((entityName, idx) => (
            <span key={`${entityName}-${idx}`} className="piper-tag piper-tag-accent">
              {idx + 1}. {entityName}
            </span>
          ))}
        </div>

        <div className="piper-section-label">Relationships</div>
        <div className="piper-relationships">
          {schema.relationships.length === 0 ? (
            <span className="piper-relationships-empty">No relationships generated.</span>
          ) : (
            schema.relationships.map((rel, idx) => (
              <span
                key={`${rel.type}-${rel.fromEntity}-${rel.toEntity}-${idx}`}
                className="piper-tag"
              >
                {rel.type === "many-to-many" && rel.joinTable
                  ? `${rel.fromEntity} ${ARROW_BIDI} ${rel.toEntity} · via ${rel.joinTable}`
                  : `${rel.fromEntity}.${rel.fkField} ${ARROW_TO} ${rel.toEntity} (${rel.type})`}
              </span>
            ))
          )}
        </div>

        <div className="piper-section-label">Tables</div>
        <div className="piper-tables-scroll">
          {entitiesToRender.map((entity) => (
            <div key={entity.name} className="piper-entity">
              <div className="piper-entity-header">
                <span className="piper-entity-name">{entity.name}</span>
                <span className="piper-entity-count">{entity.fields.length} cols</span>
              </div>
              <div className="piper-field-row">
                {entity.fields.map((field) => (
                  <span
                    key={`${entity.name}-${field.name}`}
                    className="piper-field"
                    title={field.nullable ? "nullable" : "required"}
                  >
                    {field.name}
                    <span className="piper-field-type">:{field.type}</span>
                    {field.nullable && <span className="piper-field-nullable">?</span>}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {schema.entities.length > 8 && (
          <button
            type="button"
            className="piper-btn-export piper-btn-tables-toggle"
            onClick={() => setShowAllTables((prev) => !prev)}
          >
            {showAllTables
              ? "▲ Show fewer tables"
              : `▼ Show all ${schema.entities.length} tables`}
          </button>
        )}

        <button className="piper-btn-primary" type="button" onClick={onGenerateData}>
          <span>◈</span> Generate Data
        </button>

        {data && (
          <div className="piper-success">
            <span>✓</span> {Object.keys(data).length} tables · data generated successfully
          </div>
        )}
      </div>
    </div>
  );
}
