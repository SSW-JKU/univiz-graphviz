import type { D3Edge, D3Node } from "../types/Graph";
import { findNodeByD3ID } from "./base";
import type { AlgorithmStep } from "./types";

export const dfs = (
	nodes: D3Node[],
	edges: D3Edge[],
	startId: number
): {
	steps: AlgorithmStep[];
	visitedOrder: number[];
} => {
	const visitedNodes = new Set<number>();
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

	const dfsHelper = (nodeId: number) => {
		visitedNodes.add(nodeId);
		visitedOrder.push(nodeId);
		addStep(nodeId, `Visited node ${(findNodeByD3ID(nodeId, nodes)) || nodeId}.`);

		const neighbors = getNeighbors(nodeId, edges);
		for (const { node } of neighbors) {
			if (!visitedNodes.has(node)) {
				dfsHelper(node);
			}
		}
	};

	addStep(null, "Starting Depth-First Search.");
	dfsHelper(startId);

	addStep(null, "DFS complete.");
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
