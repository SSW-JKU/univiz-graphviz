<script lang="ts">
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
      <li>
        <strong>Graph building and editing:</strong> Allow users to add, remove,
        and edit nodes and edges in a graph. Enable users to change node names and
        edge weights to create custom graph structures. Provide functionality to
        automatically lay out graphs for better visualization.
      </li>
      <li>
        <strong>Visualization of various graph algorithms:</strong> Implement visualizations
        for Depth-First Search (DFS), Breadth-First Search (BFS), and Dijkstra's
        shortest path algorithm. Visualize the step-by-step process of each algorithm,
        highlighting the nodes and edges being traversed or updated. Optionally,
        consider including the Ford-Fulkerson flow algorithm.
      </li>
      <li>
        <strong>Modes for teaching and learning:</strong> Step-by-step mode for lecturers
        to present each algorithm's process in detail, and Play mode to engage students
        by asking them questions and providing immediate feedback on their answers.
      </li>
      <li>
        <strong>Web application:</strong> Build the tool as a web application with
        a user-friendly interface using modern web technologies. Ensure it is responsive
        and compatible with modern web browsers.
      </li>
    </ul>

    <p>
      The interactive visualization tool should be developed with a focus on
      usability and educational value. It aims to provide an engaging and
      visually appealing experience for both lecturers and students, making it
      easier to teach and learn graph and graph flow algorithms.
    </p>
  </div>
</div>

<style>
  .start-page {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: lightgray;
    color: white;
    box-sizing: border-box;
    overflow: auto;
    padding: 10px; 
  }

  .content {
    max-width: 900px;
    width: 100%;
    max-height: 85vh;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 10px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    color: #fff;
    box-sizing: border-box;
    overflow-y: auto;
  }

  h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    text-align: center;
  }

  p {
    font-size: 1.2rem;
    margin-bottom: 1rem;
    line-height: 1.6;
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
    color: #ff9e2c;
  }

  /* Responsive adjustments for smaller screens */
  @media (max-width: 768px) {
    .content {
      padding: 1.5rem;
    }

    h1 {
      font-size: 2.5rem;
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
      font-size: 2rem;
    }

    p {
      font-size: 1rem;
    }
  }
</style>
