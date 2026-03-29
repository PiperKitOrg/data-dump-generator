"use client";

import { useMemo, useState } from "react";
import { PRESET_CONFIGS } from "@/src/constants/ui/presets.constants";
import type { DataSet, DependencyPlan } from "@/src/core/data/data.model";
import { generateData } from "@/src/core/data/data.generator";
import { resolveDependencies } from "@/src/core/data/dependency.resolver";
import { validateGeneratorConfig } from "@/src/core/schema/config.validation";
import { generateSchema } from "@/src/core/schema/schema.generator";
import type {
  ComplexityPreset,
  GeneratorConfig,
  Schema,
} from "@/src/core/schema/schema.model";
import { MongoExporter } from "@/src/exporters/mongo.exporter";
import { MysqlExporter } from "@/src/exporters/mysql.exporter";
import { PostgresExporter } from "@/src/exporters/postgres.exporter";
import { SqliteExporter } from "@/src/exporters/sqlite.exporter";
import { ExportSection } from "@/src/ui/pages/ExportSection";
import { GeneratorConfigSection } from "@/src/ui/pages/GeneratorConfigSection";
import { SchemaPreviewSection } from "@/src/ui/pages/SchemaPreviewSection";
import { downloadTextFile } from "@/src/utils/download";

const DEFAULT_PRESET: ComplexityPreset = "medium";
const DEFAULT_SEED = 42;
const DEFAULT_ROWS_PER_ENTITY = 200;

export default function Home() {
  const [preset, setPreset] = useState<ComplexityPreset>(DEFAULT_PRESET);
  const [seed, setSeed] = useState<number>(DEFAULT_SEED);
  const [rowsPerEntity, setRowsPerEntity] = useState<number>(DEFAULT_ROWS_PER_ENTITY);
  const [config, setConfig] = useState<GeneratorConfig>(PRESET_CONFIGS[DEFAULT_PRESET]);
  const [schema, setSchema] = useState<Schema | null>(null);
  const [plan, setPlan] = useState<DependencyPlan | null>(null);
  const [data, setData] = useState<DataSet | null>(null);

  const safeConfig = useMemo(() => validateGeneratorConfig(config), [config]);
  const safeRows = Math.max(1, Math.floor(rowsPerEntity || 1));
  const safeSeed = Math.floor(seed || 0);

  const applyPreset = (nextPreset: ComplexityPreset) => {
    setPreset(nextPreset);
    setConfig(PRESET_CONFIGS[nextPreset]);
  };

  const generateSchemaAndPlan = () => {
    const nextSchema = generateSchema(safeConfig, safeSeed);
    const nextPlan = resolveDependencies(nextSchema);
    setSchema(nextSchema);
    setPlan(nextPlan);
    setData(null);
  };

  const generateSeedData = () => {
    if (!schema || !plan) {
      return;
    }
    const nextData = generateData(schema, plan, safeRows, safeSeed);
    setData(nextData);
  };

  const exportPostgres = () => {
    if (!schema || !data) {
      return;
    }
    downloadTextFile("dump.postgres.sql", new PostgresExporter().export(schema, data));
  };

  const exportMysql = () => {
    if (!schema || !data) {
      return;
    }
    downloadTextFile("dump.mysql.sql", new MysqlExporter().export(schema, data));
  };

  const exportSqlite = () => {
    if (!schema || !data) {
      return;
    }
    downloadTextFile("dump.sqlite.sql", new SqliteExporter().export(schema, data));
  };

  const exportMongo = () => {
    if (!schema || !data) {
      return;
    }
    downloadTextFile(
      "dump.mongo.js",
      new MongoExporter().export(schema, data),
      "text/javascript;charset=utf-8",
    );
  };

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-5 p-6">
      <h1 className="text-2xl font-semibold">Piper Dump Generator</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-300">
        Generate schemas and data in 3 simple steps: setup, preview,
        export.
      </p>
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="rounded-full border px-2 py-1">1. Setup</span>
        <span className="rounded-full border px-2 py-1">2. Review</span>
        <span className="rounded-full border px-2 py-1">3. Export</span>
      </div>

      <GeneratorConfigSection
        preset={preset}
        config={safeConfig}
        seed={safeSeed}
        rowsPerEntity={safeRows}
        onPresetChange={applyPreset}
        onConfigChange={(patch) => setConfig((prev) => ({ ...prev, ...patch }))}
        onSeedChange={setSeed}
        onRowsChange={setRowsPerEntity}
        onGenerate={generateSchemaAndPlan}
      />

      <SchemaPreviewSection
        schema={schema}
        plan={plan}
        data={data}
        onGenerateData={generateSeedData}
      />

      <ExportSection
        schema={schema}
        data={data}
        onExportPostgres={exportPostgres}
        onExportMysql={exportMysql}
        onExportSqlite={exportSqlite}
        onExportMongo={exportMongo}
      />
    </main>
  );
}
