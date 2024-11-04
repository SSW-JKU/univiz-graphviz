<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import {
    createNode,
    edgeExists,
    getDotSrc,
    getEdgePosBetweenNodes,
    redraw,
    updateNodePositions,
  } from "./GraphBuilder";
  import type { D3Edge, D3Node, EdgeLayout, GraphLayout } from "../types/Graph";
  import { instance } from "@viz-js/viz";
  import Properties from "../components/Properties.svelte";
  import { writable } from "svelte/store";

  export let directedGraph: boolean;
  let nodeCount = 0;
  let svg: SVGElement;
  let nodes: D3Node[] = [];
  const selectedNodes = writable<D3Node[]>([]);
  let edges: D3Edge[] = [];
  let edgeLayout: EdgeLayout[];
  let tempNodeLabel: string;
  let zoomLevel: number;
  const editable = true;

  const updateGraph = async () => {
    const dotSrc = getDotSrc(nodes, edges, directedGraph);
    const viz = await instance();
    const layout = (await viz.renderJSON(dotSrc)) as GraphLayout;
    edgeLayout = layout.edges;

    // Update node positions based on the layout
    updateNodePositions(layout, nodes);

    // Update edge positions based on the layout
    edges.forEach((edge) => {
      edge.pos = getEdgePosBetweenNodes(
        edge.from.d3id,
        edge.to.d3id,
        edgeLayout,
        directedGraph
      );
    });
    redraw(svg, nodes, edges, selectedNodes, directedGraph, editable);
  };

  const checkZoomLevel = (): void => {
    if (window.devicePixelRatio !== zoomLevel) {
      zoomLevel = window.devicePixelRatio;
    }
  };

  onMount(() => {
    zoomLevel = document.documentElement.clientWidth;
    window.addEventListener("resize", checkZoomLevel);
    if (svg) {
      redraw(svg, nodes, edges, selectedNodes, directedGraph, editable);
    }
  });

  onDestroy(() => {
    window.removeEventListener("resize", checkZoomLevel);
  });

  $: {
    zoomLevel;
    if (svg) {
      zoomLevel = document.documentElement.clientWidth;
      redraw(svg, nodes, edges, selectedNodes, directedGraph, editable);
    }
  }

  /**
   * Update the node label from the property menu
   */
  const updateNodeLabel = (newLabel: string) => {
    selectedNodes.update((selNodes) => {
      if (selNodes.length === 1) {
        selNodes[0].label = tempNodeLabel;
      }
      return selNodes;
    });

    // Redraw the graph after label change
    updateGraph();
  };

  selectedNodes.subscribe((selNodes) => {
    if (selNodes.length === 0) {
      tempNodeLabel = "";
    }
  });
</script>

<div class="container">
  <div class="graph">
    <svg bind:this={svg}> </svg>
    <div class="property-menu">
      <Properties
        bind:tempNodeLabel
        nodeLabel={$selectedNodes.length === 1 ? $selectedNodes[0].label : null}
        nodeID={$selectedNodes.length === 1 ? $selectedNodes[0].id : null}
        labelUpdate={updateNodeLabel}
      />
    </div>
  </div>
  <div class="button-container">
    <button
      on:click={async () => {
        nodes.push(createNode(`node${nodeCount}`, nodeCount));
        selectedNodes.set([]);
        nodeCount++;
        await updateGraph();
      }}>Add Node</button
    >
    <button
      disabled={$selectedNodes.length !== 1}
      on:click={async () => {
        if ($selectedNodes.length === 1) {
          nodeCount--;
          edges = edges.filter(
            (edge) =>
              edge.from.d3id !== $selectedNodes[0].d3id &&
              edge.to.d3id !== $selectedNodes[0].d3id
          );
          nodes = nodes.filter((node) => node.d3id !== $selectedNodes[0].d3id);
          selectedNodes.set([]);
          await updateGraph();
        }
      }}>Remove Selected Node</button
    >
    <button
      disabled={$selectedNodes.length !== 2}
      on:click={async () => {
        if ($selectedNodes.length === 2) {
          const fromNode = $selectedNodes[0];
          const toNode = $selectedNodes[1];

          // Check if an edge already exists in the same direction
          if (
            (directedGraph && !edgeExists(fromNode, toNode, edges)) ||
            (!directedGraph &&
              !edgeExists(fromNode, toNode, edges) &&
              !edgeExists(toNode, fromNode, edges))
          ) {
            edges.push({
              from: fromNode,
              to: toNode,
              pos: "", // Initialize the edge with an empty `pos`
            });
            selectedNodes.set([]);
            await updateGraph()
          } else {
            console.log(
              "Edge already exists between",
              fromNode.d3id,
              "and",
              toNode.d3id
            );
            alert(
              `Edge already exists from ${fromNode.label} to ${toNode.label}`
            );
            selectedNodes.set([]);
            await updateGraph();
          }
        }
      }}>Connect Selected Nodes</button
    >
  </div>
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 10px;
    overflow: hidden;
  }

  .graph {
    flex-grow: 1;
    background-color: lightgray;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.5em;
    margin-bottom: 10px;
    overflow: hidden;
  }

  .button-container {
    display: flex;
    justify-content: space-between;
    height: 60px;
    min-height: 10%;
    background-color: #2c3e50;
  }

  button {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #2c3e50;
    color: white;
    cursor: pointer;
    padding: 10px;
    font-size: 1em;
    height: 100%;
    border: none;
    border-radius: 5px;
    transition:
      background-color 0.3s,
      color 0.3s;
  }

  button:hover {
    background-color: #34495e;
  }

  button:disabled {
    background-color: #35404b;
    color: #bdc3c7;
    cursor: not-allowed;
  }

  button:disabled:hover {
    background-color: #35404b;
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
    object-fit: contain;
  }

  .property-menu {
    width: fit-content;
    height: 100%;
  }
</style>
