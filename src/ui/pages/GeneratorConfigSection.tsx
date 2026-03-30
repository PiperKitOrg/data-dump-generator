"use client";

import type { ComplexityPreset, GeneratorConfig } from "@/src/core/schema/schema.model";
import { InfoTooltip } from "@/src/ui/components/InfoTooltip";

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
    <label className="piper-label">
      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        {label.toUpperCase()}
        {tooltip ? <InfoTooltip content={tooltip} /> : null}
      </span>
      <input
        className="piper-input"
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

const PRESET_META = {
  easy: {
    icon: "◎",
    desc: "Small, fast, clean",
    detail: "~5 tables · light links",
  },
  medium: {
    icon: "◈",
    desc: "Production-like",
    detail: "~12 tables · real joins",
  },
  hard: {
    icon: "◉",
    desc: "Stress test",
    detail: "~20 tables · deep edges",
  },
} as const;

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
    <div className="piper-panel">
      <div className="piper-panel-header">
        <div>
          <div className="piper-panel-step">STEP 01</div>
          <h2 className="piper-panel-title">Setup Generator</h2>
          <p className="piper-panel-subtitle">Pick a preset, tweak a few basics, generate.</p>
        </div>
      </div>

      <div className="piper-panel-body">
        {/* Complexity Presets */}
        <div className="piper-section-label">Complexity</div>
        <div className="piper-preset-grid">
          {(["easy", "medium", "hard"] as const).map((p) => (
            <button
              key={p}
              type="button"
              className={`piper-preset-card ${preset === p ? "selected" : ""}`}
              onClick={() => onPresetChange(p)}
            >
              <span style={{ fontSize: 20, display: "block", marginBottom: 8, opacity: preset === p ? 1 : 0.4 }}>
                {PRESET_META[p].icon}
              </span>
              <span className="piper-preset-name" style={{ textTransform: "capitalize" }}>{p}</span>
              <span className="piper-preset-desc">{PRESET_META[p].desc}</span>
              <span style={{ display: "block", marginTop: 6, fontSize: 10, fontFamily: "var(--mono)", opacity: 0.45 }}>
                {PRESET_META[p].detail}
              </span>
            </button>
          ))}
        </div>

        {/* Main fields */}
        <div className="piper-section-label" style={{ marginTop: 24 }}>Parameters</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 0 }}>
          <NumberField
            label="Rows / table"
            value={rowsPerEntity}
            min={1}
            tooltip="How many sample rows to create for each table when you generate data. Higher numbers make bigger dump files."
            onChange={onRowsChange}
          />
          <NumberField
            label="Random seed"
            value={seed}
            tooltip="A number that locks random choices. Same seed + same settings always produce the same schema and data."
            onChange={onSeedChange}
          />
          <NumberField
            label="Entity count"
            value={config.entityCount}
            min={1}
            tooltip="How many tables to generate. Each table's columns come from realistic templates."
            onChange={(value) => onConfigChange({ entityCount: value })}
          />
        </div>

        {/* Advanced */}
        <details className="piper-details">
          <summary>Advanced options</summary>
          <div className="piper-details-body">
            <NumberField
              label="Relationship density"
              value={config.relationshipDensity}
              min={0} max={1} step={0.05}
              tooltip="How wired-up the schema feels. Zero means almost no extra parent–child links; higher values add more."
              onChange={(value) => onConfigChange({ relationshipDensity: value })}
            />
            <NumberField
              label="Many-to-many count"
              value={config.manyToManyCount}
              min={0}
              tooltip="How many linking tables to add—pairs of tables that connect through a separate join table."
              onChange={(value) => onConfigChange({ manyToManyCount: value })}
            />
            <NumberField
              label="Self references"
              value={config.selfRefCount}
              min={0}
              tooltip="How many tables can point to themselves—think folders inside folders."
              onChange={(value) => onConfigChange({ selfRefCount: value })}
            />
            <NumberField
              label="Composite key rate"
              value={config.compositeKeyRate}
              min={0} max={1} step={0.05}
              tooltip="Share of tables that use two columns together as the primary key instead of only an id."
              onChange={(value) => onConfigChange({ compositeKeyRate: value })}
            />
            <NumberField
              label="Optional field rate"
              value={config.optionalFieldRate}
              min={0} max={1} step={0.05}
              tooltip="How often generated columns are allowed to be empty. Higher values mean more nullable fields."
              onChange={(value) => onConfigChange({ optionalFieldRate: value })}
            />
            <label className="piper-checkbox-label" style={{ alignSelf: "end", paddingBottom: 10 }}>
              <input
                type="checkbox"
                checked={config.includeCycles}
                onChange={(e) => onConfigChange({ includeCycles: e.target.checked })}
                style={{ accentColor: "var(--c-accent)", width: 14, height: 14 }}
              />
              Include cycles
              <InfoTooltip content="When on, tables can reference each other in a circle (A→B→C→A). Useful for testing import order and resolvers." />
            </label>
          </div>
        </details>

        <div style={{ marginTop: 20 }}>
          <button className="piper-btn-primary" type="button" onClick={onGenerate}>
            <span>⚡</span> Generate Schema
          </button>
        </div>
      </div>
    </div>
  );
}