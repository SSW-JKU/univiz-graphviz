<script lang="ts">
	import { derived, writable } from "svelte/store";
	import Graph1 from "../images/Graph1.png";
	import Graph2 from "../images/Graph2.png";
	import Graph3 from "../images/Graph3.png";
	import Graph4 from "../images/Graph4.png";
	import { graph1, graph2, graph3, graph4 } from "./Images";

	// Array of image sources
	const graphImages: string[] = [Graph1, Graph2, Graph3, Graph4];

	// Array of DOT sources
	const graphDotSrc: string[] = [graph1, graph2, graph3, graph4];

	// Current selected image index
	let selectedIndex = writable<number | null>(null);

	let selectedVisibleIndex = writable<number | null>(null);

	// Current index of the displayed images
	let currentIndex = writable(0);

	const mod = (a: number, b: number): number => {
		return ((a % b) + b) % b;
	};

	const shift = (direction: number) => {
		currentIndex.update((index) => mod(index + direction, graphImages.length));

		if ($selectedVisibleIndex !== null) {
			selectedVisibleIndex.update((index) => {
				const newIndex = mod(index! - direction, graphImages.length);
				if (newIndex > $visibleImages.length - 1) {
					selectedIndex.set(null);
					return null;
				}
				return newIndex;
			});
		}
	};

	const shiftLeft = () => shift(-1);
	const shiftRight = () => shift(1);

	selectedVisibleIndex.subscribe((index) => {
		console.log(index);
	});

	const visibleImages = derived(currentIndex, ($currentIndex) => {
		const total = graphImages.length;
		return [
			graphImages[$currentIndex],
			graphImages[mod($currentIndex + 1, total)],
			graphImages[mod($currentIndex + 2, total)],
		];
	});

	// Select an image when clicked
	const selectImage = (index: number) => {
		if (index === $selectedVisibleIndex) {
			selectedIndex.set(null);
			selectedVisibleIndex.set(null);
		} else {
			const selected = mod(index + $currentIndex, graphImages.length);
			selectedIndex.set(selected);
			selectedVisibleIndex.set(index);
		}
	};
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="graph-examples-container">
	<!-- Left arrow -->
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div class="arrow" on:click={shiftLeft}>&#9664;</div>

	<!-- Image display area -->
	<div class="image-boxes">
		{#each $visibleImages as image, idx}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div
				class="image-box"
				class:selected={$selectedVisibleIndex === idx}
				on:click={() => selectImage(idx)}
			>
				<img src={image} alt="Graph Example" />
			</div>
		{/each}
	</div>

	<!-- Right arrow -->
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div class="arrow" on:click={shiftRight}>&#9654;</div>
</div>

<!-- Buttons for BFS, DFS, and Dijkstra -->
{#if $selectedIndex !== null}
	<div class="button-container">
		<a
			href={/digraph/.test(graphDotSrc[$selectedIndex])
				? `/graphbuilding/build-directed-graph?dotSrc=${encodeURIComponent(graphDotSrc[$selectedIndex])}`
				: `/graphbuilding/build-undirected-graph?dotSrc=${encodeURIComponent(graphDotSrc[$selectedIndex])}`}
		>
			Edit Graph
		</a>
		<a
			href={`/algorithms/bfs?dotSrc=${encodeURIComponent(
				graphDotSrc[$selectedIndex]
			)}`}
		>
			BFS
		</a>
		<a
			href={`/algorithms/dfs?dotSrc=${encodeURIComponent(
				graphDotSrc[$selectedIndex]
			)}`}
		>
			DFS
		</a>
		<a
			href={`/algorithms/dijkstra?dotSrc=${encodeURIComponent(
				graphDotSrc[$selectedIndex]
			)}`}
		>
			Dijkstra
		</a>
	</div>
{/if}

<style>
	.graph-examples-container {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100vw;
		height: 100vh;
		background-color: #fff;
	}

	.arrow {
		font-size: 3rem;
		font-weight: bold;
		cursor: pointer;
		user-select: none;
		padding: 20px;
		color: black;
	}

	.arrow:hover {
		color: #2980b9;
		transform: scale(1.1);
	}

	.image-boxes {
		display: flex;
		gap: 20px;
		overflow: hidden;
		width: 80%; /* Adjust container width */
	}

	.image-box {
		flex: 1; /* Ensure images fill available space */
		max-width: 30%; /* Adjust the visible image size */
		background-color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 5px solid black;
		box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
		cursor: pointer;
		transition: border-color 0.3s;
		aspect-ratio: 2 / 3; /* Maintain a consistent aspect ratio */
	}

	.image-box img {
		width: auto;
		height: auto;
		max-width: 100%;
		max-height: 100%;
		object-fit: contain; /* Ensure the image scales while maintaining aspect ratio */
		background-color: white; /* Fill any remaining space with white */
	}

	.image-box.selected {
		border-color: red; /* Highlight selected image with red border */
	}

	.button-container {
		display: flex;
		justify-content: center;
		margin-top: 20px;
		margin-bottom: 20px;
		gap: 15px;
	}

	.button-container a {
		text-decoration: none;
		padding: 10px 20px;
		font-size: 1rem;
		border-radius: 5px;
		background-color: #3498db;
		color: white;
		text-align: center;
		transition: background-color 0.3s;
	}

	.button-container a:hover {
		background-color: #2980b9;
	}
</style>
