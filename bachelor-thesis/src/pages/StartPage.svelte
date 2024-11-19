<script lang="ts">
</script>

<main class="about-container">
	<div class="scroll-box">
		<section class="intro">
			<h1>About This Application</h1>
			<p>
				This application is a platform for visualizing various graph structures
				and algorithms. It allows you to explore how different algorithms work
				on graphs, and interact with visual representations of the data
				structures. Below, you will find details about the modes and algorithms
				available.
			</p>
		</section>

		<section class="mode-section">
			<h2>Available Modes</h2>

			<div class="mode-card">
				<h3>Build Undirected Graph</h3>
				<p>
					Create undirected graphs quickly and easily in this mode. Connect
					nodes with bidirectional edges and explore graph scenarios like
					networks, social connections, and more. Use this mode to model graphs
					where relationships are reciprocal.
				</p>
			</div>

			<div class="mode-card">
				<h3>Build Directed Graph</h3>
				<p>
					Build directed graphs where edges have a clear direction. This mode is
					ideal for representing workflows, dependencies, or hierarchical
					structures. Experiment with directed graphs to understand pathfinding,
					cycle detection, and more.
				</p>
			</div>

			<div class="mode-card">
				<h3>Graph Visualizer</h3>
				<p>
					The Graph Visualizer allows you to create and manipulate graphs
					interactively. Build directed or undirected graphs and observe their
					properties, connections, and structures. It's perfect for
					experimenting with graph theory concepts.
				</p>
			</div>
		</section>

		<section class="algorithm-section">
			<h2>Algorithms</h2>
			<p>
				This application also offers implementations of the most important graph
				traversal algorithms:
			</p>

			<ul class="algorithm-list">
				<li>
					<strong>BFS (Breadth-First Search):</strong> Traverse the graph level by
					level, exploring all nodes at the current depth before moving deeper. Ideal
					for finding the shortest path in unweighted graphs.
				</li>
				<li>
					<strong>DFS (Depth-First Search):</strong> Dive deep into the graph by
					following one branch as far as possible before backtracking. Great for
					exploring connected components or paths in a graph.
				</li>
				<li>
					<strong>Dijkstra's Algorithm:</strong> Compute the shortest path between
					nodes in weighted graphs. Widely used in networking, navigation, and logistics.
				</li>
			</ul>
			<p>
				Each algorithm is visualized step by step, giving you insights into
				their inner workings and decision-making processes. Experiment with
				custom graphs or test the algorithms on provided examples to see how
				they perform.
			</p>
		</section>

		<section class="get-started-section">
			<h2>Get Started</h2>
			<p>
				Ready to explore? Use the navigation menu to build your first graph, run
				an algorithm, or dive into one of the test graphs. Whether you're here
				to learn or experiment, this application provides the tools you need to
				succeed.
			</p>
			<p>
				Have fun exploring graph algorithms and structures, and enjoy the
				journey into the world of graph theory!
			</p>
		</section>
	</div>
	<div class="spacer"></div>
</main>

<style>
	:root {
		--primary: #000; /* Fallback, will be overridden by JS */
	}
	.about-container {
		font-family: Arial, sans-serif;
		color: #2c3e50;
		max-width: 90%;
		margin: 0 auto;
		padding: 2rem;
		height: calc(100vh - 4rem);
		display: flex;
		justify-content: center;
		align-items: center;
		padding-bottom: 2rem;
		flex-direction: column;
	}

	.scroll-box {
		width: 100%;
		max-width: 1000px;
		height: fit-content;
		overflow-y: auto;
		padding: 2rem;
		background-color: #fff;
		border: 1px solid #ccc;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	h1 {
		font-size: 2.5rem;
		color: #ff9e2c;
		margin-bottom: 1rem;
	}

	h2 {
		font-size: 2rem;
		margin-bottom: 1rem;
		border-bottom: 2px solid #ff9e2c;
		padding-bottom: 0.5rem;
	}

	h3 {
		font-size: 1.5rem;
		margin-bottom: 0.5rem;
	}

	p {
		margin-bottom: 1.5rem;
		font-size: 1.1rem;
	}

	.intro p {
		background-color: #f5f5f5;
		padding: 1rem;
		border-radius: 8px;
	}

	.mode-section,
	.algorithm-section {
		margin-top: 2rem;
	}

	.mode-card {
		background-color: #ecf0f1;
		padding: 1.5rem;
		margin-bottom: 1.5rem;
		border-left: 5px solid #ff9e2c;
		border-radius: 8px;
	}

	.mode-card h3 {
		margin-top: 0;
		color: #34495e;
	}

	.mode-card p {
		margin-bottom: 0;
		font-size: 1.1rem;
	}

	.algorithm-list {
		list-style: none;
		padding-left: 0;
	}

	.algorithm-list li {
		margin-bottom: 1rem;
		padding-left: 1rem;
		border-left: 4px solid #ff9e2c;
		background-color: #f5f5f5;
		padding: 1rem;
		border-radius: 4px;
		font-size: 1.1rem;
	}

	.algorithm-list li strong {
		color: #34495e;
	}

	/* Scrollbar Styling */
	.scroll-box::-webkit-scrollbar {
		width: 12px;
	}

	.scroll-box::-webkit-scrollbar-track {
		background: #f1f1f1;
	}

	.scroll-box::-webkit-scrollbar-thumb {
		background-color: #888;
		border-radius: 10px;
		border: 3px solid #f1f1f1;
	}

	.scroll-box::-webkit-scrollbar-thumb:hover {
		background-color: #555;
	}

	.get-started-section {
		margin-top: 2rem; /* Add space above the section */
		padding: 1.5rem; /* Add padding around the content */
		background-color: #f9f9f9; /* Light background color for distinction */
		border-left: 5px solid #007bff; /* Blue border for emphasis */
		border-radius: 8px; /* Rounded corners for a softer look */
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
	}

	.get-started-section h2 {
		color: #2c3e50; /* Darker text for the heading */
		margin-bottom: 1rem; /* Space below the heading */
	}

	.get-started-section p {
		font-size: 1.15rem; /* Slightly larger text for readability */
		color: #34495e; /* Text color */
		line-height: 1.6; /* Improve line spacing for readability */
	}

	.spacer {
		height: 70px; /* 70 px cause of navbar TODO */
		width: 100%; /* Ensure it spans the full width */
	}
</style>
