<script lang="ts">
	import { AlgorithmMode } from "../algorithms/types";

	export let headersStart: string[] = [];
	export let headersScrollable: string[] = [];
	export let rowsStart: Array<string[]> = [];
	export let rowsScrollable: Array<string[]> = [];
	export let algorithmMode: AlgorithmMode;
</script>

<div class="table-scroll">
	<table class="main-table">
		<thead>
			<tr>
				<!-- Sticky Headers -->
				{#each headersStart as header, index}
					<th scope="col" class="sticky-{index + 1}">{header}</th>
				{/each}

				<!-- Scrollable Headers -->
				{#each headersScrollable as header, index}
					<th
						scope="col"
						class={index === headersScrollable.length - 1 &&
						algorithmMode === AlgorithmMode.DIJKSTRA
							? "sticky-right"
							: ""}>{header}</th
					>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each rowsStart as row, rowIndex}
				<tr>
					<!-- Sticky Columns -->
					{#each row as cell, cellIndex}
						<td class="sticky-{cellIndex + 1}">{cell}</td>
					{/each}

					<!-- Scrollable Columns -->
					{#each rowsScrollable[rowIndex] as scrollableCell, index}
						<td
							class={index === rowsScrollable[rowIndex].length - 1 &&
							algorithmMode === AlgorithmMode.DIJKSTRA
								? "sticky-right"
								: ""}>{@html scrollableCell}</td
						>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style lang="scss">
	$sticky-column-width: 100px;
	$max-sticky-columns: 5;

	* {
		box-sizing: border-box;
	}

	.table-scroll {
		position: relative;
		width: 100%;

		table {
			width: 100%;
			table-layout: fixed; // Fixed column widths for alignment
			border-collapse: separate; // Prevents collapsed borders
			border-spacing: 0; // Ensures borders appear collapsed
		}

		th,
		td {
			width: $sticky-column-width; // Explicit width
			min-width: $sticky-column-width;
			max-width: $sticky-column-width;
			padding: 5px;
			border-right: 1px solid var(--border); // Borders for table cells
			border-bottom: 1px solid var(--border);
			text-align: center;
			background-color: var(--tableCellBackground); // Default cell background
		}

		thead th {
			position: sticky;
			top: 0;
			z-index: 1;
			background: var(--tableHeaderBackground); // Sticky header background
			color: var(--tableHeaderText); // Sticky header text color
			border-top: 2px solid var(--tableBorder); // Top border for headers
			border-bottom: 2px solid var(--tableBorder); // Bottom border for headers
			border-right: 2px solid var(--tableBorder);
		}

		tbody td {
			border-right: 1px solid var(--tableCellBorder); // Right border for cells
		}

		tbody tr td:first-child,
		thead tr th:first-child {
			border-left: 2px solid var(--tableBorder); // Left border for the first column
		}

		// Sticky left columns styling
		@for $i from 1 through $max-sticky-columns {
			.sticky-#{$i} {
				position: sticky;
				left: calc(
					#{$sticky-column-width} * (#{$i - 1})
				); // Align sticky column to the left
				z-index: 2; // Ensure sticky column stays above scrollable cells
				background: var(--stickyColumnBackground); // Sticky column background
			}

			thead th.sticky-#{$i} {
				position: sticky;
				top: 0;
				left: calc(#{$sticky-column-width} * (#{$i - 1}));
				z-index: 3; // Header cells should have a higher z-index
				background: var(
					--stickyHeaderBackground
				); // Match header background color
				color: var(--stickyHeaderText); // Match header text color
			}
		}

		// Sticky right column styling (last column)
		.sticky-right {
			position: sticky;
			right: 0; // Sticky to the right edge
			z-index: 2;
			background: var(--stickyColumnBackground);
			border-left: 1px solid var(--border); // Border for separation
		}

		thead th.sticky-right {
			position: sticky;
			top: 0;
			right: 0; // Align to the right edge for headers
			z-index: 3;
			background: var(--stickyHeaderBackground);
			color: var(--stickyHeaderText);
			border-left: 1px solid var(--border);
		}
	}
</style>
