<script lang="ts">
	import { onDestroy, onMount } from "svelte";
	import {
		createNode,
		edgeExists,
		getDotSrc,
		getEdgePosBetweenNodes,
		redraw,
		updateNodePositions,
	} from "./GraphBuilder";
	import type { D3Edge, D3Node, EdgeLayout, GraphLayout } from "../types/Graph";
	import { instance } from "@viz-js/viz";
	import Properties from "./Properties.svelte";
	import { writable } from "svelte/store";
	import * as d3 from "d3";

	export let directedGraph: boolean;
	let nodeCount = 0;
	let deletedNodes = 0;
	let svg: SVGElement;
	let nodes: D3Node[] = [];
	const selectedNodes = writable<D3Node[]>([]);
	let selectedEdge = writable<D3Edge | null>(null);
	let edges: D3Edge[] = [];
	let edgeLayout: EdgeLayout[];
	let tempNodeLabel: string;
	const editable = true;
	let dotSrc: string = "";


	const updateGraph = async () => {
		const dotSrcTemp = getDotSrc(nodes, edges, directedGraph);
		if (nodes.length === 0) {
			return;
		}
		if (directedGraph) {
			dotSrc = dotSrcTemp;
		} else {
			dotSrc = dotSrcTemp.replaceAll("->", "--").replaceAll("digraph", "graph");
		}

		const viz = await instance();
		const layout = (await viz.renderJSON(dotSrcTemp)) as GraphLayout;
		edgeLayout = layout.edges;

		// Update node positions based on the layout
		updateNodePositions(layout, nodes);

		// Update edge positions based on the layout
		edges.forEach((edge) => {
			edge.pos = getEdgePosBetweenNodes(
				edge.from.d3id,
				edge.to.d3id,
				edgeLayout,
				directedGraph
			);
		});
		redraw(
			svg,
			nodes,
			edges,
			selectedNodes,
			selectedEdge,
			directedGraph,
			editable
		);
	};


	onMount(() => {
		if (svg) {
			redraw(
				svg,
				nodes,
				edges,
				selectedNodes,
				selectedEdge,
				directedGraph,
				editable
			);
		}
	});

	/**
	 * Update the node label from the property menu
	 */
	const updateNodeLabel = (newLabel: string) => {
		selectedNodes.update((selNodes) => {
			if (selNodes.length === 1) {
				selNodes[0].label = tempNodeLabel;
			}
			return selNodes;
		});

		// Redraw the graph after label change
		updateGraph();
	};

	selectedNodes.subscribe((selNodes) => {
		if (selNodes.length === 0) {
			tempNodeLabel = "";
		}
	});

	selectedEdge.subscribe((selEdge) => {
		if (svg) {
			updateGraph();
		}
	});

	const copyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(dotSrc);
		} catch (err) {
			console.error("Failed to copy text: ", err);
		}
	};
</script>

