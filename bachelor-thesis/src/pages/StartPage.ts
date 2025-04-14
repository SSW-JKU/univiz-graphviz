export const modes = [
	{
		title: "Build Undirected Graph",
		description:
			"Create undirected graphs quickly and easily in this mode. Connect nodes with bidirectional edges and explore graph scenarios like networks, social connections, and more. Use this mode to model graphs where relationships are reciprocal.",
	},
	{
		title: "Build Directed Graph",
		description:
			"Build directed graphs where edges have a clear direction. This mode is ideal for representing workflows, dependencies, or hierarchical structures. Experiment with directed graphs to understand pathfinding, cycle detection, and more.",
	},
	{
		title: "Graph Visualizer",
		description:
			"The Graph Visualizer allows you to create and manipulate graphs interactively. Build directed or undirected graphs and observe their properties, connections, and structures. It's perfect for experimenting with graph theory concepts.",
	},
	{
		title: "Graph Examples",
		description:
			"Test and modify graph algorithms with predefined editable examples. Choose from sample graphs for shortest path (Dijkstra's algorithm), minimum spanning tree (Prim’s/Kruskal’s algorithm), or depth-first and breadth-first search. They can also be opened directly in the edit mode.",
	},
];

export const algorithms = [
	{
		title: "BFS (Breadth-First Search)",
		description:
			"Traverse the graph level by level, exploring all nodes at the current depth before moving deeper. Ideal for finding the shortest path in unweighted graphs.",
	},
	{
		title: "DFS (Depth-First Search)",
		description:
			"Dive deep into the graph by following one branch as far as possible before backtracking. Great for exploring connected components or paths in a graph.",
	},
	{
		title: "Dijkstra's Algorithm",
		description:
			"Compute the shortest path between nodes in weighted graphs. Widely used in networking, navigation, and logistics.",
	},
];
