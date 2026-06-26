import type { D3Edge, D3Node } from "../types/Graph";
import type {
	AlgorithmStep,
	PedagogicalAnnotation,
	PetAnnotationTarget,
	PetQuestionOption,
} from "./types";

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
	const visitedEdges: Array<[number, number]> = [];
	const shortestPathsToNodes: Array<[number, number]> = [];
	const steps: AlgorithmStep[] = [];
	const unvisited = new Set<number>();
	const seenButNotVisited = new Set<number>();
	// Values are PET annotation IDs already attached to recorded steps.
	const recordedPetAnnotationIds = new Set<string>();
	let nextPetAnnotationId = 0;

	// Initialize distances and unvisited set
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

	const petId = (suffix: string) =>
		`dijkstra-${steps.length}-${nextPetAnnotationId++}-${suffix}`;
	const nodeTarget = (nodeId: number): PetAnnotationTarget => ({
		kind: "node",
		nodeId,
	});
	const edgeTarget = (fromId: number, toId: number): PetAnnotationTarget => ({
		kind: "edge",
		fromId,
		toId,
	});
	const distanceTarget = (nodeId: number): PetAnnotationTarget => ({
		kind: "distance",
		nodeId,
	});

	const relaxationQuestionOptions = (
		nodeId: number,
		oldDistance: number,
		altDistance: number
	): PetQuestionOption[] => {
		const nodeLabel = findNodeLabel(nodeId);
		const oldLabel =
			oldDistance === Infinity ? "infinity" : String(oldDistance);
		const shouldUpdate = altDistance < oldDistance;

		return [
			{
				id: "update",
				label: `Update d(${nodeLabel}) to ${altDistance}`,
				correct: shouldUpdate,
				feedback: shouldUpdate
					? "Correct. The new route is shorter than the current tentative distance."
					: `Not this time. The current distance ${oldLabel} is already better.`,
			},
			{
				id: "keep",
				label: `Keep d(${nodeLabel}) at ${oldLabel}`,
				correct: !shouldUpdate,
				feedback: shouldUpdate
					? `The current distance ${oldLabel} can be improved to ${altDistance}.`
					: "Correct. Dijkstra only updates a distance when the new route is shorter.",
			},
		];
	};

	// Add a step with the new fields
	const addStep = (
		currentNode: number | null,
		currentEdge: [number, number] | null,
		description: string,
		petAnnotations: PedagogicalAnnotation[] = []
	) => {
		const currentStepIndex = steps.length;
		for (const annotation of petAnnotations) {
			if (recordedPetAnnotationIds.has(annotation.id)) {
				throw new Error(
					`Duplicate PET annotation id "${annotation.id}" while recording Dijkstra step ${currentStepIndex}.`
				);
			}
			recordedPetAnnotationIds.add(annotation.id);
		}

		const distancesWithDots: Record<number, number | string> = {};
		Object.keys(distances).forEach((key) => {
			const nodeId = Number(key);
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
			visitedEdges: [...visitedEdges],
			shortestPathsToNodes: [...shortestPathsToNodes], // Track shortest paths to seen nodes
			seenButNotVisitedNodes: Array.from(seenButNotVisited), // Track nodes seen but not visited
			description,
			petAnnotations,
		});
	};

	addStep(
		null,
		null,
		"Starting Dijkstra's algorithm with all distances set to infinity, except the start node.",
		[
			{
				id: petId("start-node-highlight"),
				action: "highlight",
				view: "GraphView",
				target: nodeTarget(startId),
				payload: { color: "#fff176", opacity: 0.45, padding: 10 },
			},
			{
				id: petId("start-node-say"),
				action: "say",
				view: "GraphView",
				target: nodeTarget(startId),
				payload: {
					text: `Start here: d(${findNodeLabel(startId)}) is 0. Every other vertex starts at infinity.`,
				},
			},
			{
				id: petId("start-distance-highlight"),
				action: "highlight",
				view: "TableView",
				target: distanceTarget(startId),
				payload: { color: "#fff176", opacity: 0.55 },
			},
		]
	);

	while (unvisited.size > 0) {
		const currentId = Array.from(unvisited).sort((a, b) => {
			if (distances[a] !== distances[b]) {
				return distances[a] - distances[b];
			}
			return String(findNodeLabel(a)).localeCompare(String(findNodeLabel(b)));
		})[0];

		if (distances[currentId] === Infinity) break;

		unvisited.delete(currentId);
		visitedNodes.add(currentId);

		// Remove the current node from seenButNotVisited
		seenButNotVisited.delete(currentId);

		if (previous[currentId] !== null) {
			const finalizedEdge: [number, number] = [previous[currentId]!, currentId];
			visitedEdges.push(finalizedEdge);
		}

		addStep(
			currentId,
			null,
			`Visiting node ${findNodeLabel(currentId)} with shortest distance ${
				distances[currentId]
			}.`,
			[
				{
					id: petId("visit-node-highlight"),
					action: "highlight",
					view: "GraphView",
					target: nodeTarget(currentId),
					payload: { color: "#b7f7c2", opacity: 0.38, padding: 12 },
				},
				{
					id: petId("visit-node-say"),
					action: "say",
					view: "GraphView",
					target: nodeTarget(currentId),
					payload: {
						text: `${findNodeLabel(
							currentId
						)} has the smallest tentative distance, so its distance is now final.`,
					},
				},
				{
					id: petId("local-min-highlight"),
					action: "highlight",
					view: "TableView",
					target: { kind: "localMin" },
					payload: { color: "#b7f7c2", opacity: 0.55 },
				},
			]
		);

		// Process neighbors
		const neighbors = getNeighbors(currentId, edges).sort((a, b) =>
			String(findNodeLabel(a.node)).localeCompare(String(findNodeLabel(b.node)))
		);

		neighbors.forEach(({ node, weight }) => {
			if (visitedNodes.has(node)) return;

			// Update distances and seen but not visited nodes
			const alt = distances[currentId] + weight;
			const currentEdge: [number, number] = [currentId, node];
			const previousDistance = distances[node];
			seenButNotVisited.add(node);

			// Build description for this edge
			let description = `Checking Edge ${findNodeLabel(
				currentId
			)} -> ${findNodeLabel(node)}. `;
			description += `Current shortest distance: ${distances[node]}. `;
			description += `New possible distance: ${alt}. `;

			if (alt < distances[node]) {
				distances[node] = alt;
				previous[node] = currentId;

				// Update the shortest paths to seen nodes
				const existingEdgeIndex = shortestPathsToNodes.findIndex(
					(edge) => edge[1] === node
				);
				if (existingEdgeIndex !== -1) {
					shortestPathsToNodes[existingEdgeIndex] = currentEdge;
				} else {
					shortestPathsToNodes.push(currentEdge);
				}

				description += `Update shortest distance to ${alt}.`;

				addStep(currentId, currentEdge, description, [
					{
						id: petId("relax-edge-question"),
						action: "ask",
						view: "GraphView",
						target: edgeTarget(currentId, node),
						payload: {
							question: `What should happen to d(${findNodeLabel(node)})?`,
							options: relaxationQuestionOptions(
								node,
								previousDistance,
								alt
							),
							gate: true,
						},
					},
					{
						id: petId("distance-table-highlight"),
						action: "highlight",
						view: "TableView",
						target: distanceTarget(node),
						payload: { color: "#ffcc80", opacity: 0.55 },
					},
				]);
			} else {
				description += `No change to shortest distance.`;
				addStep(currentId, currentEdge, description, [
					{
						id: petId("relax-edge-question"),
						action: "ask",
						view: "GraphView",
						target: edgeTarget(currentId, node),
						payload: {
							question: `What should happen to d(${findNodeLabel(node)})?`,
							options: relaxationQuestionOptions(
								node,
								previousDistance,
								alt
							),
							gate: true,
						},
					},
					{
						id: petId("distance-table-highlight"),
						action: "highlight",
						view: "TableView",
						target: distanceTarget(node),
						payload: { color: "#ffcc80", opacity: 0.55 },
					},
				]);
			}
		});

		// Remove edges to visited nodes from shortestPathsToNodes
		for (let i = shortestPathsToNodes.length - 1; i >= 0; i--) {
			if (visitedNodes.has(shortestPathsToNodes[i][1])) {
				shortestPathsToNodes.splice(i, 1);
			}
		}
	}

	addStep(
		null,
		null,
		"Dijkstra's algorithm finished. All shortest paths have been determined.",
		[
			{
				id: petId("finish-say"),
				action: "say",
				view: "GraphView",
				target: { kind: "graph" },
				payload: {
					text: "All reachable vertices are finalized. The green edges form the shortest-path tree.",
				},
			},
		]
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
