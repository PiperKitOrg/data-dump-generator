import type { DataSet } from "@/src/core/data/data.model";
import type { Schema } from "@/src/core/schema/schema.model";

type Props = {
  schema: Schema | null;
  data: DataSet | null;
  onExportPostgres: () => void;
  onExportMysql: () => void;
  onExportSqlite: () => void;
  onExportMongo: () => void;
};

const DIALECTS = [
  {
    id: "postgres",
    label: "PostgreSQL",
    icon: "🐘",
    ext: ".sql",
    description: "dump.postgres.sql",
    handler: "onExportPostgres" as const,
  },
  {
    id: "mysql",
    label: "MySQL",
    icon: "🐬",
    ext: ".sql",
    description: "dump.mysql.sql",
    handler: "onExportMysql" as const,
  },
  {
    id: "sqlite",
    label: "SQLite",
    icon: "◫",
    ext: ".sql",
    description: "dump.sqlite.sql",
    handler: "onExportSqlite" as const,
  },
  {
    id: "mongo",
    label: "MongoDB",
    icon: "🍃",
    ext: ".js",
    description: "dump.mongo.js",
    handler: "onExportMongo" as const,
  },
];

export function ExportSection({
  schema,
  data,
  onExportPostgres,
  onExportMysql,
  onExportSqlite,
  onExportMongo,
}: Props) {
  if (!schema || !data) return null;

  const handlers = { onExportPostgres, onExportMysql, onExportSqlite, onExportMongo };

  return (
    <div className="piper-panel">
      <div className="piper-panel-header">
        <div>
          <div className="piper-panel-step">STEP 03</div>
          <h2 className="piper-panel-title">Export</h2>
          <p className="piper-panel-subtitle">Download generated dumps for each supported dialect.</p>
        </div>
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: 11,
            color: "var(--c-accent)",
            background: "var(--c-accent-dim)",
            border: "1px solid rgba(232,255,110,0.25)",
            borderRadius: 4,
            padding: "4px 10px",
            whiteSpace: "nowrap",
          }}
        >
          ✓ Ready to export
        </span>
      </div>

      <div className="piper-panel-body">
        <div className="piper-section-label">Choose dialect</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
          {DIALECTS.map((dialect) => (
            <button
              key={dialect.id}
              type="button"
              className="piper-btn-export"
              onClick={handlers[dialect.handler]}
            >
              <span className="piper-btn-export-icon">{dialect.icon}</span>
              <span style={{ flex: 1 }}>
                <span style={{ display: "block", fontWeight: 600, fontSize: 13 }}>
                  {dialect.label}
                </span>
                <span style={{ fontSize: 10, opacity: 0.5 }}>{dialect.description}</span>
              </span>
              <span style={{ fontSize: 10, opacity: 0.35, marginLeft: "auto" }}>↓</span>
            </button>
          ))}
        </div>

        <p
          style={{
            marginTop: 16,
            fontFamily: "var(--mono)",
            fontSize: 11,
            color: "var(--c-muted)",
          }}
        >
          {schema.entities.length} tables · {Object.keys(data).length} datasets generated
        </p>
      </div>
    </div>
  );
}