import type { D3Edge, D3Node } from "../types/Graph";
import type { AlgorithmStep } from "./types";

export const dijkstra = (
	nodes: D3Node[],
	edges: D3Edge[],
	startId: number
): {
	distances: Record<number, number>;
	previous: Record<number, number | null>;
	steps: AlgorithmStep[];
} => {
	const distances: Record<number, number> = {};
	const previous: Record<number, number | null> = {};
	const visitedNodes = new Set<number>();
	const visitedEdges: Array<[number, number]> = []; // Array of tuples for edges
	const selectedEdges: Array<[number, number]> = [];
	const steps: AlgorithmStep[] = [];
	const unvisited = new Set<number>();

	nodes.forEach((node) => {
		distances[node.d3id] = Infinity;
		previous[node.d3id] = null;
		unvisited.add(node.d3id);
	});
	distances[startId] = 0;

	const findNodeLabel = (nodeId: number) => {
		const node = nodes.find((n) => n.d3id === nodeId);
		return node?.label || node?.id || nodeId;
	};

	const addStep = (
		currentNode: number | null,
		currentEdge: [number, number] | null,
		description: string
	) => {
		const distancesWithDots: Record<number, number | string> = {};
		Object.keys(distances).forEach((key) => {
			const nodeId = Number(key);
			// If distance remains unchanged, represent it with a dot
			distancesWithDots[nodeId] = visitedNodes.has(nodeId)
				? "."
				: distances[nodeId];
		});

		steps.push({
			currentNode,
			currentEdge,
			distances: distancesWithDots,
			previous: { ...previous },
			visitedNodes: new Set(visitedNodes),
			visitedEdges: [...visitedEdges], // Clone the visitedEdges array
			selectedEdges: [...selectedEdges],
			description,
		});
	};

	addStep(
		null,
		null,
		"Starting Dijkstra's algorithm with all distances set to infinity, except the start node."
	);

	while (unvisited.size > 0) {
		const currentId = Array.from(unvisited).reduce((minNodeId, nodeId) =>
			distances[nodeId] < distances[minNodeId] ? nodeId : minNodeId
		);

		if (distances[currentId] === Infinity) break;

		unvisited.delete(currentId);
		visitedNodes.add(currentId);

		if (previous[currentId] !== null) {
			const finalizedEdge: [number, number] = [previous[currentId]!, currentId];
			removeFinalizedEdge(finalizedEdge, selectedEdges);
			visitedEdges.push(finalizedEdge);
		}

		addStep(
			currentId,
			null,
			`Visiting node ${findNodeLabel(
				currentId
			)} with current shortest distance ${distances[currentId]}.`
		);

		const neighbors = getNeighbors(currentId, edges);
		neighbors.forEach(({ node, weight }) => {
			if (visitedNodes.has(node)) return;

			const alt = distances[currentId] + weight;
			const currentEdge: [number, number] = [currentId, node];
			const targetLabel = findNodeLabel(node);
			const currentLabel = findNodeLabel(currentId);

			selectedEdges.push(currentEdge);

			if (alt < distances[node]) {
				const previousDistance = distances[node];
				distances[node] = alt;
				previous[node] = currentId;

				addStep(
					currentId,
					currentEdge,
					`Evaluating edge from ${currentLabel} to ${targetLabel}. Current shortest distance to ${targetLabel}: ${
						previousDistance === Infinity ? "infinity" : previousDistance
					}; new possible distance via ${currentLabel}: ${alt}. Updated shortest path to ${targetLabel}.`
				);
			} else {
				addStep(
					currentId,
					currentEdge,
					`Evaluating edge from ${currentLabel} to ${targetLabel}. Current shortest distance to ${targetLabel}: ${distances[node]}; new possible distance via ${currentLabel}: ${alt}. No update to shortest path for ${targetLabel}.`
				);
			}
		});
	}

	// Final step indicating the algorithm has finished
	addStep(
		null,
		null,
		"Dijkstra's algorithm finished. All shortest paths from the start node have been determined."
	);
	return { distances, previous, steps };
};

/**
 * Helper function to get neighbors of a node along with their edge weights.
 */
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

/**
 * Reconstructs the shortest path from the start node to the target node.
 */
export const getShortestPath = (
	targetId: number,
	previous: Record<number, number | null>
): number[] => {
	const path: number[] = [];
	let currentId: number | null = targetId;

	while (currentId !== null) {
		path.unshift(currentId);
		currentId = previous[currentId];
	}

	return path;
};

/**
 * Removes a finalized edge from the selectedEdges array if it exists.
 * @param finalizedEdge - The edge to be removed, represented as a tuple [number, number].
 * @param selectedEdges - The array of currently selected edges.
 */
const removeFinalizedEdge = (
	finalizedEdge: [number, number],
	selectedEdges: Array<[number, number]>
) => {
	const edgeIndex = selectedEdges.findIndex(
		(edge) =>
			(edge[0] === finalizedEdge[0] && edge[1] === finalizedEdge[1]) ||
			(edge[0] === finalizedEdge[1] && edge[1] === finalizedEdge[0]) // Check both directions
	);

	if (edgeIndex !== -1) {
		selectedEdges.splice(edgeIndex, 1); // Remove the edge if it exists
	}
};

export const removeEdge = (
	edges: D3Edge[],
	selEdges: Array<[number, number]>,
	selEdge: [number, number]
) => {
	const d3Edge = getEdge(edges, selEdge[0], selEdge[1]);
	const index = selEdges.findIndex(
		(edge) => edge[0] === d3Edge?.from.d3id && edge[1] === d3Edge.to.d3id
	);
	if (index !== -1) {
		selEdges.splice(index, 1);
	}
};

// Helper function to find an edge between two nodes
export const getEdge = (
	edges: D3Edge[],
	fromId: number,
	toId: number
): D3Edge | null => {
	return (
		edges.find(
			(edge) =>
				(edge.from.d3id === fromId && edge.to.d3id === toId) ||
				(edge.from.d3id === toId && edge.to.d3id === fromId)
		) || null
	);
};
