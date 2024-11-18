export interface AlgorithmStep {
	currentNode: number | null;
	currentEdge: [number, number] | null;
	visitedNodes: Set<number>;
	visitedEdges: Array<[number, number]>;
	selectedEdges: Array<[number, number]>;
	description: string;
	// Optional fields for specific algorithms like Dijkstra
	distances?: Record<number, number | string>;
	previous?: Record<number, number | null>;
}

export type TableRows = {
	rowsStart: string[][];
	rowsScrollable: string[][];
};
