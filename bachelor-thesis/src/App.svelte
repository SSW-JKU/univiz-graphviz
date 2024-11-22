<script lang="ts">
	import { Router, Route, link } from "svelte-routing";
	import { onMount } from "svelte";
	import StartPage from "./pages/StartPage.svelte";
	import About from "./pages/About.svelte";
	import GraphsAndStuff from "./pages/GraphsAndStuff.svelte";
	import Visualizer from "./components/Visualizer.svelte";
	import BFS from "./algorithms/BFS.svelte";
	import DFS from "./algorithms/DFS.svelte";
	import Dijkstra from "./algorithms/Dijkstra.svelte";
	import Navbar from "./components/Navbar.svelte";
	import { writable } from "svelte/store";

	let currentPath = window.location.pathname;
	let navElement: HTMLElement | null = null;

	const updatePath = () => {
		currentPath = window.location.pathname;
	};

	const handleClick = (event: Event) => {
		const target = event.target as HTMLAnchorElement;
		if (target.tagName === "A") {
			currentPath = target.pathname;
		}
	};

	onMount(() => {
		// Listen for popstate events (browser back/forward buttons)
		window.addEventListener("popstate", updatePath);

		// Attach click listener to nav element
		if (navElement) {
			navElement.addEventListener("click", handleClick);
		}

		return () => {
			// Cleanup the popstate event listener and nav event listener on destroy
			window.removeEventListener("popstate", updatePath);
			if (navElement) {
				navElement.removeEventListener("click", handleClick);
			}
		};
	});
</script>

<main class="main">
	<nav bind:this={navElement}>
		<Router>
			<ul>
				<!-- Startpage -->
				<li>
					<a
						href="/"
						class="nav-link"
						use:link
						class:active={currentPath === "/"}>Home</a
					>
				</li>

				<!-- Dropdown for Modes -->
				<li class="dropdown">
					<div
						class="nav-link dropdown-header"
						class:active={currentPath.startsWith("/graphbuilding")}
					>
						Graph Building
					</div>
					<div class="dropdown-content">
						<a
							href="/graphbuilding/build-undirected-graph"
							class="dropdown-link"
							use:link>Build Undirected Graph</a
						>
						<a
							href="/graphbuilding/build-directed-graph"
							class="dropdown-link"
							use:link>Build Directed Graph</a
						>
						<a href="/graphbuilding/visualizer" class="dropdown-link" use:link
							>Graph Visualizer</a
						>
					</div>
				</li>

				<!-- Dropdown for Algorithms -->
				<li class="dropdown">
					<div
						class="nav-link dropdown-header"
						class:active={currentPath.startsWith("/algorithms")}
					>
						Algorithms
					</div>
					<div class="dropdown-content">
						<a href="/algorithms/bfs" class="dropdown-link" use:link>BFS</a>
						<a href="/algorithms/dfs" class="dropdown-link" use:link>DFS</a>
						<a href="/algorithms/dijkstra" class="dropdown-link" use:link
							>Dijkstra</a
						>
					</div>
				</li>

				<!-- About -->
				<li>
					<a
						href="/about"
						class="nav-link"
						use:link
						class:active={currentPath === "/about"}>About</a
					>
				</li>
			</ul>
		</Router>
	</nav>

	<Router>
		<!-- Routes -->
		<Route path="/" component={StartPage} />
		<Route
			path="/graphbuilding/build-undirected-graph"
			component={GraphsAndStuff}
			directedGraph={false}
		/>
		<Route
			path="/graphbuilding/build-directed-graph"
			component={GraphsAndStuff}
			directedGraph={true}
		/>
		<Route path="/graphbuilding/visualizer" component={Visualizer} />
		<Route path="/algorithms/bfs" component={BFS} />
		<Route path="/algorithms/dfs" component={DFS} />
		<Route path="/algorithms/dijkstra" component={Dijkstra} />
		<Route path="/about" component={About} />
	</Router>
</main>

<style>
	.main {
		display: flex;
		flex-direction: column;
		height: 100vh;
		margin: 0;
		padding: 0;
	}

	nav {
		background-color: var(--generalBackground);
		padding: 1rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		flex-shrink: 0;
	}

	ul {
		display: flex;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	li {
		position: relative;
		margin-right: 1.5rem;
	}

	.nav-link,
	.dropdown-header {
		font-size: 1.2rem;
		color: var(--white);
		text-decoration: none;
		padding: 0.5rem 1rem; /* Ensures consistent padding */
		border-radius: 5px;
		transition:
			background-color 0.3s,
			color 0.3s;
		display: flex;
		align-items: center; /* Vertically centers the text */
	}

	.nav-link:hover,
	.dropdown-header:hover {
		background-color: var(--generalHover);
	}

	.dropdown-header::after {
		content: "▼"; /* Arrow symbol */
		font-size: 0.8rem;
		margin-left: 0.5rem;
		transition: transform 0.3s ease;
		display: inline-block;
	}

	/* Rotate the arrow when hovered */
	.dropdown:hover .dropdown-header::after {
		transform: rotate(180deg);
	}

	.dropdown-content {
		display: none;
		position: absolute;
		background-color: var(--generalBackground);
		min-width: 160px;
		top: 100%;
		left: 0;
		box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
		z-index: 10;
	}

	/* Ensure the dropdown stays open when hovering over header or content */
	.dropdown:hover .dropdown-content,
	.dropdown-content:hover {
		display: block;
	}

	.dropdown-content .dropdown-link {
		color: var(--white);
		padding: 12px 16px;
		text-decoration: none;
		display: block;
	}

	.dropdown-content .dropdown-link:hover {
		background-color: var(--generalHover);
	}

	.nav-link.active {
		background-color: var(--dropdownSelected);
		color: var(--white);
		font-weight: bold;
	}
</style>
