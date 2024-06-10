<script lang="ts">
  import * as d3 from "d3";
  import { graphviz, type Graphviz } from "d3-graphviz";
  import { onMount } from "svelte";

  let graphContainer: SVGGElement;
  let svg: d3.Selection<SVGGElement, unknown, null, undefined>;

  onMount(() => {
    svg = d3.select(graphContainer);
  });
</script>

<svg bind:this={graphContainer} class="graph"></svg>

<style>
  .graph {
    width: 90%;
    height: 90%;
    background-color: lightblue;
  }
</style>
