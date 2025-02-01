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
	const parentNodes: number[] = [];

	addStep(visitedNodes, steps, null, "Starting Breadth-First Search.");

	while (queue.length > 0) {
		const currentId = queue.shift()!;
		// Skip already visited nodes
		if (visitedNodes.has(currentId)) continue;

		visitedNodes.add(currentId);
		visitedOrder.push(currentId);

		// Get neighbors of the current node
		const neighbors = getNeighbors(currentId, edges);

		if (neighbors) {
			parentNodes.push(currentId);
		}

		let printNeighbors = [];

		printNeighbors = neighbors.filter(
			(neighborId) => !parentNodes.includes(neighborId)
		);

		// Add a descriptive step, including the neighbors
		const nodeLabel = findNodeByD3ID(currentId, nodes) || currentId;
		addStep(
			visitedNodes,
			steps,
			currentId,
			`Visited node ${nodeLabel}.`,
			printNeighbors
		);

		// Enqueue unvisited neighbors
		neighbors.forEach((neighborId) => {
			if (!visitedNodes.has(neighborId) && !queue.includes(neighborId)) {
				queue.push(neighborId);
			}
		});
	}

	addStep(visitedNodes, steps, null, "BFS complete.");
	return { steps, visitedOrder };
};

export const bfsFinal = (
	nodes: D3Node[],
	edges: D3Edge[],
	startID: number
): {
	steps: AlgorithmStep[];
	visitedOrder: number[];
} => {
	const queue: number[] = [startID];
	const visitedNodes: Set<number> = new Set();
	const steps: AlgorithmStep[] = [];
	const visitedEdges: Array<[number, number]> = [];
	const parentMap: Map<number, number | null> = new Map();
	const pathMap: Map<number, [number, number][]> = new Map();
	const seenEdges: [number, number][] = []
	const seenNodes: Set<number> = new Set();
	const uselessEdges: [number, number][] = [];

	// addStep(
	// 	visitedNodes,
	// 	steps,
	// 	null,
	// 	"Starting Breadth-First Search.",
	// 	structuredClone(queue)
	// );
	parentMap.set(queue[0], null);
	pathMap.set(queue[0], [])

	while (queue.length > 0) {
		const currentId = queue.shift()!;
		let currentEdge: [number, number] | null = null
		// Skip already visited nodes
		if (visitedNodes.has(currentId)) {
			// TODO stroke-dasharray
			continue;
		}

		const parent = parentMap.get(currentId)!

		if (parentMap.get(currentId) !== null && parentMap.get(currentId) !== undefined) {
			currentEdge = [parent, currentId]
			visitedEdges.push(currentEdge)
		}

		const neighborIds = getNeighbors(currentId, edges);
		visitedNodes.add(currentId);
		seenNodes.delete(currentId)
		const curParent = parentMap.get(currentId)
		neighborIds.forEach((neighborId) => {
			if (!parentMap.has(neighborId)) {
				parentMap.set(neighborId, currentId);
				seenEdges.push([currentId, neighborId])
				seenNodes.add(neighborId)
			} else if (curParent && neighborId !== curParent) {
				let pushToUseless: boolean = true;
				uselessEdges.forEach(uselessEdge => {
					if (currentId === uselessEdge[0] && neighborId === uselessEdge[1] || currentId === uselessEdge[1] && neighborId === uselessEdge[0]) {
						pushToUseless = false;
					}
				})
				if (pushToUseless) {
					uselessEdges.push([currentId, neighborId])
				}
			}
		});

		// Enqueue unvisited neighbors
		neighborIds.forEach((neighborId) => {
			if (!visitedNodes.has(neighborId) && !queue.includes(neighborId)) {
				queue.push(neighborId);
			}
		});

		let shortestPath;
		if (parent !== null && parent !== undefined) {
			pathMap.set(currentId, [...pathMap.get(parent)!, [parent, currentId]])
		}

		// Add a descriptive step, including the neighbors
		const nodeLabel = findNodeByD3ID(currentId, nodes) || currentId;
		steps.push({
			currentNode: currentId,
			currentEdge,
			distances: {},
			previous: {},
			visitedNodes: new Set(visitedNodes), // Clone for immutability
			visitedEdges: structuredClone(visitedEdges),
			description: `Visited node ${nodeLabel}.`,
			queue: structuredClone(queue),
			neighbors: neighborIds, // Add neighbors to the step
			shortestPathsToNodes: structuredClone(seenEdges),
			seenButNotVisitedNodes: Array.from(seenNodes),
			unneededEdges: structuredClone(uselessEdges),
			curPath: structuredClone(pathMap.get(currentId))
		});
	}

	steps.push({
		currentNode: null,
		currentEdge: null,
		distances: {},
		previous: {},
		visitedNodes: new Set(visitedNodes),
		visitedEdges: structuredClone(visitedEdges),
		description: "BFS complete.",
		queue: structuredClone(queue),
		unneededEdges: structuredClone(uselessEdges)
	});
	const visitedOrder = Array.from(visitedNodes);
	const blah = structuredClone(uselessEdges)
	console.log({steps, visitedOrder, parentMap, pathMap, visitedEdges, blah});
	return { steps, visitedOrder };
};

