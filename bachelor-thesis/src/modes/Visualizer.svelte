<script lang="ts">
	import { instance, type Viz } from "@viz-js/viz";
	import { convertDotSrc } from "../components/GraphRenderer";
	import type { D3Edge, D3Node, EdgeLayout } from "../types/Graph";
	import { writable, get } from "svelte/store";
	import { onMount, onDestroy } from "svelte";
	import * as d3 from "d3";
	import "d3-graphviz";
	import { dijkstra, type DijkstraStep } from "../algorithms/Dijkstra";

	// CodeMirror imports
	import { EditorState } from "@codemirror/state";
	import { EditorView, lineNumbers } from "@codemirror/view";
	import { dot } from "@viz-js/lang-dot";
	import { indentOnInput } from "@codemirror/language";
	import { redraw } from "./GraphBuilder";

	let svg: SVGElement;
	let edgeLayout: EdgeLayout[];
	const selectedNodes = writable<D3Node[]>([]);
	let selectedEdge = writable<D3Edge | null>(null);
	let viz: Viz;

	let dotSrc: string = "";
	let nodes: D3Node[] = [];
	let edges: D3Edge[] = [];
	let directedGraph: boolean = false;
	let errorMessage: string = "";
	let editor: EditorView;
	let editorContainer: HTMLDivElement;

	// Variables for Teacher Mode
	let steps: DijkstraStep[] = [];
	let currentStepIndex = 0;
	let currentDescription: string = "";
	let startNodeID: number | null = null;

	// Flags for mode states
	let isTeacherMode = false;

	// Table Headers and Data
	const distanceHeaders = writable<string[]>([]);
	const tableData = writable<
		Array<{
			currentVertex: string;
			visited: string;
			notVisited: string;
			distances: Record<string, number | string>;
			localMin: number | string;
		}>
	>([]);

	const initializeTableHeaders = () => {
		distanceHeaders.set(nodes.map((node) => `d(${node.label || node.id})`));
	};

	let lastTableEntry: null | {
		currentVertex: string;
		distances: Record<string, string | number>;
	} = null;

	const updateTableData = () => {
		const step = steps[currentStepIndex];
		const visitedNodes = nodes
			.filter((node) => step.visitedNodes.has(node.d3id))
			.map((node) => node.label || node.id)
			.join(", ");
		const notVisitedNodes = nodes
			.filter((node) => !step.visitedNodes.has(node.d3id))
			.map((node) => node.label || node.id)
			.join(", ");

		const distances = nodes.reduce(
			(acc, node) => {
				const distance = step.distances[node.d3id];
				const path = getPathToNode(node.d3id, step.previous, distance);

				acc[`d(${node.label || node.id})`] = path;
				return acc;
			},
			{} as Record<string, string>
		);

		// Calculate localMin as the minimum distance of nodes that are not yet visited
		const notVisitedDistances = Object.keys(step.distances)
			.filter((key) => !step.visitedNodes.has(parseInt(key))) // Only include non-visited nodes
			.map((key) => step.distances[parseInt(key)])
			.filter((distance) => distance !== Infinity) as number[]; // Ignore Infinity distances

		const localMin =
			notVisitedDistances.length > 0 ? Math.min(...notVisitedDistances) : "-";

		const currentVertexLabel =
			step.currentNode !== null
				? findNodeByD3ID(step.currentNode)?.label ||
					findNodeByD3ID(step.currentNode)?.id ||
					""
				: "";

		if (
			!lastTableEntry ||
			lastTableEntry.currentVertex !== currentVertexLabel
		) {
			const newEntry = {
				currentVertex: currentVertexLabel,
				visited: visitedNodes,
				notVisited: notVisitedNodes,
				distances,
				localMin,
			};
			tableData.update((data) => [...data, newEntry]);
			lastTableEntry = {
				currentVertex: currentVertexLabel,
				distances: { ...distances },
			};
		}
	};

	// Helper function to reconstruct the path to a node
	const getPathToNode = (
		nodeId: number,
		previous: Record<number, number | null>,
		distance: number
	): string => {
		if (distance === Infinity) {
			return `∞<br>not seen`;
		}

		const path: Array<string | number> = [];
		let current: number | null = nodeId;

		while (current !== null) {
			const nodeLabel =
				findNodeByD3ID(current)?.label ||
				findNodeByD3ID(current)?.id ||
				current;
			path.unshift(nodeLabel);
			current = previous[current];
		}

		// Format with distance on the first line, "from" on the second, and each path entry on its own line
		return `${distance}<br>from<br>${path.join(",<br>")}`;
	};

	onMount(() => {
		(async () => {
			viz = await instance();
			editor = new EditorView({
				state: EditorState.create({
					doc: dotSrc,
					extensions: [
						lineNumbers(),
						dot(),
						indentOnInput(),
						EditorView.updateListener.of((update) => {
							if (update.docChanged) {
								dotSrc = editor.state.doc.toString();
								updateGraph();
							}
						}),
					],
				}),
				parent: editorContainer,
			});
		})();
	});

	onDestroy(() => {
		editor.destroy();
	});

	const updateGraph = async () => {
		if (dotSrc && viz) {
			try {
				const isUndirected = /\bgraph\b/g.test(dotSrc);
				let dotSrcReplace = isUndirected
					? dotSrc.replaceAll("--", "->").replaceAll("graph", "digraph")
					: dotSrc;
				directedGraph = !isUndirected;

				[nodes, edges] = convertDotSrc(dotSrcReplace, viz);
				redraw(
					svg,
					nodes,
					edges,
					selectedNodes,
					selectedEdge,
					directedGraph,
					false
				);
				initializeTableHeaders();
				errorMessage = "";
			} catch (error) {
				errorMessage =
					error instanceof Error
						? "Please enter a valid DOT string! " + error.message
						: "";
			}
		}
	};

	const runDijkstra = () => {
		const selected = get(selectedNodes);
		if (selected.length === 1) {
			const startNode = selected[0];
			startNodeID = startNode.d3id;
			const result = dijkstra(nodes, edges, startNode.d3id);
			steps = result.steps;
			currentStepIndex = 0;
			isTeacherMode = true;
			resetGraph();
			d3.selectAll("[data-node]").style("cursor", "auto").on("click", null);
			d3.selectAll("[data-edge]").style("cursor", "auto").on("click", null);
			d3.selectAll("text").style("cursor", "auto").on("click", null);
			highlightStep(steps[currentStepIndex]);
			updateTableData();
		} else {
			console.log(
				"Please select exactly one node to run Dijkstra's algorithm."
			);
		}
		selectedNodes.set([]);
	};

	const selectedEdges: Array<[number, number]> = [];

	// Helper function to find an edge between two nodes
	const getEdge = (
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

	const removeEdge = (
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

	const edgeExists = (
		edges: Array<[number, number]>,
		edge: [number, number]
	): boolean => {
		return edges.some(
			(e) =>
				(e[0] === edge[0] && e[1] === edge[1]) ||
				(e[0] === edge[1] && e[1] === edge[0])
		);
	};

	const highlightStep = (step: DijkstraStep) => {
		currentDescription = step.description;

		// Reset all nodes and edges to their original state before highlighting
		d3.selectAll("[data-node]")
			.style("fill", "white")
			.style("stroke", "gray")
			.style("stroke-width", "1px");

		d3.selectAll("[data-edge]")
			.style("stroke", "black")
			.style("stroke-width", "1px");

		// Highlight the start node in red, if applicable
		if (startNodeID !== null) {
			d3.select(`[data-node="${startNodeID}"]`)
				.style("fill", "red")
				.style("stroke", "black")
				.style("stroke-width", "1px");
		}

		// Highlight the active node (current node) with a distinct style
		if (step.currentNode !== null) {
			d3.select(`[data-node="${step.currentNode}"]`)
				.style("stroke", "red")
				.style("stroke-width", "2px");
		}

		// Highlight the current edge being evaluated, if applicable
		if (step.currentEdge !== null) {
			const curEdge = getEdge(edges, step.currentEdge[0], step.currentEdge[1]);
			if (curEdge) {
				if (!edgeExists(selectedEdges, [curEdge.from.d3id, curEdge.to.d3id])) {
					selectedEdges.push([curEdge.from.d3id, curEdge.to.d3id]);
				}
				d3.select(`[data-edge="${curEdge.from.d3id}->${curEdge.to.d3id}"]`)
					.style("stroke", "blue")
					.style("stroke-width", "3px");
			}
		}

		// Highlight edges that are part of the visited path in green
		for (const visitedEdge of step.visitedEdges) {
			removeEdge(selectedEdges, visitedEdge);
			const curEdge = getEdge(edges, visitedEdge[0], visitedEdge[1]);
			if (curEdge) {
				d3.select(`[data-edge="${curEdge.from.d3id}->${curEdge.to.d3id}"]`)
					.style("stroke", "green")
					.style("stroke-width", "3px");
			}
		}

		// Highlight edges that are visited but not walked in blue
		for (const selEdge of selectedEdges) {
			const curEdge = getEdge(edges, selEdge[0], selEdge[1]);
			if (curEdge) {
				d3.select(`[data-edge="${curEdge.from.d3id}->${curEdge.to.d3id}"]`)
					.style("stroke", "blue")
					.style("stroke-width", "3px");
			}
		}

		// Highlight nodes that are fully visited in green, except the current node
		for (const visitedNode of step.visitedNodes) {
			if (visitedNode !== step.currentNode) {
				d3.select(`[data-node="${visitedNode}"]`)
					.style("stroke", "green")
					.style("stroke-width", "3px");
			}
		}
		console.log(selectedEdges);
		updateTableData();
	};

	const nextStep = () => {
		if (currentStepIndex < steps.length - 1) {
			currentStepIndex++;
			highlightStep(steps[currentStepIndex]);
		}
	};

	const previousStep = () => {
		if (currentStepIndex > 0) {
			const curEdge = steps[currentStepIndex].currentEdge;
			if (curEdge) {
				//console.log(selectedEdges, curEdge)
				removeEdge(selectedEdges, curEdge);
			}
			currentStepIndex--;
			highlightStep(steps[currentStepIndex]);
			tableData.update((data) => data.slice(0, currentStepIndex + 1));
		}
	};

	const resetGraph = () => {
		d3.selectAll("[data-node]")
			.style("stroke", "gray")
			.style("stroke-width", "1px");
		redraw(
			svg,
			nodes,
			edges,
			selectedNodes,
			selectedEdge,
			directedGraph,
			false
		);
		currentDescription = "";
	};

	const exitTeacherMode = () => {
		isTeacherMode = false;
		resetGraph();
		currentDescription = "";
		tableData.set([]);
		lastTableEntry = null; // Reset last table entry to prevent duplicates on restart
	};

	const findNodeByD3ID = (gvid: number): D3Node | undefined => {
		return nodes.find((node) => node.d3id === gvid);
	};
</script>

<div class="container">
	<div class="left">
		<div class="dot-editor" bind:this={editorContainer}></div>
		{#if errorMessage}
			<div class="error">{errorMessage}</div>
		{/if}
		{#if $selectedNodes.length === 1 && !isTeacherMode}
			<button on:click={runDijkstra}>Run Dijkstra's Algorithm</button>
		{/if}
		{#if isTeacherMode}
			<div class="teacher-controls">
				<p>Step {currentStepIndex + 1} of {steps.length}</p>
				<button on:click={previousStep} disabled={currentStepIndex === 0}
					>Previous</button
				>
				<button
					on:click={nextStep}
					disabled={currentStepIndex === steps.length - 1}>Next</button
				>
				<button on:click={exitTeacherMode}>Exit Teacher Mode</button>
			</div>
		{/if}
	</div>

	<div class="right">
		<svg bind:this={svg}></svg>
		<p class="step-description">{currentDescription}</p>

		<!-- Dynamic Table -->
		<div class="table-container">
			<table>
				<thead>
					<tr>
						<th>Current Vertex</th>
						<th>Already Visited (VV)</th>
						<th>Not Yet Visited (NV)</th>
						{#each $distanceHeaders as header}
							<th>{header}</th>
						{/each}
						<th>Local Min.</th>
					</tr>
				</thead>
				<tbody>
					{#each $tableData as row}
						<tr>
							<td>{row.currentVertex}</td>
							<td>{row.visited}</td>
							<td>{row.notVisited}</td>
							{#each $distanceHeaders as header}
								<td>{@html row.distances[header]}</td>
							{/each}
							<td>{row.localMin}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>

<style>
	.container {
		display: flex;
		height: 100vh;
		width: 100%;
	}

	.left {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 10px;
		background-color: #f0f0f0;
		box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.05);
	}

	.right {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		background-color: lightgray;
		padding: 10px;
	}

	.dot-editor {
		flex-grow: 1;
		height: 100%;
		background-color: #f0f0f0;
	}

	.teacher-controls {
		margin-top: 10px;
		display: flex;
		gap: 10px;
		align-items: center;
		position: sticky;
	}

	.error {
		margin-top: 10px;
		color: #e74c3c;
		background-color: rgba(231, 76, 60, 0.1);
		border-left: 4px solid #e74c3c;
		padding: 10px 15px;
		border-radius: 3px;
		font-weight: bold;
		font-size: 0.9rem;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
	}

	button {
		margin-top: 10px;
		padding: 10px 15px;
		font-size: 1rem;
		color: #fff;
		background-color: #3498db;
		border: none;
		border-radius: 5px;
		cursor: pointer;
		transition: background-color 0.3s;
	}

	button:hover {
		background-color: #2980b9;
	}

	button:disabled {
		background-color: #b3b3b3;
		cursor: not-allowed;
	}

	svg {
		width: 100%;
		height: 100%;
		object-fit: contain;
		background-color: white;
		border-radius: 5px;
	}

	.step-description {
		margin-top: 10px;
		font-size: 1.1rem;
		color: #333;
		text-align: center;
	}

	.table-container {
		width: 100%;
		margin-top: 20px;
		overflow-x: auto;
		overflow-y: auto; /* Enable vertical scrolling */
		height: 300px;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		text-align: center;
		background-color: #fff;
		font-size: 0.9rem;
	}

	th,
	td {
		padding: 8px;
		border: 1px solid #ccc;
	}

	th {
		background-color: #f0f0f0;
		font-weight: bold;
		position: sticky; /* Make header sticky */
		top: 0; /* Stick to the top of the container */
		z-index: 1; /* Ensure it stays above other content */
	}

	tbody tr:nth-child(even) {
		background-color: #f9f9f9;
	}
</style>
