<script lang="ts">
	import type { D3Node } from "../types/Graph";
	import Base from "./Base.svelte";
	import { AlgorithmMode, type AlgorithmStep } from "./types";
	import { calcRowData } from "./BFSandDFS";
	import { onMount } from "svelte";

	// Constants
	const algorithm = AlgorithmMode.DFS;
	const headersStart = ["Current node"];

	// Bindable variable
	let isTeacherMode = false;

	let dotSrc = "";

	onMount(() => {
		const params = new URLSearchParams(window.location.search);
		dotSrc = params.get("dotSrc") || "";
	});
</script>

<Base {algorithm} {headersStart} {calcRowData} {dotSrc} bind:isTeacherMode />
