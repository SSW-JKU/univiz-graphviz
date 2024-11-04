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
        <h3>Graph Visualizer</h3>
        <p>
          The Graph Visualizer mode allows you to visually explore and interact
          with different types of graphs. You can create, edit, and manipulate
          graph structures to better understand their properties and behaviors.
        </p>
      </div>

      <div class="mode-card">
        <h3>Teaching Mode</h3>
        <p>
          Teaching Mode is designed for presenting graph structures in an
          educational context. It provides tools for step-by-step walkthroughs
          of graph algorithms, making it easier to explain how they work in a
          classroom or demonstration setting.
        </p>
      </div>

      <div class="mode-card">
        <h3>Test Graphs</h3>
        <p>
          This mode lets you work with pre-built test graphs that demonstrate
          common graph structures and scenarios. It’s a great way to explore how
          different algorithms behave on standard graph layouts.
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
          <strong>BFS (Breadth-First Search):</strong> Explore all nodes at the present
          depth level before moving on to nodes at the next depth level.
        </li>
        <li>
          <strong>DFS (Depth-First Search):</strong> Explore as far down one branch
          of the graph as possible before backtracking.
        </li>
        <li>
          <strong>Dijkstra's Algorithm:</strong> Find the shortest path between nodes
          in a graph, a key algorithm in networking and route planning.
        </li>
      </ul>
    </section>
  </div>
</main>

<style>
  .about-container {
    font-family: Arial, sans-serif;
    color: #2c3e50;
    max-width: 90%;
    margin: 0 auto;
    padding: 2rem;
    height: calc(
      100vh - 4rem
    );
    display: flex;
    justify-content: center;
    align-items: center;
    padding-bottom: 2rem;
  }

  .scroll-box {
    width: 100%;
    max-width: 1000px;
    height: calc(
      100vh - 6rem
    );
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
</style>
