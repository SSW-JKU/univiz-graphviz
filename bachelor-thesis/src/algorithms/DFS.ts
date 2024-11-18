import type { AlgorithmStep } from "./types";
import type { D3Edge, D3Node } from "../types/Graph";

export const dfs = (
	nodes: D3Node[],
	edges: D3Edge[],
	startId: number
): { steps: AlgorithmStep[] } => {
	const steps: AlgorithmStep[] = [];
	const visitedNodes = new Set<number>();
	const stack: number[] = [startId];

	// Helper function to add a new step
	const addStep = (currentNode: number | null, description: string) => {
		steps.push({
			currentNode,
			currentEdge: null,
			visitedNodes: new Set(visitedNodes),
			visitedEdges: [],
			description,
		});
	};

	// Add initial step
	addStep(null, `Starting DFS with node ${startId}.`);

	while (stack.length > 0) {
		const currentId = stack.pop()!;
		if (!visitedNodes.has(currentId)) {
			visitedNodes.add(currentId);

			// Record the current step
			addStep(currentId, `Visiting node ${currentId}.`);

			// Push all unvisited neighbors to the stack
			const neighbors = getNeighbors(currentId, edges);
			for (const neighbor of neighbors) {
				if (!visitedNodes.has(neighbor.node)) {
					stack.push(neighbor.node);

					// Record the edge being explored
					steps.push({
						currentNode: currentId,
						currentEdge: [currentId, neighbor.node],
						visitedNodes: new Set(visitedNodes),
						visitedEdges: [[currentId, neighbor.node]],
						description: `Exploring edge from ${currentId} to ${neighbor.node}.`,
					});
				}
			}
		}
	}

	// Final step
	addStep(null, "DFS complete. All reachable nodes have been visited.");

	return { steps };
};

// Helper function to get neighbors of a node along with their edge weights.
const getNeighbors = (
	nodeD3Id: number,
	edges: D3Edge[]
): { node: number; weight: number }[] => {
	return edges
		.filter((edge) => edge.from.d3id === nodeD3Id || edge.to.d3id === nodeD3Id)
		.map((edge) => ({
			node: edge.from.d3id === nodeD3Id ? edge.to.d3id : edge.from.d3id,
			weight: Number(edge.weight ?? 1),
		}));
};
