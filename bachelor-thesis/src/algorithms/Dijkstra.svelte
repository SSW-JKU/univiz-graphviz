<script lang="ts">
	import type { D3Node } from "../types/Graph";
	import { findNodeByD3ID } from "./base";
	import Base from "./Base.svelte";
	import type { AlgorithmStep } from "./types";
	const algorithm = "dijkstra";

	const headersStart = ["Current Vertex", "Already Visited", "Not Yet Visited"];

	let isTeacherMode = false;

	type test = {
		vv: string[];
		nv: string[];
		distances: (number | string)[];
		localMin: number | string;
	};

	const rowMap: Map<number, test> = new Map<number, test>();

	$: {
		if (!isTeacherMode) {
			rowMap.clear();
		}
	}

	const calculateLocalMin = (
		distances: (string | number)[]
	): number | string => {
		// Filter out only numeric values from the distances array
		const numericValues = distances.filter(
			(value): value is number => typeof value === "number"
		);

		if (numericValues.length === 0) {
			// Case where all values are dots (no numbers)
			return ".";
		}

		const minValue = Math.min(...numericValues);

		if (minValue === Infinity) {
			// Case where all numbers are Infinity
			return "Infinity";
		}

		return minValue;
	};

	const calcRowData = (nodes: D3Node[], step: AlgorithmStep) => {
		// Process data only if `currentNode` is not null or undefined
		if (step.currentNode !== null && step.currentNode !== undefined) {
			// Get visited nodes by converting their IDs to labels
			const visitedNodeD3IDs: number[] = step.visitedNodes.values().toArray();

			// Remove entries from `rowMap` if their key is not in `visitedNodeD3IDs`
			rowMap.forEach((_, key) => {
				if (!visitedNodeD3IDs.includes(key)) {
					rowMap.delete(key);
				}
			});

			const visitedNodeLabels: string[] = visitedNodeD3IDs
				.map((id) => findNodeByD3ID(id, nodes))
				.filter((label): label is string => label !== undefined);

			// Get unvisited nodes by excluding visited node IDs
			const unvisitedNodes: string[] = nodes
				.filter((node) => !visitedNodeD3IDs.includes(node.d3id))
				.map((node) => node.label || node.id)
				.filter((label): label is string => label !== undefined);

			// Extract distances if they exist in the step data
			const distances = step.distances ? Object.values(step.distances) : [];

			// Add current step data to `rowMap` for maintaining row state
			rowMap.set(step.currentNode, {
				vv: visitedNodeLabels,
				nv: unvisitedNodes,
				distances,
				localMin: calculateLocalMin(distances),
			});
		}

		// Transform `rowMap` data into arrays for table rows
		const tableRows: string[][][] = [];
		rowMap.forEach((value: test, key: number) => {
			tableRows.push([
				[
					findNodeByD3ID(key, nodes) || String(key),
					value.vv.join(" "),
					value.nv.join(" "),
				],
				[...value.distances.map(String), String(value.localMin)], // Include localMin in distances
			]);
		});

		// Prepare each section of the table data for Svelte component props
		const rowsStart: Array<string[]> = tableRows.map((row) => [
			String(row[0][0]), // Current Vertex
			row[0][1], // Already Visited (concatenated labels)
			row[0][2], // Not Yet Visited (concatenated labels)
		]);

		// Scrollable columns (distances including localMin)
		const rowsScrollable: Array<string[]> = tableRows.map((row) => row[1]);

		// Return structured data for Svelte component
		return { rowsStart, rowsScrollable };
	};
</script>

<Base {algorithm} {headersStart} {calcRowData} bind:isTeacherMode />
