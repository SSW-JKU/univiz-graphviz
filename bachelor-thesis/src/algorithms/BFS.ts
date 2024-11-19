import type { D3Edge, D3Node } from "../types/Graph";
import { findNodeByD3ID } from "./base";
import type { AlgorithmStep } from "./types";

export const bfs = (
    nodes: D3Node[],
    edges: D3Edge[],
    startId: number
): {
    steps: AlgorithmStep[];
    visitedOrder: number[];
} => {
    const visitedNodes = new Set<number>();
    const queue: number[] = [startId];
    const steps: AlgorithmStep[] = [];
    const visitedOrder: number[] = [];

    const addStep = (currentNode: number | null, description: string) => {
        steps.push({
            currentNode,
            currentEdge: null,
            distances: {},
            previous: {},
            visitedNodes: new Set(visitedNodes),
            visitedEdges: [],
            selectedEdges: [],
            description,
        });
    };

    addStep(null, "Starting Breadth-First Search.");

    while (queue.length > 0) {
        const currentId = queue.shift()!;
        if (visitedNodes.has(currentId)) continue;

        visitedNodes.add(currentId);
        visitedOrder.push(currentId);
        addStep(currentId, `Visited node ${(findNodeByD3ID(currentId, nodes)) || currentId}.`);

        const neighbors = getNeighbors(currentId, edges);
        for (const { node } of neighbors) {
            if (!visitedNodes.has(node) && !queue.includes(node)) {
                queue.push(node);
            }
        }
    }

    addStep(null, "BFS complete.");
    return { steps, visitedOrder };
};

/**
 * Helper function to get neighbors of a node along with their edge weights.
 */
const getNeighbors = (nodeD3Id: number, edges: D3Edge[]) => {
    return edges
        .filter((edge) => edge.from.d3id === nodeD3Id || edge.to.d3id === nodeD3Id)
        .map((edge) => ({
            node: edge.from.d3id === nodeD3Id ? edge.to.d3id : edge.from.d3id,
        }));
};
