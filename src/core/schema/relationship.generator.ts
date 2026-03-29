import type {
  Entity,
  GeneratorConfig,
  Relationship,
} from "@/src/core/schema/schema.model";
import { RELATIONSHIP_DEFAULTS } from "@/src/constants/schema/relationship.constants";
import { SeededRandom } from "@/src/utils/seededRandom";

function pairKey(fromEntity: string, toEntity: string, type: string): string {
  return `${type}:${fromEntity}->${toEntity}`;
}

export function generateRelationships(
  entities: Entity[],
  config: GeneratorConfig,
  rng: SeededRandom,
): Relationship[] {
  const relationships: Relationship[] = [];
  const seen = new Set<string>();
  const entityNames = entities.map((entity) => entity.name);

  const selfCount = Math.min(config.selfRefCount, entities.length);
  const selfTargets = rng.shuffle(entityNames).slice(0, selfCount);
  for (const name of selfTargets) {
    const key = pairKey(name, name, "self");
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    relationships.push({
      type: "self",
      fromEntity: name,
      toEntity: name,
      fkField: `${name.toLowerCase()}${RELATIONSHIP_DEFAULTS.selfParentSuffix}`,
      nullable: true,
    });
  }

  const allOrderedPairs: Array<[string, string]> = [];
  for (let i = 0; i < entityNames.length; i += 1) {
    for (let j = 0; j < entityNames.length; j += 1) {
      if (i === j) {
        continue;
      }
      if (!config.includeCycles && i > j) {
        continue;
      }
      allOrderedPairs.push([entityNames[i], entityNames[j]]);
    }
  }

  const manyToManyTarget = Math.min(config.manyToManyCount, allOrderedPairs.length);
  const shuffledPairs = rng.shuffle(allOrderedPairs);
  const fkCountByEntity = new Map<string, number>();
  const canAddForeignKey = (entityName: string): boolean =>
    (fkCountByEntity.get(entityName) ?? 0) < RELATIONSHIP_DEFAULTS.maxForeignKeysPerEntity;
  const trackForeignKey = (entityName: string): void => {
    fkCountByEntity.set(entityName, (fkCountByEntity.get(entityName) ?? 0) + 1);
  };

  for (const [fromEntity, toEntity] of shuffledPairs) {
    if (relationships.length >= selfCount + manyToManyTarget) {
      break;
    }
    const key = pairKey(fromEntity, toEntity, "many-to-many");
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    relationships.push({
      type: "many-to-many",
      fromEntity,
      toEntity,
      fkField: `${toEntity.toLowerCase()}${RELATIONSHIP_DEFAULTS.fkIdSuffix}`,
      nullable: false,
      joinTable: `${fromEntity.toLowerCase()}_${toEntity.toLowerCase()}${RELATIONSHIP_DEFAULTS.joinSuffix}`,
    });
  }

  const maxDirectional = Math.max(1, allOrderedPairs.length);
  const targetByDensity = Math.round(config.relationshipDensity * maxDirectional);
  const targetTotal = Math.max(
    relationships.length,
    Math.min(maxDirectional, targetByDensity),
  );

  for (const [fromEntity, toEntity] of shuffledPairs) {
    if (relationships.length >= targetTotal) {
      break;
    }
    if (
      relationships.some(
        (rel) =>
          rel.fromEntity === fromEntity &&
          rel.toEntity === toEntity &&
          rel.type !== "many-to-many",
      )
    ) {
      continue;
    }
    if (!canAddForeignKey(fromEntity)) {
      continue;
    }

    const type = rng.bool(RELATIONSHIP_DEFAULTS.oneToOneRate)
      ? "one-to-one"
      : "one-to-many";
    const key = pairKey(fromEntity, toEntity, type);
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    relationships.push({
      type,
      fromEntity,
      toEntity,
      fkField: `${toEntity.toLowerCase()}${RELATIONSHIP_DEFAULTS.fkIdSuffix}`,
      nullable: rng.bool(config.optionalFieldRate),
    });
    trackForeignKey(fromEntity);
  }

  return relationships;
}
