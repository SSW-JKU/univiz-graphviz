<script lang="ts">
	import { instance, type Viz } from "@viz-js/viz";
	import { convertDotSrc } from "../components/GraphRenderer";
	import type { D3Edge, D3Node, EdgeLayout } from "../types/Graph";
	import { writable, get } from "svelte/store";
	import { onMount, onDestroy } from "svelte";
	import * as d3 from "d3";
	import "d3-graphviz";
	import { dijkstra, getEdge, removeEdge } from "../algorithms/Dijkstra";

	// CodeMirror imports
	import { EditorState } from "@codemirror/state";
	import { EditorView, lineNumbers } from "@codemirror/view";
	import { dot } from "@viz-js/lang-dot";
	import { indentOnInput } from "@codemirror/language";
	import { redraw } from "../components/GraphBuilder";
	import { bfs } from "../algorithms/BFS";
	import { dfs } from "../algorithms/DFS";
	import {
		AlgorithmMode,
		type AlgorithmStep,
		type TableRows,
	} from "../algorithms/types";
	import DijkstraTable from "../components/DijkstraTable.svelte";
	import { alg } from "@dagrejs/graphlib";
	import { readOnlyTheme } from "./base";

	let svg: SVGElement;
	let edgeLayout: EdgeLayout[];
	const selectedNodes = writable<D3Node[]>([]);
	let selectedEdge = writable<D3Edge | null>(null);
	let viz: Viz;

	export let dotSrc: string = "";
	let nodes: D3Node[] = [];
	let edges: D3Edge[] = [];
	let directedGraph: boolean = false;
	let errorMessage: string = "";
	let editor: EditorView;
	let editorContainer: HTMLDivElement;

	export let algorithm: AlgorithmMode;

	// Variables for Teacher Mode
	let steps: AlgorithmStep[] = [];
	let currentStepIndex = 0;
	let currentDescription: string = "";
	let startNodeID: number | null = null;

	// Flags for mode states
	export let isTeacherMode = false;

	// Collapsible panel state
	let showEditor = true;
	let showTable = true;

	// Table display configuration
	export let headersStart: string[] = [];
	export let headersScrollable: string[] = [];

	let tableRows: TableRows;

	export let calcRowData: (
		nodes: D3Node[],
		step: AlgorithmStep[],
		curIndex: number
	) => {
		rowsStart: string[][];
		rowsScrollable: string[][];
	};

	// Function to initialize headers for distances
	const initializeTableHeaders = (nodes: D3Node[]) => {
		if (algorithm === AlgorithmMode.DIJKSTRA) {
			headersScrollable = nodes.map((node) => `d(${node.label || node.id})`);
			headersScrollable.push("Local Min");
		} else {
			headersScrollable = nodes.map((node) => String(node.d3id));
		}
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
						EditorView.editable.of(!isTeacherMode),
					],
				}),
				parent: editorContainer,
			});
			if (dotSrc) {
				updateGraph();
			}
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
				errorMessage = "";
			} catch (error) {
				errorMessage =
					error instanceof Error
						? "Please enter a valid DOT string! " + error.message
						: "";
			}
		}
	};

	const updateEditorState = (writable: boolean) => {
		const newState = EditorState.create({
			doc: editor.state.doc.toString(), // Keep the current document
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
				EditorView.editable.of(!writable),
				isTeacherMode ? readOnlyTheme : [],
			],
		});
		// Apply the new state to the editor
		editor.setState(newState);
	};

	const runAlgorithm = () => {
		const selected = get(selectedNodes);
		if (selected.length === 1) {
			const startNode = selected[0];
			startNodeID = startNode.d3id;
			steps = [];
			if (algorithm === AlgorithmMode.DIJKSTRA) {
				steps = dijkstra(nodes, edges, startNode.d3id).steps;
			} else if (algorithm === AlgorithmMode.BFS) {
				steps = bfs(nodes, edges, startNode.d3id).steps;
			} else if (algorithm === AlgorithmMode.DFS) {
				steps = dfs(nodes, edges, startNode.d3id).steps;
			}
			currentStepIndex = 0;
			isTeacherMode = true;
			updateEditorState(isTeacherMode);
			resetGraph();
			d3.selectAll("[data-node]").style("cursor", "auto").on("click", null);
			d3.selectAll("[data-edge]").style("cursor", "auto").on("click", null);
			d3.selectAll("text").style("cursor", "auto").on("click", null);
			highlightStep(steps[currentStepIndex]);
			initializeTableHeaders(nodes);
		} else {
			console.log("Please select exactly one node to start.");
		}
		selectedNodes.set([]);
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

	const highlightStep = (step: AlgorithmStep) => {
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

		// Highlight edges that are part of the visited path in green
		for (const visitedEdge of step.visitedEdges) {
			const curEdge = getEdge(edges, visitedEdge[0], visitedEdge[1]);
			if (curEdge) {
				d3.select(`[data-edge="${curEdge.from.d3id}->${curEdge.to.d3id}"]`)
					.style("stroke", "green")
					.style("stroke-width", "3px");
			}
		}

		// Highlight edges in the shortestPathsToNodes as blue if not already green
		if (step.shortestPathsToNodes) {
			for (const edge of step.shortestPathsToNodes) {
				const curEdge = getEdge(edges, edge[0], edge[1]);
				if (curEdge) {
					// Only apply blue if it's not already green
					const edgeSelection = d3.select(
						`[data-edge="${curEdge.from.d3id}->${curEdge.to.d3id}"]`
					);
					if (edgeSelection.style("stroke") !== "green") {
						edgeSelection.style("stroke", "blue").style("stroke-width", "3px");
					}
				}
			}
		}

		// Highlight nodes that are seen but not visited with a blue border
		if (step.seenButNotVisitedNodes) {
			for (const nodeId of step.seenButNotVisitedNodes) {
				d3.select(`[data-node="${nodeId}"]`)
					.style("stroke", "blue")
					.style("stroke-width", "2px");
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

		// Highlight the current edge being evaluated, if applicable
		if (step.currentEdge !== null) {
			const curEdge = getEdge(edges, step.currentEdge[0], step.currentEdge[1]);
			if (curEdge) {
				d3.select(`[data-edge="${curEdge.from.d3id}->${curEdge.to.d3id}"]`)
					.style("stroke", "red")
					.style("stroke-width", "3px");
			}
		}

		tableRows = calcRowData(nodes, steps, currentStepIndex);
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
			currentStepIndex--;
			highlightStep(steps[currentStepIndex]);
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
		updateEditorState(isTeacherMode);
		resetGraph();
		currentDescription = "";
	};

	const findNodeByD3ID = (gvid: number): D3Node | undefined => {
		return nodes.find((node) => node.d3id === gvid);
	};

	// Function to toggle editor and table visibility
	const toggleEditor = () => {
		showEditor = !showEditor;
		if (showEditor && editor) {
			editor.focus();
		}
	};

	const toggleTable = () => (showTable = !showTable);

	const handleSliderChange = (event: Event) => {
		const sliderValue = Number((event.target as HTMLInputElement).value);
		currentStepIndex = sliderValue;
		highlightStep(steps[currentStepIndex]);
	};

	function handleScroll(event: WheelEvent) {
		// Adjust the slider value based on the scroll delta
		let stepChange = event.deltaY > 0 ? 1 : -1; // Scroll down increases, scroll up decreases
		currentStepIndex = Math.min(
			steps.length - 1,
			Math.max(0, currentStepIndex + stepChange)
		);
		highlightStep(steps[currentStepIndex]);
	}
</script>

<div class="container">
	<!-- Left Sidebar with Collapsible Panels -->
	<div class="left-sidebar">
		<!-- Editor Panel -->
		<div class="panel">
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<div class="panel-header" on:click={toggleEditor}>
				Dot Editor - {algorithm}
				<span class="collapse-icon">{showEditor ? "▼" : "▲"}</span>
			</div>
			<!-- Apply a class to control visibility instead of removing it from the DOM -->
			<div
				class="panel-content dot-editor {showEditor ? '' : 'hidden'}"
				bind:this={editorContainer}
			></div>
			{#if errorMessage}
				<div class="error">{errorMessage}</div>
			{/if}
		</div>

		<!-- Table Panel -->
		<div class="panel">
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<div class="panel-header" on:click={toggleTable}>
				Table - {algorithm}
				<span class="collapse-icon">{showTable ? "▼" : "▲"}</span>
			</div>
			<div class="panel-content table-container {showTable ? '' : 'hidden'}">
				<DijkstraTable
					headersStart={isTeacherMode ? headersStart : []}
					headersScrollable={isTeacherMode ? headersScrollable : []}
					rowsStart={isTeacherMode ? tableRows.rowsStart || [] : []}
					rowsScrollable={isTeacherMode ? tableRows.rowsScrollable || [] : []}
					algorithmMode={algorithm}
				/>
			</div>
		</div>
	</div>

	<!-- Right Side for Graph Visualization -->
	<div class="right">
		<svg bind:this={svg}></svg>
		<p class="step-description">{currentDescription}</p>

		<!-- Algorithm Controls -->
		<div class="controls">
			<button
				on:click={runAlgorithm}
				disabled={$selectedNodes.length !== 1 || isTeacherMode}
			>
				{#if $selectedNodes.length !== 1 && !isTeacherMode}
					Please select a node to start the algorithm
				{:else if isTeacherMode}
					Algorithm is currently running
				{:else}
					Run Algorithm
				{/if}
			</button>
			{#if isTeacherMode}
				<button on:click={previousStep} disabled={currentStepIndex === 0}
					>Previous</button
				>
				<input
					on:wheel={handleScroll}
					type="range"
					min="0"
					max={steps.length - 1}
					value={currentStepIndex}
					on:input={handleSliderChange}
					class="step-slider"
				/>
				<button
					on:click={nextStep}
					disabled={currentStepIndex === steps.length - 1}>Next</button
				>
				<button on:click={exitTeacherMode}>Exit Teacher Mode</button>
			{/if}
		</div>
	</div>
</div>

<style>
	.container {
		display: flex;
		height: calc(100vh - var(--navbarHeight));
		width: 100%;
	}

	.left-sidebar {
		flex: 1;
		display: flex;
		flex-direction: column;
		background-color: var(--sidebarBackground);
		box-shadow: inset 0 0 10px var(--sidebarShadow);
		max-width: 60%;
		height: 100%;
	}

	.panel {
		margin: 10px;
		border: 1px solid var(--panelBorder);
		border-radius: 5px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		background-color: var(--panelBackground);
	}

	.panel-header {
		background-color: var(--panelHeaderBackground);
		color: var(--panelHeaderText);
		padding: 10px;
		cursor: pointer;
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-weight: bold;
		position: sticky;
		top: 0;
		z-index: 1;
	}

	.panel-content {
		flex-grow: 1;
		overflow-y: auto;
		background-color: var(--white);
	}

	.hidden {
		display: none;
	}

	.collapse-icon {
		font-size: 1.2em;
	}

	.dot-editor {
		flex-grow: 1;
		background-color: var(--panelBackground);
		overflow-y: auto;
	}

	.table-container {
		flex-grow: 1;
		overflow-y: auto;
	}

	.right {
		flex: 1;
		padding: 10px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background-color: var(--rightBackground);
	}

	svg {
		width: 100%;
		height: 100%;
		background-color: var(--svgBackground);
		border-radius: 5px;
		border: 1px solid var(--svgBorder);
	}

	.controls {
		display: flex;
		gap: 10px;
		margin-top: 10px;
	}

	button {
		padding: 8px 12px;
		font-size: 1rem;
		color: var(--white);
		background-color: var(--controlBackground);
		border: none;
		border-radius: 5px;
		cursor: pointer;
		transition: background-color 0.3s;
	}

	button:hover {
		background-color: var(--controlHoverBackground);
	}

	button:disabled {
		background-color: var(--buttonDisabled);
		cursor: not-allowed;
	}

	.step-slider {
		accent-color: var(--sliderAccent);
	}
	.step-slider:hover {
		accent-color: var(--sliderHoverAccent);
	}
</style>
