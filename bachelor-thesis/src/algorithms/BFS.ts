import type { D3Edge, D3Node } from "../types/Graph";
import { findNodeByD3ID } from "./base";
import { addStep, getNeighbors } from "./BFSandDFS";
import type { AlgorithmStep } from "./types";

export const bfs = (
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
