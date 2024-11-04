<script lang="ts">
  import { instance, type Viz } from "@viz-js/viz";
  import { convertDotSrc } from "../components/GraphRenderer";
  import type { D3Edge, D3Node, EdgeLayout, GraphLayout } from "../types/Graph";
  import {
    getEdgePosBetweenNodes,
    redraw,
    updateNodePositions,
  } from "./GraphBuilder";
  import { writable } from "svelte/store";
  import { onMount } from "svelte";
  import * as d3 from "d3";
  import "d3-graphviz";

  let svg: SVGElement;
  let edgeLayout: EdgeLayout[];
  const selectedNodes = writable<D3Node[]>([]);
  let viz: Viz;

  // Initialize dotSrc as an empty string (user will populate it via input)
  let dotSrc: string = "";

  // Variables to hold nodes and edges
  let nodes: D3Node[] = [];
  let edges: D3Edge[] = [];
  let directedGraph: boolean = false;

  // Flag to handle rendering errors (like invalid DOT input)
  let errorMessage: string = "";

  let zoomLevel: number;

  const checkZoomLevel = (): void => {
    if (window.devicePixelRatio !== zoomLevel) {
      zoomLevel = window.devicePixelRatio;
    }
  };

  onMount(async () => {
    zoomLevel = document.documentElement.clientWidth;
    window.addEventListener("resize", checkZoomLevel);
    viz = await instance();
  });

  $: {
    zoomLevel;
    if (svg) {
      zoomLevel = document.documentElement.clientWidth;
      redraw(svg, nodes, edges, selectedNodes, directedGraph, false);
    }
  }

  $: if (dotSrc && viz) {
    try {
      const regex = /\bgraph\b/g;
      const matches = regex.test(dotSrc);
      let dotSrcReplace;
      if (matches) {
        dotSrcReplace = dotSrc
          .replaceAll("--", "->")
          .replaceAll("graph", "digraph");
        directedGraph = false;
      } else {
        dotSrcReplace = dotSrc;
        directedGraph = true;
      }
      [nodes, edges] = convertDotSrc(dotSrcReplace, viz);
      console.log(nodes, edges)
      redraw(svg, nodes, edges, selectedNodes, directedGraph, false);
      errorMessage = "";
    } catch (error) {
      if (error instanceof Error) {
        errorMessage = "Please enter valid dot string! " + error.message;
      }
    }
  }
</script>

<div class="container">
  <div class="left">
    <textarea bind:value={dotSrc} placeholder="Enter DOT source"></textarea>
    {#if errorMessage}
      <div class="error">{errorMessage}</div>
    {/if}
  </div>

  <div class="right">
    <svg bind:this={svg}> </svg>
  </div>
</div>

<style>
  .container {
    display: flex;
    height: 100vh;
    width: 100%;
  }

  .left {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 10px;
    background-color: #f0f0f0;
    box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.05);
  }

  .right {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: lightgray;
    padding: 10px;
  }

  textarea {
    flex-grow: 1;
    width: 100%;
    font-size: 1rem;
    font-family: "Roboto", sans-serif;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #fff;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
    resize: none;
    transition:
      border-color 0.3s,
      box-shadow 0.3s;
  }

  textarea:focus {
    border-color: #3498db;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.15);
    outline: none;
  }

  .error {
    margin-top: 10px;
    color: #e74c3c;
    background-color: rgba(231, 76, 60, 0.1);
    border-left: 4px solid #e74c3c;
    padding: 10px 15px;
    border-radius: 3px;
    font-weight: bold;
    font-size: 0.9rem;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }

  svg {
    width: 100%;
    height: 100%;
    object-fit: contain;
    background-color: white;
    border-radius: 5px;
  }
</style>
