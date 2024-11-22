<script lang="ts">
	import type { D3Node } from "../types/Graph";
	import { findNodeByD3ID } from "./base";
	import Base from "./Base.svelte";
	import { AlgorithmMode, type AlgorithmStep } from "./types";

	const algorithm = AlgorithmMode.DIJKSTRA;

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

	const reconstructPath = (
		nodeId: number,
		previous: Record<number, number | null>,
		nodes: D3Node[]
	): string => {
		const path = [];
		let current: number | null = nodeId;
		while (current !== null) {
			path.unshift(findNodeByD3ID(current, nodes) || String(current));
			current = previous[current];
		}
		return path.join("<br>");
	};

	const calcRowDataForIndex = (
		nodes: D3Node[],
		steps: AlgorithmStep[],
		curIndex: number
	) => {
		// Map to maintain row data state
		const rowMap = new Map<
			number,
			{
				vv: string[];
				nv: string[];
				distances: (string | number)[];
				paths: string[]; // Separate paths for each node
				localMin: number | string;
			}
		>();

		const pathsMap = new Map<number, string>();

		// Process only up to `curIndex`
		for (let stepIndex = 0; stepIndex <= curIndex; stepIndex++) {
			const step = steps[stepIndex];

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
					.filter((label): label is string => label !== undefined)
					.sort((a, b) => a.localeCompare(b));

				// Get unvisited nodes by excluding visited node IDs
				const unvisitedNodes: string[] = nodes
					.filter((node) => !visitedNodeD3IDs.includes(node.d3id))
					.map((node) => node.label || node.id)
					.filter((label): label is string => label !== undefined)
					.sort((a, b) => a.localeCompare(b));

				// Update paths in pathsMap
				nodes.forEach((node) => {
					if (step.previous && step.previous[node.d3id] !== null) {
						pathsMap.set(
							node.d3id,
							reconstructPath(node.d3id, step.previous, nodes)
						);
					}
				});

				// Extract distances and keep them numeric for calculations
				const distances = nodes.map((node) => {
					const distance = step.distances?.[node.d3id];
					return distance !== undefined ? distance : ".";
				});

				// Extract paths separately
				const paths = nodes.map((node) => {
					return pathsMap.get(node.d3id) || "-";
				});

				// Add current step data to `rowMap`
				rowMap.set(step.currentNode, {
					vv: visitedNodeLabels,
					nv: unvisitedNodes,
					distances,
					paths,
					localMin: calculateLocalMin(
						distances.filter((d) => typeof d === "number")
					),
				});
			}
		}

		// Transform `rowMap` data into arrays for table rows
		const tableRows: string[][][] = [];
		rowMap.forEach((value, key) => {
			// Format distances with paths
			const distancesWithPaths = value.distances.map((distance, index) => {
				if (distance === "." || distance === "Infinity") {
					return String(distance); // No path for dots or Infinity
				}
				const path = value.paths[index];
				return `${distance}<br>via<br>${path}`;
			});

			tableRows.push([
				[
					findNodeByD3ID(key, nodes) || String(key),
					value.vv.join(" "),
					value.nv.join(" "),
				],
				[...distancesWithPaths, String(value.localMin)], // Add formatted distances
			]);
		});

		// Prepare each section of the table data for Svelte component props
		const rowsStart: Array<string[]> = tableRows.map((row) => [
			String(row[0][0]), // Current Vertex
			row[0][1], // Already Visited (concatenated labels)
			row[0][2], // Not Yet Visited (concatenated labels)
		]);

		// Scrollable columns (distances including paths and localMin)
		const rowsScrollable: Array<string[]> = tableRows.map((row) => row[1]);

		// Return structured data for the specific index
		return { rowsStart, rowsScrollable };
	};
</script>

<Base
	{algorithm}
	{headersStart}
	calcRowData={calcRowDataForIndex}
	bind:isTeacherMode
/>
