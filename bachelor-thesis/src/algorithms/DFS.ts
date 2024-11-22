import type { D3Edge, D3Node } from "../types/Graph";
import { findNodeByD3ID } from "./base";
import { addStep, getNeighbors } from "./BFSandDFS";
import type { AlgorithmStep } from "./types";

/**
 * Performs a Depth-First Search (DFS) traversal on a graph.
 * It starts at the given node (`startId`)
 * and explores as far as possible along each branch before backtracking.
 * The function keeps track of visited nodes
 * to prevent cycles
 * and captures each step of the algorithm
 * for visualization or debugging.
 *
 * The function uses a recursive helper (`dfsHelper`)
 * to perform the traversal
 * and dynamically records steps with descriptions.
 * Neighbor nodes are determined based on the graph's edges.
 *
 * @param {number} startId - The `d3id` of the starting node for the DFS traversal.
 *
 * @returns {Object} An object containing:
 * - `steps` (AlgorithmStep[]): An array of steps representing the progression of the DFS algorithm. Each step captures the current state of traversal, including the current node, visited nodes, and a description.
 * - `visitedOrder` (number[]): An array of node IDs in the order they were visited during the DFS traversal.
 */
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

	/**
	 * Recursive helper function to perform DFS traversal.
	 * @param nodeId - The ID of the current node being explored.
	 */
	const dfsHelper = (nodeId: number) => {
		visitedNodes.add(nodeId);
		visitedOrder.push(nodeId);

		// Add a descriptive step
		const nodeLabel = findNodeByD3ID(nodeId, nodes) || nodeId;
		addStep(visitedNodes, steps, nodeId, `Visited node ${nodeLabel}.`);

		// Explore unvisited neighbors
		getNeighbors(nodeId, edges).forEach((neighborId) => {
			if (!visitedNodes.has(neighborId)) {
				dfsHelper(neighborId);
			}
		});
	};

	addStep(visitedNodes, steps, null, "Starting Depth-First Search.");
	dfsHelper(startId);
	addStep(visitedNodes, steps, null, "DFS complete.");

	return { steps, visitedOrder };
};
