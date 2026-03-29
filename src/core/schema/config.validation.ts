import type { GeneratorConfig } from "@/src/core/schema/schema.model";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function maxPairCount(entityCount: number, includeCycles: boolean): number {
  if (entityCount <= 1) {
    return 0;
  }
  if (includeCycles) {
    return entityCount * (entityCount - 1);
  }
  return Math.floor((entityCount * (entityCount - 1)) / 2);
}

export function validateGeneratorConfig(raw: GeneratorConfig): GeneratorConfig {
  const entityCount = clamp(Math.floor(raw.entityCount), 1, 100);
  const includeCycles = Boolean(raw.includeCycles);
  const pairCount = maxPairCount(entityCount, includeCycles);

  return {
    entityCount,
    fieldsPerEntity: clamp(Math.floor(raw.fieldsPerEntity), 2, 40),
    relationshipDensity: clamp(raw.relationshipDensity, 0, 1),
    manyToManyCount: clamp(Math.floor(raw.manyToManyCount), 0, pairCount),
    selfRefCount: clamp(Math.floor(raw.selfRefCount), 0, entityCount),
    compositeKeyRate: clamp(raw.compositeKeyRate, 0, 1),
    enumRate: clamp(raw.enumRate, 0, 1),
    jsonRate: clamp(raw.jsonRate, 0, 1),
    optionalFieldRate: clamp(raw.optionalFieldRate, 0, 1),
    includeCycles,
  };
}