export const testRecursiveBFS = (
	nodes: D3Node[],
	edges: D3Edge[],
	queue: number[],
	visitedNodes: Set<number> = new Set<number>(),
	output: number[] = [],
	steps: AlgorithmStep[] = [],
	parentList: number[]
): {
	steps: AlgorithmStep[];
	visitedOrder: number[];
} => {
	if (queue.length === 0) {
		addStep(visitedNodes, steps, null, "Finished Breadth-First Search.");
		const visitedOrder = Array.from(visitedNodes);
		return { steps, visitedOrder };
	}

	if (output.length === 0) {
		addStep(visitedNodes, steps, null, "Starting Breadth-First Search.");
	}

	const currentNode = queue.shift()!;

	visitedNodes.add(currentNode);

	const neighbors = getNeighbors(currentNode, edges).filter(
		(neighbor) => !visitedNodes.has(neighbor)
	);

	if (neighbors.length > 0) {
		parentList.push(currentNode);
	}

	if (output[output.length - 1] !== currentNode && neighbors.length > 0) {
		output.push(currentNode);
		addStep(
			visitedNodes,
			steps,
			currentNode,
			`Step into node ${currentNode}`,
			neighbors
		);
	}
	for (let i = 0; i < neighbors.length; i++) {
		output.push(neighbors[i]);
		if (!visitedNodes.has(neighbors[i])) {
			visitedNodes.add(neighbors[i]);
		}
		const neighborsNew = getNeighbors(neighbors[i], edges).filter(
			(neighbor) => !visitedNodes.has(neighbor)
		);
		addStep(
			visitedNodes,
			steps,
			neighbors[i],
			`Stepping into node ${neighbors[i]}`,
			neighborsNew
		);
		output.push(currentNode);
		addStep(
			visitedNodes,
			steps,
			currentNode,
			`Stepping out into node ${currentNode}`,
			neighbors
		);
	}
	queue.push(...neighbors);
	if (neighbors.length > 0) {
		output.push(getNeighbors(currentNode, edges)[0]);
		addStep(
			visitedNodes,
			steps,
			getNeighbors(currentNode, edges)[0],
			`Stepping into node ${getNeighbors(currentNode, edges)[0]}`,
			neighbors
		);
	}
	return testRecursiveBFS(nodes, edges, queue, visitedNodes, output, steps);
};

export const bfsNew = (nodes: D3Node[], edges: D3Edge[], startID: number) => {
	const neighborsMap = new Map<number, number[] | null>();
	nodes.forEach((node) => {
		const neighbors = getNeighbors(node.d3id, edges);
		neighborsMap.set(node.d3id, neighbors);
	});

	const queue = [startID];
	const parentMap = new Map<number, number | null>();
	const test = recursiveBFS(parentMap, neighborsMap, queue, nodes);
	console.log(test);
	return test;
};

const recursiveBFS = (
	parentMap: Map<number, number | null>,
	neighborsMap: Map<number, number[] | null>,
	queue: number[],
	nodes: D3Node[],
	steps: AlgorithmStep[] = [],
	visitedOrder: number[] = [],
	fullyExplored: number[] = [],
	visitedNodes: Set<number> = new Set<number>()
): {
	steps: AlgorithmStep[];
	visitedOrder: number[];
} => {
	const currentNode = queue.shift();

	if (currentNode === undefined) {
		addStep(visitedNodes, steps, null, "Finished Breadth-First Search.");
		return { steps, visitedOrder };
	} else {
		if (!visitedNodes.has(currentNode)) {
			visitedNodes.add(currentNode);
		}
		visitedOrder.push(currentNode);
	}

	if (visitedOrder.length === 1) {
		addStep(visitedNodes, steps, null, "Starting Breadth-First Search.");
	}
	let neighbors = neighborsMap.get(currentNode);

	// If there are unexplored children, set the parent relationship
	neighbors?.forEach((neighbor) => {
		if (
			!parentMap.has(neighbor) &&
			!Array.from(parentMap.values()).includes(neighbor)
		) {
			parentMap.set(neighbor, currentNode);
		}
	});

	if (parentMap.has(currentNode)) {
		neighbors = neighbors?.filter(
			(neighbor) => neighbor !== parentMap.get(currentNode)
		);
	}

	if (neighbors?.length === 0) {
		fullyExplored.push(currentNode);
	}

	addStep(
		visitedNodes,
		steps,
		currentNode,
		`Stepping into Node ${findNodeByD3ID(currentNode, nodes)}`,
		neighbors ?? []
	);

	neighbors?.forEach((neighbor) => {
		queue.push(neighbor);
	});

	return recursiveBFS(
		parentMap,
		neighborsMap,
		queue,
		nodes,
		steps,
		visitedOrder,
		fullyExplored,
		visitedNodes
	);
};

