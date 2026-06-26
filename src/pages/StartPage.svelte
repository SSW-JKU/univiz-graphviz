<script lang="ts">
	import { algorithms, modes } from "./StartPage";
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
			{#each modes as mode}
				<div class="mode-card">
					<h3>{mode.title}</h3>
					<p>{mode.description}</p>
				</div>
			{/each}
		</section>

		<section class="algorithm-section">
			<h2>Algorithms</h2>
			<p>
				This application also offers implementations of the most important graph
				traversal algorithms:
			</p>

			<ul class="algorithm-list">
				{#each algorithms as algorithm}
					<li>
						<strong>{algorithm.title}:</strong>
						{algorithm.description}
					</li>
				{/each}
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
	.about-container {
		font-family: Arial, sans-serif;
		color: var(--textColor);
		max-width: 90%;
		margin: 0 auto;
		padding: 2rem;
		height: calc(100vh - 4rem);
		display: flex;
		flex-direction: column;
		align-items: center;
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
		box-shadow: var(--boxShadow);
	}

	h1 {
		font-size: var(--fontLarge);
		color: var(--primary);
		margin-bottom: 1rem;
	}

	h2 {
		font-size: var(--fontMedium);
		margin-bottom: 1rem;
		border-bottom: 2px solid var(--primary);
		padding-bottom: 0.5rem;
	}

	h3 {
		font-size: var(--fontSmall);
		color: var(--secondary);
		margin-bottom: 0.5rem;
	}

	p {
		font-size: var(--fontRegular);
		line-height: 1.6;
		margin-bottom: 1.5rem;
	}

	.mode-card,
	.get-started-section {
		background-color: var(--background);
		padding: 1.5rem;
		margin-bottom: 1.5rem;
		border-left: 5px solid var(--primary);
		border-radius: 8px;
	}

	.algorithm-list li {
		margin-bottom: 1rem;
		padding: 1rem;
		border-left: 4px solid var(--primary);
		background-color: #f5f5f5;
		border-radius: 4px;
	}

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
</style>
