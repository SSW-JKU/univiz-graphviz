import type { D3Edge, D3Node } from "../types/Graph";
import type { AlgorithmStep } from "./types";

/**
 * Helper function to get neighbors of a node.
 * @param nodeD3Id - ID of the current node.
 * @param edges - List of graph edges.
 * @returns An array of neighbor node IDs.
 */
export const getNeighbors = (nodeD3Id: number, edges: D3Edge[]) => {
	return edges
		.filter((edge) => edge.from.d3id === nodeD3Id || edge.to.d3id === nodeD3Id)
		.map((edge) =>
			edge.from.d3id === nodeD3Id ? edge.to.d3id : edge.from.d3id
		);
};

/**
 * Creates a step for algorithm progress with a descriptive message.
 * @param visitedNodes - The current set of visited nodes.
 * @param steps - The steps array to append the new step.
 * @param currentNode - The current node being processed (or null).
 * @param description - A descriptive message for the step.
 */
export const addStep = (
	visitedNodes: Set<number> = new Set<number>(),
	steps: AlgorithmStep[],
	currentNode: number | null,
	description: string,
	queue: number[],
	neighbors: Array<number> = [], // New optional parameter for neighbors
	pathToNodes: [number, number][] = [],
	currentEdge: [number, number] | null = null,
	visitedEdges: Array<[number, number]> = []
) => {
	steps.push({
		currentNode,
		currentEdge,
		distances: {},
		previous: {},
		visitedNodes: new Set(visitedNodes), // Clone for immutability
		visitedEdges,
		description,
		queue,
		neighbors, // Add neighbors to the step
		shortestPathsToNodes: pathToNodes
	});
};

/**
 * Calculates row data for BFS/DFS algorithms based on all steps up to the current index.
 * @param nodes - List of graph nodes.
 * @param steps - List of algorithm steps.
 * @param curIndex - Current index up to which the data should be calculated.
 * @returns An object with `rowsStart` and `rowsScrollable` arrays for the table.
 */
export const calcRowData = (
	nodes: D3Node[],
	steps: AlgorithmStep[],
	curIndex: number,
	edges: D3Edge[] | undefined
) => {
	// Set to track visited nodes across all steps up to curIndex
	const visitedNodeD3IDs = new Set<number>();

	// Process all steps up to curIndex
	for (let stepIndex = 0; stepIndex <= curIndex; stepIndex++) {
		const step = steps[stepIndex];
		step.visitedNodes.forEach((id) => visitedNodeD3IDs.add(id)); // Accumulate visited nodes
	}

	// Generate static rows (headers)
	//console.log(nodes, steps, curIndex);
	const rowsStart = steps
		.slice(0, curIndex + 1)
		.map((step) => [String(step.currentNode ?? "-")]);

	// Generate dynamic rows based on nodes and visited status
	const rowsScrollable = steps
		.slice(0, curIndex + 1)
		.map((step, index) => [
			step.neighbors ?? "",
			Array.from(step.visitedNodes).join(" "),
			step.queue,
			String(steps[index + 1]?.currentNode ?? "-") +
				(steps[index + 1]?.description.includes("out") ? " (up)" : ""),
		]);

	return { rowsStart, rowsScrollable };
};