type bfsNode = Map<number, bfsNodeDetails>;

type bfsNodeDetails = {
	neighbors: number[];
	parent: number | undefined | null;
	children: number[];
};

export const bfsNewNew = (
	nodes: D3Node[],
	edges: D3Edge[],
	startID: number
) => {
	const bfsNodeMap: bfsNode = new Map();
	nodes.forEach((node) => {
		const neighbors = getNeighbors(node.d3id, edges);
		bfsNodeMap.set(node.d3id, {
			neighbors,
			parent: node.d3id === startID ? null : undefined,
			children: [],
		});
	});
	const steps: AlgorithmStep[] = [];
	addStep(undefined, steps, null, "Starting BFS algorithm");
	const queue = [startID];
	const test = bfsAgain(queue, bfsNodeMap, steps);
	console.log(test);
	return test;
};

const bfsAgain = (
	queue: number[],
	bfsNodeMap: bfsNode,
	steps: AlgorithmStep[],
	visitedNodes: Set<number> = new Set()
): {
	steps: AlgorithmStep[];
	visitedOrder: number[];
} => {
	if (bfsNodeMap.size === 1) {
		addStep(visitedNodes, steps, null, "BFS algorithm finished");
		return {
			steps,
			visitedOrder: Array.from(visitedNodes),
		};
	}

	if (queue.length === 0) {
		const visitedOrder = Array.from(visitedNodes);
		const newVisitedNodes = new Set<number>();
		for (let i = 0; i < visitedOrder.length; i++) {
			const currentNode = visitedOrder[i];
			const currentBfsNode = bfsNodeMap.get(currentNode);
			if (currentBfsNode) {
				newVisitedNodes.add(currentNode);
				if (currentBfsNode.children.length > 0) {
					let order = [];
					let parentNode = currentBfsNode.parent;
					while (parentNode !== null && parentNode !== undefined) {
						order.push(parentNode);
						parentNode = bfsNodeMap.get(parentNode)?.parent;
					}
					order = order.reverse().splice(1, order.length - 1);
					console.log(currentNode, order);
					order.forEach((node) => {
						const bfsNode = bfsNodeMap.get(node);
						addStep(
							newVisitedNodes,
							steps,
							node,
							`Stepping into Node ${node}`,
							bfsNode?.children
						);
					});
					addStep(
						newVisitedNodes,
						steps,
						currentNode,
						`Stepping into Node ${currentNode}`,
						currentBfsNode.children
					);
				}
				currentBfsNode.children.forEach((child) => {
					newVisitedNodes.add(child);
					addStep(
						newVisitedNodes,
						steps,
						child,
						`Stepping into Node ${child}`,
						bfsNodeMap.get(child)?.children
					);
					addStep(
						newVisitedNodes,
						steps,
						currentNode,
						`Stepping out into Node ${currentNode}`,
						currentBfsNode.children
					);
				});
				let parentNode = currentBfsNode.parent;
				while (
					parentNode !== null &&
					parentNode !== undefined &&
					currentBfsNode.children.length > 0
				) {
					addStep(
						newVisitedNodes,
						steps,
						parentNode,
						`Stepping out into Node ${parentNode}`,
						bfsNodeMap.get(parentNode)?.children
					);
					parentNode = bfsNodeMap.get(parentNode)?.parent;
				}
			}
		}
		addStep(visitedNodes, steps, null, "BFS algorithm finished");
		return {
			steps,
			visitedOrder: Array.from(newVisitedNodes),
		};
	} else {
		const currentNode = queue.shift();

		if (currentNode !== undefined) {
			visitedNodes.add(currentNode);
			const currentBfsNode = bfsNodeMap.get(currentNode);
			if (currentBfsNode) {
				currentBfsNode.neighbors.forEach((neighbor) => {
					const neighborBfsNode = bfsNodeMap.get(neighbor);
					if (neighborBfsNode && currentBfsNode.parent !== neighbor) {
						currentBfsNode.children.push(neighbor);
						neighborBfsNode.parent = currentNode;
						bfsNodeMap.set(neighbor, neighborBfsNode);
						bfsNodeMap.set(currentNode, currentBfsNode);
						queue.push(neighbor);
					}
				});
			}
		}
	}

	console.log(structuredClone(queue), bfsNodeMap);

	// Recursive call
	return bfsAgain(queue, bfsNodeMap, steps, visitedNodes);
};
