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
      <div className="mb-1 flex items-center gap-1.5 text-sm font-medium">
        <span>Complexity</span>
        <InfoTooltip content="Presets set sensible defaults for table count and how tables connect. You can still fine-tune everything in Advanced options." />
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <div
          className={`relative ${preset === "easy" ? "rounded-lg ring-2 ring-black/20 dark:ring-white/25" : ""}`}
        >
          <span
            className="absolute right-2 top-2 z-10"
            onPointerDown={(event) => event.stopPropagation()}
          >
            <InfoTooltip content="Smaller schema, lighter connections—good for quick exports and learning the tool." />
          </span>
          <button
            type="button"
            className={`w-full cursor-pointer ${presetCardClass} ${preset === "easy" ? "border-black bg-black/5 dark:border-white dark:bg-white/10" : "border-black/15 dark:border-white/20"}`}
            onClick={() => onPresetChange("easy")}
          >
            <strong>Easy</strong>
            <p className="mt-1 text-xs opacity-80">Small, fast, clean relationships</p>
          </button>
        </div>
        <div
          className={`relative ${preset === "medium" ? "rounded-lg ring-2 ring-black/20 dark:ring-white/25" : ""}`}
        >
          <span
            className="absolute right-2 top-2 z-10"
            onPointerDown={(event) => event.stopPropagation()}
          >
            <InfoTooltip content="Balanced size and linking—closer to a typical app database without going huge." />
          </span>
          <button
            type="button"
            className={`w-full cursor-pointer ${presetCardClass} ${preset === "medium" ? "border-black bg-black/5 dark:border-white dark:bg-white/10" : "border-black/15 dark:border-white/20"}`}
            onClick={() => onPresetChange("medium")}
          >
            <strong>Medium</strong>
            <p className="mt-1 text-xs opacity-80">Balanced production-like complexity</p>
          </button>
        </div>
        <div
          className={`relative ${preset === "hard" ? "rounded-lg ring-2 ring-black/20 dark:ring-white/25" : ""}`}
        >
          <span
            className="absolute right-2 top-2 z-10"
            onPointerDown={(event) => event.stopPropagation()}
          >
            <InfoTooltip content="Large schema with more tables and trickier links—useful for testing imports and tooling." />
          </span>
          <button
            type="button"
            className={`w-full cursor-pointer ${presetCardClass} ${preset === "hard" ? "border-black bg-black/5 dark:border-white dark:bg-white/10" : "border-black/15 dark:border-white/20"}`}
            onClick={() => onPresetChange("hard")}
          >
            <strong>Hard</strong>
            <p className="mt-1 text-xs opacity-80">Large graph with deeper edge cases</p>
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <NumberField
          label="Rows per table"
          value={rowsPerEntity}
          min={1}
          tooltip="How many sample rows to create for each table when you generate data. Higher numbers make bigger dump files."
          onChange={onRowsChange}
        />
        <NumberField
          label="Seed"
          value={seed}
          tooltip="A number that locks random choices. Same seed + same settings always produce the same schema and data—handy for reproducing issues or comparing runs."
          onChange={onSeedChange}
        />
        <NumberField
          label="Entity count"
          value={config.entityCount}
          min={1}
          tooltip="How many tables to generate. Each table’s columns come from realistic templates (capped at 40). Foreign keys from relationships add extra columns when needed."
          onChange={(value) => onConfigChange({ entityCount: value })}
        />
      </div>

      <details className="mt-4 rounded-md border border-black/10 p-3 dark:border-white/20">
        <summary className="cursor-pointer text-sm font-medium">Advanced options</summary>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <NumberField
            label="Relationship density (0-1)"
            value={config.relationshipDensity}
            min={0}
            max={1}
            step={0.05}
            tooltip="How wired-up the schema feels. Zero means almost no extra parent–child links between tables; higher values add more. Many-to-many links use their own setting below."
            onChange={(value) => onConfigChange({ relationshipDensity: value })}
          />
          <NumberField
            label="Many-to-many count"
            value={config.manyToManyCount}
            min={0}
            tooltip="How many “linking” tables to add—pairs of tables that connect through a separate join table (like tags on products)."
            onChange={(value) => onConfigChange({ manyToManyCount: value })}
          />
          <NumberField
            label="Self references"
            value={config.selfRefCount}
            min={0}
            tooltip="How many tables can point to themselves—think folders inside folders or managers who report to other managers."
            onChange={(value) => onConfigChange({ selfRefCount: value })}
          />
          <NumberField
            label="Composite key rate (0-1)"
            value={config.compositeKeyRate}
            min={0}
            max={1}
            step={0.05}
            tooltip="Share of tables that use two columns together as the primary key instead of only an id. Adds variety for tools that must handle composite keys."
            onChange={(value) => onConfigChange({ compositeKeyRate: value })}
          />
          <NumberField
            label="Optional field rate (0-1)"
            value={config.optionalFieldRate}
            min={0}
            max={1}
            step={0.05}
            tooltip="How often generated columns (and some foreign keys) are allowed to be empty. Higher values mean more nullable fields in the dump."
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
            <InfoTooltip content="When on, tables can reference each other in a circle (A→B→C→A). That’s rare in simple apps but useful for testing import order and resolvers." />
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
