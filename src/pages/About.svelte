<script lang="ts">
	import { features } from "./About";
</script>

<div class="start-page">
	<div class="content">
		<h1>Welcome to Guck's Bachelorthesis</h1>
		<p>
			In the course <strong>Algorithmen und Datenstrukturen 2</strong> (Algorithms
			and Data Structures 2) at the Johannes Kepler University, students learn about
			graphs and graph flow algorithms. Currently, the teaching materials for these
			topics are limited to slides and blackboard explanations. To enhance the learning
			experience for students and provide lecturers with more effective teaching
			aids, an interactive and playful visualization tool for graph and graph flow
			algorithms can be developed.
		</p>

		<p>
			The goal of this bachelor's thesis is to create an interactive
			visualization tool that supports lecturers in teaching and helps students
			learn graph and graph flow algorithms more effectively. The tool should
			include the following features:
		</p>

		<ul>
			{#each features as feature}
				<li>
					<strong>{feature.title}:</strong>
					{feature.description}
				</li>
			{/each}
		</ul>

		<p>
			The interactive visualization tool should be developed with a focus on
			usability and educational value. It aims to provide an engaging and
			visually appealing experience for both lecturers and students, making it
			easier to teach and learn graph and graph flow algorithms.
		</p>
	</div>
	<div class="spacer"></div>
</div>

<style>
	.start-page {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		background: var(--backgroundLight);
		color: var(--textColor);
		box-sizing: border-box;
		overflow: auto;
		padding: 10px;
		flex-direction: column;
	}

	.content {
		max-width: 900px;
		width: 100%;
		max-height: 85vh;
		padding: 1rem;
		background: var(--backgroundDark);
		border-radius: 10px;
		box-shadow: var(--boxShadow);
		color: var(--textColor);
		box-sizing: border-box;
		overflow-y: auto;
	}

	h1 {
		font-size: var(--fontLarge);
		margin-bottom: 1rem;
		text-align: center;
	}

	p {
		font-size: var(--fontRegular);
		margin-bottom: 1rem;
		line-height: var(--lineHeight);
	}

	ul {
		list-style-type: disc;
		margin-left: 1.5rem;
		margin-bottom: 1.5rem;
	}

	ul li {
		margin-bottom: 1rem;
	}

	strong {
		color: var(--highlightColor);
	}

	/* Responsive adjustments for smaller screens */
	@media (max-width: 768px) {
		.content {
			padding: 1.5rem;
		}

		h1 {
			font-size: var(--fontMedium);
		}

		p {
			font-size: 1.1rem;
		}
	}

	@media (max-width: 500px) {
		.content {
			padding: 1rem;
		}

		h1 {
			font-size: var(--fontSmall);
		}

		p {
			font-size: 1rem;
		}
	}

	.spacer {
		height: var(--navbarHeight, 70px);
		width: 100%;
	}
</style>
