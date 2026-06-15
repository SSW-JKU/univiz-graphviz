<script lang="ts">
	import { onMount } from "svelte";
	import type { D3Node } from "../types/Graph";
	import { calcRowData } from "./BFSandDFS";
	import Base from "./Base.svelte";
	import { AlgorithmMode, type AlgorithmStep } from "./types";

	// Constants
	const algorithm = AlgorithmMode.BFS;
	const headersStart = ["Current Node"];

	// Bindable variable
	let isTeacherMode = false;

	let dotSrc = "";

	onMount(() => {
		const params = new URLSearchParams(window.location.search);
		dotSrc = params.get("dotSrc") || "";
	});
</script>

<Base {algorithm} {headersStart} {calcRowData} {dotSrc} bind:isTeacherMode />
