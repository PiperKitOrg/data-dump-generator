import type {
  Entity,
  GeneratorConfig,
  Relationship,
} from "@/src/core/schema/schema.model";
import { RELATIONSHIP_DEFAULTS } from "@/src/constants/schema/relationship.constants";
import { SeededRandom } from "@/src/utils/seededRandom";

export function generateRelationships(
  entities: Entity[],
  config: GeneratorConfig,
  rng: SeededRandom,
): Relationship[] {
  const relationships: Relationship[] = [];
  const entityNames = entities.map((entity) => entity.name);

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

  const N = allOrderedPairs.length;
  const shuffledPairs = rng.shuffle(allOrderedPairs);

  const selfCount = Math.min(config.selfRefCount, entityNames.length);
  const selfTargets = rng.shuffle(entityNames).slice(0, selfCount);
  for (const name of selfTargets) {
    relationships.push({
      type: "self",
      fromEntity: name,
      toEntity: name,
      fkField: `${name.toLowerCase()}${RELATIONSHIP_DEFAULTS.selfParentSuffix}`,
      nullable: true,
    });
  }

  const manyToManyExact = Math.min(config.manyToManyCount, N);
  for (let i = 0; i < manyToManyExact; i += 1) {
    const [fromEntity, toEntity] = shuffledPairs[i];
    relationships.push({
      type: "many-to-many",
      fromEntity,
      toEntity,
      fkField: `${toEntity.toLowerCase()}${RELATIONSHIP_DEFAULTS.fkIdSuffix}`,
      nullable: false,
      joinTable: `${fromEntity.toLowerCase()}_${toEntity.toLowerCase()}${RELATIONSHIP_DEFAULTS.joinSuffix}`,
    });
  }

  const restPairs = shuffledPairs.slice(manyToManyExact);
  const directedQuota = Math.min(
    N,
    Math.round(config.relationshipDensity * N),
  );
  const directedCount = Math.min(directedQuota, restPairs.length);

  const oneToOneCount = Math.min(
    directedCount,
    Math.round(RELATIONSHIP_DEFAULTS.oneToOneRate * directedCount),
  );
  const nullableEdgeCount = Math.min(
    directedCount,
    Math.round(config.optionalFieldRate * directedCount),
  );

  for (let d = 0; d < directedCount; d += 1) {
    const [fromEntity, toEntity] = restPairs[d];
    const type = d < oneToOneCount ? "one-to-one" : "one-to-many";
    relationships.push({
      type,
      fromEntity,
      toEntity,
      fkField: `${toEntity.toLowerCase()}${RELATIONSHIP_DEFAULTS.fkIdSuffix}`,
      nullable: d < nullableEdgeCount,
    });
  }

  return relationships;
}
