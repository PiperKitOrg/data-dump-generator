import type {
  ComplexityPreset,
  GeneratorConfig,
} from "@/src/core/schema/schema.model";

export const PRESET_CONFIGS: Record<ComplexityPreset, GeneratorConfig> = {
  easy: {
    entityCount: 8,
    fieldsPerEntity: 6,
    relationshipDensity: 0.2,
    manyToManyCount: 1,
    selfRefCount: 0,
    compositeKeyRate: 0,
    enumRate: 0.05,
    jsonRate: 0.05,
    optionalFieldRate: 0.1,
    includeCycles: false,
  },
  medium: {
    entityCount: 18,
    fieldsPerEntity: 8,
    relationshipDensity: 0.35,
    manyToManyCount: 3,
    selfRefCount: 2,
    compositeKeyRate: 0.25,
    enumRate: 0.1,
    jsonRate: 0.1,
    optionalFieldRate: 0.2,
    includeCycles: false,
  },
  hard: {
    entityCount: 28,
    fieldsPerEntity: 10,
    relationshipDensity: 0.5,
    manyToManyCount: 6,
    selfRefCount: 4,
    compositeKeyRate: 0.35,
    enumRate: 0.15,
    jsonRate: 0.2,
    optionalFieldRate: 0.3,
    includeCycles: true,
  },
};