<div class="container">
	<div class="graph">
		<svg bind:this={svg}></svg>
		<div class="sidebar">
			<div class="property-menu">
				<Properties
					bind:tempNodeLabel
					nodeLabel={$selectedNodes.length === 1
						? $selectedNodes[0].label
						: null}
					nodeID={$selectedNodes.length === 1 ? $selectedNodes[0].id : null}
					labelUpdate={updateNodeLabel}
					{selectedEdge}
				/>
			</div>
			<div class="dot-src-display">
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				{#if dotSrc}
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<span
						class="copy-icon"
						on:click={copyToClipboard}
						title="Copy to Clipboard"
					>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
							<path
								d="M19 21H9a2 2 0 0 1-2-2V7h2v12h10v2zm-6-4H5a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h8l6 6v8a2 2 0 0 1-2 2zm-1-9V3H5v12h8V8z"
							/>
						</svg>
					</span>
					<pre>{dotSrc}</pre>
				{:else}
					<pre>{"Currently no dot source has been generated!"}</pre>
				{/if}
			</div>
		</div>
	</div>
	<div class="button-container">
		<button
			on:click={async () => {
				nodes.push(createNode(`node${nodeCount + deletedNodes}`, nodeCount));
				selectedNodes.set([]);
				nodeCount++;
				await updateGraph();
			}}>Add Node</button
		>
		<button
			disabled={$selectedNodes.length !== 1}
			on:click={async () => {
				if ($selectedNodes.length === 1) {
					nodeCount--;
					deletedNodes++;
					edges = edges.filter(
						(edge) =>
							edge.from.d3id !== $selectedNodes[0].d3id &&
							edge.to.d3id !== $selectedNodes[0].d3id
					);
					const selNodeIndex = nodes.findIndex(
						(node) => node.id === $selectedNodes[0].id
					);
					nodes = nodes.filter((node) => node.d3id !== $selectedNodes[0].d3id);
					for (let i = selNodeIndex; i < nodes.length; i++) {
						nodes[i].d3id = i;
					}
					selectedNodes.set([]);
					if ($selectedEdge && !edges.includes($selectedEdge)) {
						selectedEdge.set(null);
					}
					if (nodes.length === 0) {
						dotSrc = "";
					}
					await updateGraph();
				}
			}}>Remove Selected Node</button
		>
		<button
			disabled={$selectedNodes.length !== 2}
			on:click={async () => {
				if ($selectedNodes.length === 2) {
					const fromNode = $selectedNodes[0];
					const toNode = $selectedNodes[1];

					// Check if an edge already exists in the same direction
					if (
						(directedGraph && !edgeExists(fromNode, toNode, edges)) ||
						(!directedGraph &&
							!edgeExists(fromNode, toNode, edges) &&
							!edgeExists(toNode, fromNode, edges))
					) {
						edges.push({
							from: fromNode,
							to: toNode,
							pos: "", // Initialize the edge with an empty `pos`
							weight: null,
						});
						selectedNodes.set([]);
						await updateGraph();
					} else {
						console.log(
							"Edge already exists between",
							fromNode.d3id,
							"and",
							toNode.d3id
						);
						alert(
							`Edge already exists from ${fromNode.label} to ${toNode.label}`
						);
						selectedNodes.set([]);
						await updateGraph();
					}
				}
			}}
		>
			{#if $selectedNodes.length === 2}
				Connect &nbsp;<span style="color: red;"
					>{$selectedNodes[0].label || $selectedNodes[0].id}</span
				>
				&nbsp and &nbsp
				<span style="color: blue;"
					>{$selectedNodes[1].label || $selectedNodes[1].id}</span
				>
			{:else}
				Select 2 nodes
			{/if}
		</button>
	</div>
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		height: 100%;
		padding: 10px;
		overflow: hidden;
	}

	.graph {
		flex-grow: 1;
		background-color: lightgray;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 1.5em;
		margin-bottom: 10px;
		overflow: hidden;
	}

	.sidebar {
		height: 100%;
		width: 300px;
		background-color: #ecf0f1;
		border-left: 1px solid #bdc3c7;
		padding: 10px;
		box-sizing: border-box;
		gap: 10px; /* Space between property menu and dot-src-display */
	}

	.button-container {
		display: flex;
		justify-content: space-between;
		height: 60px;
		min-height: 10%;
		background-color: #2c3e50;
	}

	button {
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: var(--generalBackground);
		color: var(--white);
		cursor: pointer;
		padding: 10px;
		font-size: 1em;
		height: 100%;
		border: none;
		border-radius: 5px;
		transition:
			background-color 0.3s,
			color 0.3s;
	}

	button:hover {
		background-color: var(--generalHover);
	}

	button:disabled {
		background-color: var(--buttonDisabled);
		color: #bdc3c7;
		cursor: not-allowed;
	}

	button:disabled:hover {
		background-color: var(--buttonDisabled);
	}

	.dot-src-display {
		background-color: #ecf0f1;
		color: var(--generalBackground);
		padding: 10px;
		border-radius: 5px;
		overflow: auto;
		font-family: monospace;
		font-size: 0.9em;
		border: 1px solid var(--generalBackground);
		margin-top: 10px;
		max-height: 200px;
		position: relative;
	}

	.copy-icon {
		position: absolute;
		top: 8px;
		right: 8px;
		cursor: pointer;
		color: var(--generalBackground);
		background: transparent;
		border: none;
		padding: 5px;
		border-radius: 3px;
	}

	.copy-icon:hover {
		color: #1abc9c;
	}

	@media (max-width: 300px) {
		.button-container {
			flex-direction: column;
		}

		button:not(:first-child) {
			margin-left: 0;
			margin-top: 5px;
		}

		button:not(:last-child) {
			margin-right: 0;
		}
	}

	svg {
		height: 100%;
		width: 100%;
		object-fit: contain;
	}
</style>
