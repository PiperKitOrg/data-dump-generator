import type {
  ComplexityPreset,
  GeneratorConfig,
} from "@/src/core/schema/schema.model";

export const PRESET_CONFIGS: Record<ComplexityPreset, GeneratorConfig> = {
  easy: {
    entityCount: 8,
    relationshipDensity: 0.2,
    manyToManyCount: 1,
    selfRefCount: 0,
    compositeKeyRate: 0,
    optionalFieldRate: 0.1,
    includeCycles: false,
  },
  medium: {
    entityCount: 18,
    relationshipDensity: 0.35,
    manyToManyCount: 3,
    selfRefCount: 2,
    compositeKeyRate: 0.25,
    optionalFieldRate: 0.2,
    includeCycles: false,
  },
  hard: {
    entityCount: 28,
    relationshipDensity: 0.5,
    manyToManyCount: 6,
    selfRefCount: 4,
    compositeKeyRate: 0.35,
    optionalFieldRate: 0.3,
    includeCycles: true,
  },
};
