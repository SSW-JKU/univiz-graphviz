<script lang="ts">
  import * as d3 from "d3";
  import { type Graphviz } from "d3-graphviz";
  import { onMount } from "svelte";
  import { addNode, handleResize, renderGraph } from "./D3Graph";
  import { writable, type Writable } from "svelte/store";

  /**
   * TODO make "diagraph { }"
   *
   * https://graphviz.org/doc/info/lang.html - Dot language
   */
  export let dotSrc = `digraph {
      graph [label="Click on a node or an edge to delete it" labelloc="t", fontsize="20.0" tooltip=" "]
      node [style="filled"]
      Node1 [id="NodeId1" label="N1" fillcolor="#d62728"]
      Node2 [id="NodeId2" label="N2" fillcolor="#1f77b4"]
      Node3 [id="NodeId3" label="N3" fillcolor="#2ca02c"]
      Node4 [id="NodeId4" label="N4" fillcolor="#ff7f0e"]
      Node1 -> Node2 [id="EdgeId12" label="E12"]
      Node1 -> Node3 [id="EdgeId131" label="E13"]
      Node2 -> Node3 [id="EdgeId23" label="E23"]
      Node3 -> Node4 [id="EdgeId34" label="E34"]
    }`;
  let dotSrcStore: Writable<string> = writable();
  let graphSVG: SVGGElement;
  let graphContainer: HTMLDivElement;
  let graphviz: Graphviz<SVGGElement, unknown, null, undefined>;
  let resizeObserver: ResizeObserver;
  let nodesStore: Writable<string[]> = writable([]);

  onMount(() => {
    graphviz = d3.select(graphSVG).graphviz().dot(dotSrc);
    dotSrcStore = writable(dotSrc);
    console.log("DotSrc", $dotSrcStore);
    resizeObserver = new ResizeObserver((entries) =>
      handleResize(entries, graphviz)
    );
    if (graphSVG) {
      resizeObserver.observe(graphSVG);
    }
    graphviz.render();
  });

  $: {
    $dotSrcStore;
    if (graphviz) {
      graphviz.render();
    }
  }
</script>

<div bind:this={graphContainer} class="graphContainer">
  <svg bind:this={graphSVG} class="graph"></svg>
  <button
    on:click={() => {
      addNode(nodesStore, "Test", dotSrcStore);
    }}>Add node</button
  >
</div>

<style>
  .graph {
    width: 100%;
    height: 100%;
    background-color: lightblue;
  }

  .graphContainer {
    height: 800px;
    width: 1000px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
