<script lang="ts">
	import type { D3Node } from "../types/Graph";
	import Base from "./Base.svelte";
	import { AlgorithmMode, type AlgorithmStep } from "./types";
	import { calcRowData } from "./BFSandDFS";

	// Constants
	const algorithm = AlgorithmMode.DFS;
	const headersStart = ["Index"];

	// Bindable variable
	let isTeacherMode = false;
</script>

<Base {algorithm} {headersStart} {calcRowData} bind:isTeacherMode />
