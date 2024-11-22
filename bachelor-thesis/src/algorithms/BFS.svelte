<script lang="ts">
	import type { D3Node } from "../types/Graph";
	import { calcRowData } from "./BFSandDFS";
	import Base from "./Base.svelte";
	import { AlgorithmMode, type AlgorithmStep } from "./types";

	// Constants
	const algorithm = AlgorithmMode.BFS;
	const headersStart = ["Index"];

	// Bindable variable
	let isTeacherMode = false;
</script>

<Base {algorithm} {headersStart} {calcRowData} bind:isTeacherMode />
