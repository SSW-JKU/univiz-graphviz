<script lang="ts">
  import { onMount } from "svelte";
  import queryString from "query-string";
  import * as d3 from "d3-selection";
  import { graphviz } from "d3-graphviz";

  import BFS from "./algorithms/BFS.svelte";
  import DFS from "./algorithms/DFS.svelte";
  import Dijkstra from "./algorithms/Dijkstra.svelte";

  enum Algorithm {
    BFS = "BFS",
    DFS = "DFS",
    Dijkstra = "Dijkstra",
  }

  let selectedAlgorithm: Algorithm;
</script>

{#if !selectedAlgorithm}
  <div class="buttonContainer">
    <span>Choose an algorithm:</span>
    <button
      on:click={() => {
        selectedAlgorithm = Algorithm.BFS;
      }}>BFS</button
    >
    <button
      on:click={() => {
        selectedAlgorithm = Algorithm.DFS;
      }}>DFS</button
    >
    <button
      on:click={() => {
        selectedAlgorithm = Algorithm.Dijkstra;
      }}>Djikstra</button
    >
  </div>
{:else if selectedAlgorithm === Algorithm.BFS}
  <BFS />
{:else if selectedAlgorithm === Algorithm.DFS}
  <DFS />
{:else if selectedAlgorithm === Algorithm.Dijkstra}
  <Dijkstra />
{/if}

<style>
  .buttonContainer {
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
