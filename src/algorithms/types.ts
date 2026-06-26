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
	petAnnotations?: PedagogicalAnnotation[];
}

export type TableRows = {
	rowsStart: string[][];
	rowsScrollable: string[][];
};

export type PetView = "GraphView" | "TableView";

export type PetAnnotationTarget =
	| { kind: "graph" }
	| { kind: "node"; nodeId: number }
	| { kind: "edge"; fromId: number; toId: number }
	| { kind: "distance"; nodeId: number }
	| { kind: "localMin" };

export type PetQuestionOption = {
	id: string;
	label: string;
	correct: boolean;
	feedback?: string;
};

export type PetQuestionAnswer = {
	optionId: string;
	correct: boolean;
	feedback?: string;
};

export type PetAnnotationBase = {
	id: string;
	view?: PetView;
	target: PetAnnotationTarget;
};

export type PetSayAnnotation = PetAnnotationBase & {
	action: "say";
	payload: {
		text: string;
	};
};

export type PetHighlightAnnotation = PetAnnotationBase & {
	action: "highlight";
	payload?: {
		color?: string;
		opacity?: number;
		padding?: number;
	};
};

export type PetAskAnnotation = PetAnnotationBase & {
	action: "ask";
	payload: {
		question: string;
		options: PetQuestionOption[];
		gate?: boolean;
	};
};

export type PedagogicalAnnotation =
	| PetSayAnnotation
	| PetHighlightAnnotation
	| PetAskAnnotation;

export enum AlgorithmMode {
	DIJKSTRA = "DIJKSTRA",
	BFS = "BFS",
	DFS = "DFS",
};
