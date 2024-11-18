<script lang="ts">
	import { instance, type Viz } from "@viz-js/viz";
	import { convertDotSrc } from "../components/GraphRenderer";
	import type { D3Edge, D3Node, EdgeLayout } from "../types/Graph";
	import { onMount, onDestroy } from "svelte";
	import * as d3 from "d3";
	import "d3-graphviz";

	// CodeMirror imports
	import { EditorState } from "@codemirror/state";
	import { EditorView, lineNumbers } from "@codemirror/view";
	import { dot } from "@viz-js/lang-dot";
	import { indentOnInput } from "@codemirror/language";
	import { redraw } from "./GraphBuilder";
	import { writable } from "svelte/store";

	let svg: SVGElement;
	let edgeLayout: EdgeLayout[];
	let viz: Viz;

	let dotSrc: string = "";
	let nodes: D3Node[] = [];
	let edges: D3Edge[] = [];
	let directedGraph: boolean = false;
	let errorMessage: string = "";
	let editor: EditorView;
	let editorContainer: HTMLDivElement;
	let selectedEdge = writable<D3Edge | null>(null)

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
				// Disable selection-related parameters in `redraw` call
				redraw(svg, nodes, edges, null, selectedEdge, directedGraph, false);
				errorMessage = "";
			} catch (error) {
				errorMessage =
					error instanceof Error
						? "Please enter a valid DOT string! " + error.message
						: "";
			}
		}
	};
</script>

<div class="container">
	<div class="left">
		<div class="dot-editor" bind:this={editorContainer}></div>
		{#if errorMessage}
			<div class="error">{errorMessage}</div>
		{/if}
	</div>

	<div class="right">
		<svg bind:this={svg}></svg>
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

	svg {
		width: 100%;
		height: 100%;
		object-fit: contain;
		background-color: white;
		border-radius: 5px;
	}
</style>
