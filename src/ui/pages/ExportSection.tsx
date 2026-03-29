import type { DataSet } from "@/src/core/data/data.model";
import type { Schema } from "@/src/core/schema/schema.model";
import { Panel } from "@/src/ui/components/Panel";

type Props = {
  schema: Schema | null;
  data: DataSet | null;
  onExportPostgres: () => void;
  onExportMysql: () => void;
  onExportSqlite: () => void;
  onExportMongo: () => void;
};

export function ExportSection({
  schema,
  data,
  onExportPostgres,
  onExportMysql,
  onExportSqlite,
  onExportMongo,
}: Props) {
  if (!schema || !data) {
    return null;
  }

  return (
    <Panel title="Step 3: Export" subtitle="Download generated dumps for each supported dialect.">
      <div className="grid gap-2 sm:grid-cols-2">
        <button className="rounded-md border px-3 py-2" type="button" onClick={onExportPostgres}>
          Export PostgreSQL
        </button>
        <button className="rounded-md border px-3 py-2" type="button" onClick={onExportMysql}>
          Export MySQL
        </button>
        <button className="rounded-md border px-3 py-2" type="button" onClick={onExportSqlite}>
          Export SQLite
        </button>
        <button className="rounded-md border px-3 py-2" type="button" onClick={onExportMongo}>
          Export MongoDB
        </button>
      </div>
    </Panel>
  );
}
