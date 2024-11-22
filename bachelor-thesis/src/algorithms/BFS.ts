import type { D3Edge, D3Node } from "../types/Graph";
import { findNodeByD3ID } from "./base";
import { addStep, getNeighbors } from "./BFSandDFS";
import type { AlgorithmStep } from "./types";

/**
 * Performs a Breadth-First Search (BFS) traversal on a graph.
 * It starts at the given node (`startId`)
 * and explores all its neighbors before moving on to the next level.
 * The function keeps track of visited nodes to prevent cycles
 * and captures each step of the algorithm for visualization or debugging.
 *
 * The function uses a queue to manage the BFS traversal order
 * and adds a descriptive log at each step of the algorithm.
 * Neighbor nodes are determined based on the graph's edges.
 *
 * @param {number} startId - The `d3id` of the starting node for the BFS traversal.
 *
 * @returns {Object} An object containing:
 * - `steps` (AlgorithmStep[]): An array of steps representing the progression of the BFS algorithm.
 *                              Each step captures the current state of traversal,
 *                              including the current node, visited nodes, and a description.
 * - `visitedOrder` (number[]): An array of node IDs in the order they were visited during the BFS traversal.
 *
 * @description
 * This function implements the Breadth-First Search algorithm.
 */

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

	addStep(visitedNodes, steps, null, "Starting Breadth-First Search.");

	while (queue.length > 0) {
		const currentId = queue.shift()!;
		// Skip already visited nodes
		if (visitedNodes.has(currentId)) continue;

		visitedNodes.add(currentId);
		visitedOrder.push(currentId);

		// Add a descriptive step
		const nodeLabel = findNodeByD3ID(currentId, nodes) || currentId;
		addStep(visitedNodes, steps, currentId, `Visited node ${nodeLabel}.`);

		// Enqueue unvisited neighbors
		getNeighbors(currentId, edges).forEach((neighborId) => {
			if (!visitedNodes.has(neighborId) && !queue.includes(neighborId)) {
				queue.push(neighborId);
			}
		});
	}

	addStep(visitedNodes, steps, null, "BFS complete.");
	return { steps, visitedOrder };
};
