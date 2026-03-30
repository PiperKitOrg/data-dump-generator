"use client";

import type { ComplexityPreset, GeneratorConfig } from "@/src/core/schema/schema.model";
import { InfoTooltip } from "@/src/ui/components/InfoTooltip";
import { Panel } from "@/src/ui/components/Panel";

type Props = {
  preset: ComplexityPreset;
  config: GeneratorConfig;
  seed: number;
  rowsPerEntity: number;
  onPresetChange: (preset: ComplexityPreset) => void;
  onConfigChange: (patch: Partial<GeneratorConfig>) => void;
  onSeedChange: (value: number) => void;
  onRowsChange: (value: number) => void;
  onGenerate: () => void;
};

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  tooltip,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  tooltip?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="flex items-center gap-1.5">
        {label}
        {tooltip ? <InfoTooltip content={tooltip} /> : null}
      </span>
      <input
        className="cursor-pointer rounded-md border border-black/15 bg-transparent px-3 py-2"
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

export function GeneratorConfigSection({
  preset,
  config,
  seed,
  rowsPerEntity,
  onPresetChange,
  onConfigChange,
  onSeedChange,
  onRowsChange,
  onGenerate,
}: Props) {
  const presetCardClass =
    "rounded-lg border px-3 py-3 text-left text-sm transition hover:border-black/30 dark:hover:border-white/40";

  return (
    <Panel title="Step 1: Setup Generator" subtitle="Pick a preset, tweak a few basics, generate.">
      <div className="grid gap-2 sm:grid-cols-3">
        <button
          type="button"
          className={`cursor-pointer ${presetCardClass} ${preset === "easy" ? "border-black bg-black/5 dark:border-white dark:bg-white/10" : "border-black/15 dark:border-white/20"}`}
          onClick={() => onPresetChange("easy")}
        >
          <strong>Easy</strong>
          <p className="mt-1 text-xs opacity-80">Small, fast, clean relationships</p>
        </button>
        <button
          type="button"
          className={`cursor-pointer ${presetCardClass} ${preset === "medium" ? "border-black bg-black/5 dark:border-white dark:bg-white/10" : "border-black/15 dark:border-white/20"}`}
          onClick={() => onPresetChange("medium")}
        >
          <strong>Medium</strong>
          <p className="mt-1 text-xs opacity-80">Balanced production-like complexity</p>
        </button>
        <button
          type="button"
          className={`cursor-pointer ${presetCardClass} ${preset === "hard" ? "border-black bg-black/5 dark:border-white dark:bg-white/10" : "border-black/15 dark:border-white/20"}`}
          onClick={() => onPresetChange("hard")}
        >
          <strong>Hard</strong>
          <p className="mt-1 text-xs opacity-80">Large graph with deeper edge cases</p>
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <NumberField
          label="Rows per table"
          value={rowsPerEntity}
          min={1}
          onChange={onRowsChange}
        />
        <NumberField label="Seed" value={seed} onChange={onSeedChange} />
        <NumberField
          label="Entity count"
          value={config.entityCount}
          min={1}
          onChange={(value) => onConfigChange({ entityCount: value })}
        />
      </div>

      <details className="mt-4 rounded-md border border-black/10 p-3 dark:border-white/20">
        <summary className="cursor-pointer text-sm font-medium">Advanced options</summary>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {/* <NumberField
            label="Fields per entity"
            value={config.fieldsPerEntity}
            min={2}
            tooltip="Exact number of columns per table before foreign keys from relationships are added. Extra columns are padded as field_1, field_2, …"
            onChange={(value) => onConfigChange({ fieldsPerEntity: value })}
          /> */}
          <NumberField
            label="Relationship density (0-1)"
            value={config.relationshipDensity}
            min={0}
            max={1}
            step={0.05}
            tooltip="Exact count of one-to-one + one-to-many edges = round(density × N), where N is the number of allowed ordered entity pairs (see “Include cycles”). Uses pairs not already consumed by many-to-many."
            onChange={(value) => onConfigChange({ relationshipDensity: value })}
          />
          <NumberField
            label="Many-to-many count"
            value={config.manyToManyCount}
            min={0}
            tooltip="Exact number of many-to-many relationships (up to N pairs). The first M shuffled pairs become M2M; remaining pairs can become directed edges."
            onChange={(value) => onConfigChange({ manyToManyCount: value })}
          />
          <NumberField
            label="Self references"
            value={config.selfRefCount}
            min={0}
            tooltip="Exact number of self-referencing tables: min(requested, entity count). Each reserves one row in those tables for hierarchy later."
            onChange={(value) => onConfigChange({ selfRefCount: value })}
          />
          <NumberField
            label="Composite key rate (0-1)"
            value={config.compositeKeyRate}
            min={0}
            max={1}
            step={0.05}
            tooltip="Exactly round(rate × entity count) tables get a composite primary key (id + code), iff fields per entity ≥ 2. The extra code column is included in that count."
            onChange={(value) => onConfigChange({ compositeKeyRate: value })}
          />
          <NumberField
            label="Optional field rate (0-1)"
            value={config.optionalFieldRate}
            min={0}
            max={1}
            step={0.05}
            tooltip="Padding columns: exactly round(rate × padding column count) are nullable. Directed FK edges: exactly round(rate × directed edge count) use nullable FKs."
            onChange={(value) => onConfigChange({ optionalFieldRate: value })}
          />
          <label className="mt-1 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="cursor-pointer"
              checked={config.includeCycles}
              onChange={(event) => onConfigChange({ includeCycles: event.target.checked })}
            />
            Include cycles
            <InfoTooltip content="Allow circular dependencies in relationships; useful for stress testing dependency planners." />
          </label>
        </div>
      </details>

      <button
        className="mt-4 cursor-pointer rounded-md bg-black px-4 py-2 text-white hover:opacity-90 dark:bg-white dark:text-black"
        type="button"
        onClick={onGenerate}
      >
        Generate Schema
      </button>
    </Panel>
  );
}
