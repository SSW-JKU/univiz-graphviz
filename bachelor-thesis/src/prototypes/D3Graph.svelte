<script lang="ts">
  import * as d3 from "d3";
  import { type Graphviz } from "d3-graphviz";
  import { onMount } from "svelte";
  import { addNode, handleResize, renderGraph, updateDotSrc } from "./D3Graph";
  import { writable, type Writable } from "svelte/store";
  import type { GraphNode } from "./D3GraphTypes";
  import CreateNode from "./CreateNode.svelte";

  /**
   * https://graphviz.org/doc/info/lang.html - Dot language
   */
  export let dotSrc = "digraph { }";
  let dotSrcStore: Writable<string> = writable(dotSrc);
  let graphSVG: SVGElement;
  let graphContainer: HTMLDivElement;
  let graphviz: Graphviz<SVGElement, unknown, null, undefined>;
  let nodesStore: Writable<GraphNode[]> = writable([]);
  let resizeObserver: ResizeObserver;

  onMount(() => {
    resizeObserver = new ResizeObserver((entries) =>
      handleResize(entries, graphviz)
    );
    if (graphSVG) {
      resizeObserver.observe(graphContainer);
    }

    // Setup graphviz renderer with init value
    graphviz = (d3
      .select(graphSVG) as any)
      .graphviz()
      .zoom(false)
      .renderDot($dotSrcStore)
      .on("end", () => {
        // Remove unwanted polygon created by graphviz
        d3.selectAll("polygon").remove();
      });
  });

  /**
   * Re-render, if the string in dotSrcStore changes
   */
  $: {
    $nodesStore;
    updateDotSrc(dotSrcStore, nodesStore);
    console.log($dotSrcStore);
    if (graphviz) {
      graphviz.renderDot($dotSrcStore);
    }
  }
</script>

<div bind:this={graphContainer} class="graphContainer">
  <svg bind:this={graphSVG} class="graph"></svg>
  <CreateNode {nodesStore} />
</div>

<style>
  .graph {
    width: 100%;
    height: 100%;
    background-color: lightblue;
  }

  .graphContainer {
    height: 100%;
    width: 100%;
    min-width: 400px;
    min-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
