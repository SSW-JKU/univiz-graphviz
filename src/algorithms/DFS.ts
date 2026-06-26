import type { D3Edge, D3Node } from "../types/Graph";
import { getNeighbors } from "./BFSandDFS";
import type { AlgorithmStep } from "./types";

export const dfs = (
	nodes: D3Node[],
	edges: D3Edge[],
	startID: number
): {
	steps: AlgorithmStep[];
	visitedOrder: number[];
} => {
	const visitedNodes = new Set<number>();
	const steps: AlgorithmStep[] = [];
	const visitedEdges: Array<[number, number]> = [];
	let seenEdges: [number, number][] = [];
	const seenNodes: Set<number> = new Set();
	const unneededEdges: [number, number][] = [];
	const parentMap: Map<number, number | null> = new Map();
	const pathMap: Map<number, [number, number][]> = new Map();

	parentMap.set(startID, null);
	pathMap.set(startID, []);

	const dfsRecursive = (nodeID: number) => {
		visitedNodes.add(nodeID);
		seenNodes.delete(nodeID);
		const parentID = parentMap.get(nodeID)!;
		if (parentID !== null && parentID !== undefined) {
			pathMap.set(nodeID, [...pathMap.get(parentID)!, [parentID, nodeID]]);
		}
		let currentEdge: [number, number] | null = null;
		if (parentMap.get(nodeID) !== null && parentMap.get(nodeID) !== undefined) {
			currentEdge = [parentID, nodeID];
			visitedEdges.push(currentEdge);
		}
		const neighbors = getNeighbors(nodeID, edges);
		neighbors.forEach((neighborID) => {
			seenEdges.push([nodeID, neighborID]);
			if (neighborID !== parentID && visitedNodes.has(neighborID)) {
				unneededEdges.push([neighborID, nodeID]);
				seenEdges = seenEdges.filter(
					([a, b]) =>
						!(a === neighborID && b === nodeID) &&
						!(a === nodeID && b === neighborID)
				);
				console.log(structuredClone(seenEdges));
			} else if (neighborID !== parentID && !visitedNodes.has(neighborID)) {
				seenNodes.add(neighborID);
			}
		});
		steps.push({
			currentNode: nodeID,
			currentEdge,
			distances: {},
			previous: {},
			visitedNodes: new Set(visitedNodes), // Clone for immutability
			visitedEdges: structuredClone(visitedEdges),
			description: `Step into node ${nodeID}.`,
			neighbors, // Add neighbors to the step
			shortestPathsToNodes: structuredClone(seenEdges),
			seenButNotVisitedNodes: Array.from(seenNodes),
			unneededEdges: structuredClone(unneededEdges),
			curPath: structuredClone(pathMap.get(nodeID)),
		});
		neighbors.forEach((neighborID) => {
			if (neighborID !== parentID && !visitedNodes.has(neighborID)) {
				parentMap.set(neighborID, nodeID);
				dfsRecursive(neighborID);
			}
		});

		const pathMapTemp = new Map(pathMap);
		const seenNodesTemp = structuredClone(Array.from(seenNodes));
		console.log({ parentMap, visitedNodes, pathMapTemp, seenNodesTemp });

		if (parentID !== null && parentID !== undefined) {
			steps.push({
				currentNode: parentID,
				currentEdge,
				distances: {},
				previous: {},
				visitedNodes: new Set(visitedNodes), // Clone for immutability
				visitedEdges: structuredClone(visitedEdges),
				description: `Step out into node ${parentID}.`,
				neighbors: getNeighbors(parentID, edges), // Add neighbors to the step
				shortestPathsToNodes: structuredClone(seenEdges),
				seenButNotVisitedNodes: Array.from(seenNodes),
				unneededEdges: structuredClone(unneededEdges),
				curPath: structuredClone(pathMap.get(parentID)),
			});
		}
	};

	dfsRecursive(startID);
	steps.push({
		currentNode: null,
		currentEdge: null,
		distances: {},
		previous: {},
		visitedNodes: new Set(visitedNodes),
		visitedEdges: structuredClone(visitedEdges),
		description: "DFS Complete",
		unneededEdges: structuredClone(unneededEdges),
	});
	const visitedOrder = Array.from(visitedNodes);
	return { steps, visitedOrder };
};
