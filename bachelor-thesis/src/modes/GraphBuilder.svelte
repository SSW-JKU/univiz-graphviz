<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import {
    changeLabel,
    createNode,
    edgeExists,
    getDotSrc,
    getEdgePosBetweenNodes,
    redraw,
    updateNodePositions,
  } from "./GraphBuilder";
  import type { D3Edge, D3Node, EdgeLayout, GraphLayout } from "./GraphBuilder";
  import { instance } from "@viz-js/viz";
  import Properties from "../components/Properties.svelte";
  import { writable } from "svelte/store";

  let nodeCount = 0;
  let svg: SVGElement;
  let nodes: D3Node[] = [];
  const selectedNodes = writable<D3Node[]>([]);
  let edges: D3Edge[] = [];
  let edgeLayout: EdgeLayout[];
  let tempNodeLabel: string;
  let zoomLevel: number;
  let directedGraph = true;

  const updateGraph = async () => {
    const dotSrc = getDotSrc(nodes, edges);
    console.log(dotSrc);
    const viz = await instance();
    const layout = (await viz.renderJSON(dotSrc)) as GraphLayout;
    console.log(layout);
    edgeLayout = layout.edges;

    // Update node positions based on the layout
    updateNodePositions(layout, nodes);

    // Update edge positions based on the layout
    edges.forEach((edge) => {
      edge.pos = getEdgePosBetweenNodes(
        edge.from.d3id,
        edge.to.d3id,
        edgeLayout
      );
    });
    redraw(svg, nodes, edges, selectedNodes, directedGraph);
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
      redraw(svg, nodes, edges, selectedNodes, directedGraph);
    }
  });

  onDestroy(() => {
    window.removeEventListener("resize", checkZoomLevel);
  });

  $: {
    zoomLevel;
    if (svg) {
      zoomLevel = document.documentElement.clientWidth;
      redraw(svg, nodes, edges, selectedNodes, directedGraph);
    }
  }

  /**
   * Update the node label from the property menu
   */
  const updateNodeLabel = (newLabel: string) => {
    selectedNodes.update((selNodes) => {
      if (selNodes.length === 1) {
        const updatedNode = { ...selNodes[0], label: newLabel };
        nodes = nodes.map((node) =>
          node.id === updatedNode.id ? updatedNode : node
        );
        return [updatedNode]; // Update selected nodes
      }
      return selNodes;
    });

    // Redraw the graph after label change
    updateGraph();
  };
</script>

<div class="container">
  <div class="graph">
    <svg bind:this={svg}> </svg>
    <div class="property-menu">
      <Properties
        bind:tempNodeLabel
        bind:directedGraph
        nodeLabel={$selectedNodes.length === 1 ? $selectedNodes[0].label : null}
        nodeID={$selectedNodes.length === 1 ? $selectedNodes[0].id : null}
        labelUpdate={updateNodeLabel}
      />
    </div>
  </div>
  <div class="button-container">
    <button
      on:click={async () => {
        nodes.push(createNode(nodeCount));
        selectedNodes.set([]);
        nodeCount++;
        await updateGraph();
      }}>Add Node</button
    >
    <button
      on:click={async () => {
        if ($selectedNodes.length === 1) {
          nodeCount--;
          edges = edges.filter(
            (edge) =>
              edge.from.id !== $selectedNodes[0].id &&
              edge.to.id !== $selectedNodes[0].id
          );
          nodes = nodes.filter((node) => node.id !== $selectedNodes[0].id);
          for (let i = 0; i < nodeCount; i++) {
            if (changeLabel(nodes[i].label, nodeCount)) {
              nodes[i].label = "Node " + i;
            }
            nodes[i].d3id = i;
            nodes[i].id = "node" + i;
          }
          selectedNodes.set([]);
          await updateGraph();
        }
      }}>Remove Selected Node</button
    >
    <button
      on:click={async () => {
        if ($selectedNodes.length === 2) {
          const fromNode = $selectedNodes[0];
          const toNode = $selectedNodes[1];

          // Check if an edge already exists in the same direction
          if (!edgeExists(fromNode, toNode, edges)) {
            edges.push({
              from: fromNode,
              to: toNode,
              pos: "", // Initialize the edge with an empty `pos`
            });
            selectedNodes.set([]);
            await updateGraph(); // This will handle adding the edge and updating its `pos`
          } else {
            console.log(
              "Edge already exists between",
              fromNode.id,
              "and",
              toNode.id
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
    object-fit: contain;
  }

  .property-menu {
    width: fit-content;
    height: 100%;
  }
</style>
