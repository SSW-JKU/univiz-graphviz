export interface AlgorithmStep {
	currentNode: number | null;
	currentEdge: [number, number] | null;
	visitedNodes: Set<number>;
	visitedEdges: Array<[number, number]>;
	description: string;
	// Optional fields for specific algorithms like Dijkstra
	distances?: Record<number, number | string>;
	previous?: Record<number, number | null>;
	shortestPathsToNodes?: Array<[number, number]>; // Optional, tracks shortest edges for seen nodes
	seenButNotVisitedNodes?: Array<number>; // Optional, tracks nodes seen but not visited
	queue?: number[];
	neighbors?: Array<number>;
	unneededEdges?: [number, number][];
	curPath?: Array<[number, number]>
}

export type TableRows = {
	rowsStart: string[][];
	rowsScrollable: string[][];
};

export enum AlgorithmMode {
	DIJKSTRA = "DIJKSTRA",
	BFS = "BFS",
	DFS = "DFS",
};
