import type { D3Edge, D3Node } from "../types/Graph";

export interface DijkstraStep {
	currentNode: number | null;
	currentEdge: [number, number] | null;
	distances: Record<number, number>;
	previous: Record<number, number | null>;
	visitedNodes: Set<number>;
	visitedEdges: Array<[number, number]>; // Array of tuples for visited edges
	description: string;
}

export const dijkstra = (
	nodes: D3Node[],
	edges: D3Edge[],
	startId: number
): {
	distances: Record<number, number>;
	previous: Record<number, number | null>;
	steps: DijkstraStep[];
} => {
	const distances: Record<number, number> = {};
	const previous: Record<number, number | null> = {};
	const visitedNodes = new Set<number>();
	const visitedEdges: Array<[number, number]> = []; // Array of tuples for edges
	const steps: DijkstraStep[] = [];
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
		steps.push({
			currentNode,
			currentEdge,
			distances: { ...distances },
			previous: { ...previous },
			visitedNodes: new Set(visitedNodes),
			visitedEdges: [...visitedEdges], // Clone the visitedEdges array
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
