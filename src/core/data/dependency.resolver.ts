import type { DependencyPlan } from "@/src/core/data/data.model";
import type { Relationship, Schema } from "@/src/core/schema/schema.model";

type GraphEdge = {
  parent: string;
  child: string;
  relationship: Relationship;
};

function isInsertDependency(relationship: Relationship): boolean {
  return relationship.type === "one-to-many" || relationship.type === "one-to-one";
}

export function resolveDependencies(schema: Schema): DependencyPlan {
  const entityNames = schema.entities.map((entity) => entity.name);
  const adjacency = new Map<string, GraphEdge[]>();
  const indegree = new Map<string, number>();
  const deferredRelations: Relationship[] = [];

  for (const name of entityNames) {
    adjacency.set(name, []);
    indegree.set(name, 0);
  }

  const edges: GraphEdge[] = [];
  for (const relationship of schema.relationships) {
    if (relationship.type === "self") {
      deferredRelations.push(relationship);
      continue;
    }
    if (!isInsertDependency(relationship)) {
      continue;
    }

    const parent = relationship.toEntity;
    const child = relationship.fromEntity;
    if (!adjacency.has(parent) || !indegree.has(child)) {
      continue;
    }

    const edge: GraphEdge = { parent, child, relationship };
    edges.push(edge);
    adjacency.get(parent)?.push(edge);
    indegree.set(child, (indegree.get(child) ?? 0) + 1);
  }

  const queue = entityNames.filter((name) => (indegree.get(name) ?? 0) === 0);
  const insertOrder: string[] = [];
  const processed = new Set<string>();

  while (queue.length > 0) {
    queue.sort();
    const current = queue.shift();
    if (!current) {
      break;
    }
    if (processed.has(current)) {
      continue;
    }
    processed.add(current);
    insertOrder.push(current);

    const outgoing = adjacency.get(current) ?? [];
    for (const edge of outgoing) {
      const next = edge.child;
      indegree.set(next, (indegree.get(next) ?? 0) - 1);
      if ((indegree.get(next) ?? 0) === 0 && !processed.has(next)) {
        queue.push(next);
      }
    }
  }

  const unresolvedEntities = entityNames.filter((name) => !processed.has(name));
  if (unresolvedEntities.length > 0) {
    const unresolvedSet = new Set(unresolvedEntities);
    for (const edge of edges) {
      if (unresolvedSet.has(edge.parent) && unresolvedSet.has(edge.child)) {
        deferredRelations.push(edge.relationship);
      }
    }
    unresolvedEntities.sort();
    insertOrder.push(...unresolvedEntities);
  }

  return {
    insertOrder,
    deferredRelations,
  };
}
