"use client";

import type { ComplexityPreset, GeneratorConfig } from "@/src/core/schema/schema.model";
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
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span>{label}</span>
      <input
        className="rounded-md border border-black/15 bg-transparent px-3 py-2"
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
  return (
    <Panel title="Step 1: Generator Config" subtitle="Choose complexity and generation controls.">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span>Complexity</span>
          <select
            className="rounded-md border border-black/15 bg-transparent px-3 py-2"
            value={preset}
            onChange={(event) => onPresetChange(event.target.value as ComplexityPreset)}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </label>
        <NumberField label="Seed" value={seed} onChange={onSeedChange} />
        <NumberField
          label="Rows per entity"
          value={rowsPerEntity}
          min={1}
          onChange={onRowsChange}
        />
        <NumberField
          label="Entities"
          value={config.entityCount}
          min={1}
          onChange={(value) => onConfigChange({ entityCount: value })}
        />
        <NumberField
          label="Fields per entity"
          value={config.fieldsPerEntity}
          min={2}
          onChange={(value) => onConfigChange({ fieldsPerEntity: value })}
        />
        <NumberField
          label="Relationship density (0-1)"
          value={config.relationshipDensity}
          min={0}
          max={1}
          step={0.05}
          onChange={(value) => onConfigChange({ relationshipDensity: value })}
        />
        <NumberField
          label="Many-to-many count"
          value={config.manyToManyCount}
          min={0}
          onChange={(value) => onConfigChange({ manyToManyCount: value })}
        />
        <NumberField
          label="Self references"
          value={config.selfRefCount}
          min={0}
          onChange={(value) => onConfigChange({ selfRefCount: value })}
        />
        <NumberField
          label="Composite key rate (0-1)"
          value={config.compositeKeyRate}
          min={0}
          max={1}
          step={0.05}
          onChange={(value) => onConfigChange({ compositeKeyRate: value })}
        />
        <NumberField
          label="Enum rate (0-1)"
          value={config.enumRate}
          min={0}
          max={1}
          step={0.05}
          onChange={(value) => onConfigChange({ enumRate: value })}
        />
        <NumberField
          label="JSON rate (0-1)"
          value={config.jsonRate}
          min={0}
          max={1}
          step={0.05}
          onChange={(value) => onConfigChange({ jsonRate: value })}
        />
        <NumberField
          label="Optional field rate (0-1)"
          value={config.optionalFieldRate}
          min={0}
          max={1}
          step={0.05}
          onChange={(value) => onConfigChange({ optionalFieldRate: value })}
        />
      </div>

      <label className="mt-3 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={config.includeCycles}
          onChange={(event) => onConfigChange({ includeCycles: event.target.checked })}
        />
        Include cycles
      </label>

      <button
        className="mt-4 rounded-md bg-black px-4 py-2 text-white hover:opacity-90 dark:bg-white dark:text-black"
        type="button"
        onClick={onGenerate}
      >
        Generate Schema
      </button>
    </Panel>
  );
}
