<script lang="ts">
    import type { D3Node } from "../types/Graph";
    import { dfs } from "./DFS";
    import Base from "./Base.svelte";
    import { AlgorithmMode, type AlgorithmStep } from "./types";

    const algorithm = AlgorithmMode.DFS;

    const headersStart = ["Index"];

    let isTeacherMode = false;

    const calcRowData = (nodes: D3Node[], step: AlgorithmStep) => {
        const visitedNodeD3IDs: number[] = step.visitedNodes.values().toArray();

        const rowsStart: Array<string[]> = [["Vertex"], ["Visited"]];

        const rowsScrollable: Array<string[]> = [
			nodes.map((node) => node.label || node.id),
			nodes.map((node) =>
            visitedNodeD3IDs.includes(node.d3id) ? "T" : "F")
		]; // No scrollable rows for DFS

        return { rowsStart, rowsScrollable };
    };
</script>

<Base {algorithm} {headersStart} {calcRowData} bind:isTeacherMode />