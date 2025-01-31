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
		// Record stepping into the node
		const nodeLabel = findNodeByD3ID(nodeId, nodes) || nodeId;
		addStep(visitedNodes, steps, nodeId, `Stepped into node ${nodeLabel}.`);

		// Mark the node as visited
		visitedNodes.add(nodeId);
		visitedOrder.push(nodeId);

		// Add a descriptive step for visiting
		addStep(visitedNodes, steps, nodeId, `Visited node ${nodeLabel}.`);

		// Explore unvisited neighbors
		getNeighbors(nodeId, edges).forEach((neighborId) => {
			if (!visitedNodes.has(neighborId)) {
				dfsHelper(neighborId);
			}
		});

		// Record stepping out of the node
		addStep(visitedNodes, steps, nodeId, `Stepped out of node ${nodeLabel}.`);
	};

	// Initial step
	addStep(visitedNodes, steps, null, "Starting Depth-First Search.");
	dfsHelper(startId);
	addStep(visitedNodes, steps, null, "DFS complete.");

	return { steps, visitedOrder };
};

type dfsNode = Map<number, dfsNodeDetails>;

type dfsNodeDetails = {
	neighbors: number[];
	parent: number | undefined | null;
};

export const dfsNew = (nodes: D3Node[], edges: D3Edge[], startID: number) => {
	const dfsNodeMap: dfsNode = new Map();
	nodes.forEach((node) => {
		const neighbors = getNeighbors(node.d3id, edges);
		dfsNodeMap.set(node.d3id, {
			neighbors,
			parent: node.d3id === startID ? null : undefined,
		});
	});
	const steps: AlgorithmStep[] = [];
	addStep(undefined, steps, null, "Starting DFS algorithm");
	const queue = [startID];
	const test = dfsRecursive(queue, dfsNodeMap, steps);
	addStep(test.visitedNodes, steps, null, "DFS algorithm finished");
	console.log(test);
	return test;
};

const dfsRecursive = (
	queue: number[],
	dfsNodeMap: dfsNode,
	steps: AlgorithmStep[],
	visitedNodes: Set<number> = new Set()
): {
	steps: AlgorithmStep[];
	visitedNodes: Set<number>;
} => {
	if (queue.length === 0 || dfsNodeMap.size === 1) {
		return {
			steps,
			visitedNodes,
		};
	}

	const currentNode = queue.shift();
	if (currentNode !== undefined) {
		visitedNodes.add(currentNode);
		const currentDfsNode = dfsNodeMap.get(currentNode);
		if (currentDfsNode) {
			if (currentDfsNode.parent === null) {
				addStep(
					visitedNodes,
					steps,
					currentNode,
					`Stepping into node ${currentNode}`,
					currentDfsNode.neighbors.filter(
						(neighbor) => neighbor != currentDfsNode.parent
					)
				);
			}
			currentDfsNode.neighbors.forEach((neighbor) => {
				const neighborDfsNode = dfsNodeMap.get(neighbor);
				if (neighborDfsNode && neighbor !== currentDfsNode.parent) {
					neighborDfsNode.parent = currentNode;
					dfsNodeMap.set(neighbor, neighborDfsNode);
					queue.push(neighbor);
					visitedNodes.add(neighbor);
					addStep(
						visitedNodes,
						steps,
						neighbor,
						`Stepping into node ${neighbor}`,
						neighborDfsNode.neighbors.filter(
							(neighbor) => neighbor !== currentNode
						)
					);
					dfsRecursive(queue, dfsNodeMap, steps, visitedNodes);
					addStep(
						visitedNodes,
						steps,
						currentNode,
						`Stepping out into node ${currentNode}`,
						currentDfsNode.neighbors.filter(
							(neighbor) => neighbor !== currentDfsNode.parent
						)
					);
				}
			});
		}
	}

	return dfsRecursive(queue, dfsNodeMap, steps, visitedNodes);
};
