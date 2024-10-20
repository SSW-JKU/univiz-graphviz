<script lang="ts">
  import { onMount } from "svelte";
  import { createNode, getDotSrc, redraw, updateNodePositions } from "./App5";
  import type { D3Edge, D3Node } from "./App5";
  import { instance } from "@viz-js/viz";

  let nodeCount = 0;
  let svg: SVGElement;
  const nodes: D3Node[] = [];
  let selectedNodes: D3Node[] = [];
  const edges: D3Edge[] = [];

  const updateGraph = async () => {
    const dotSrc = getDotSrc(nodes, edges);
    const viz = await instance();
    const layout = await viz.renderJSON(dotSrc);
    updateNodePositions(layout, nodes);
    redraw(svg, nodes, edges, selectedNodes);
  };

  onMount(() => {
    if (svg) {
      redraw(svg, nodes, edges, selectedNodes);
    }
  });
</script>

<div class="container">
  <div class="graph">
    <svg bind:this={svg}> </svg>
  </div>
  <div class="button-container">
    <button
      on:click={async () => {
        nodes.push(createNode(nodeCount));
        nodeCount++;
        await updateGraph();
        console.log(nodes);
      }}>Add Node</button
    >
    <button>Remove Selected Node</button>
    <button
      on:click={() => {
        if (selectedNodes.length === 2) {
          edges.push({ from: selectedNodes[0], to: selectedNodes[1] });
          selectedNodes = []
          console.log(edges);
          redraw(svg, nodes, edges, selectedNodes)
        }
      }}>Connect Selected Nodes</button
    >
  </div>
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    padding: 10px;
  }

  .graph {
    flex: 1;
    background-color: lightgray;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.5em;
    margin-bottom: 10px;
  }

  .button-container {
    display: flex;
    justify-content: space-between;
  }

  button {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: lightblue;
    cursor: pointer;
    padding: 10px;
    font-size: 1em;
    height: 5vh;
    text-align: center;
  }

  button:hover {
    background-color: deepskyblue;
  }

  button:not(:first-child) {
    margin-left: 5px;
  }

  button:not(:last-child) {
    margin-right: 5px;
  }

  @media (max-width: 300px) {
    .button-container {
      flex-direction: column;
    }

    button:not(:first-child) {
      margin-left: 0;
      margin-top: 5px;
    }

    button:not(:last-child) {
      margin-right: 0;
    }
  }

  svg {
    height: 100%;
    width: 100%;
  }
</style>
