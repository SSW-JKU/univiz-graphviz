<script lang="ts">
  import { onMount } from "svelte";
  import { redraw, type D3Edge, type D3Node } from "./App4";

  export const testNodes: D3Node[] = [
    {
      id: "node1",
      label: "Node 1",
      posX: 50,
      posY: 100,
    },
    {
      id: "node2",
      label: "Node 2",
      posX: 200,
      posY: 150,
    },
    {
      id: "node3",
      label: "Node 3",
      posX: 350,
      posY: 200,
    },
    {
      id: "node4",
      label: "Node 4",
      posX: 500,
      posY: 250,
    },
    {
      id: "node5",
      label: "Node 5",
      posX: 50,
      posY: 300,
    },
  ];

  export const testEdges: D3Edge[] = [
    {
      from: testNodes[0],
      to: testNodes[1],
    },
    {
      from: testNodes[1],
      to: testNodes[1],
    },
    {
      from: testNodes[1],
      to: testNodes[2],
    },
    {
      from: testNodes[2],
      to: testNodes[3],
    },
    {
      from: testNodes[3],
      to: testNodes[4],
    },
    {
      from: testNodes[4],
      to: testNodes[0],
    },
  ];
  let svg: SVGElement;
  onMount(() => {
    redraw(svg, testNodes, testEdges);
  });

  const addOne = () => {
    testNodes.push({
      id: "node6",
      label: "Node 6",
      posX: 200,
      posY: 100,
    });
    redraw(svg, testNodes, testEdges);
  };
</script>

<div>
  <svg bind:this={svg}>
    <defs>
      <defs>
        <marker
          id="arrow"
          markerWidth="10"
          markerHeight="10"
          refX="8"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" fill="#f00" />
        </marker>
      </defs>
    </defs></svg
  >
  <button on:click={addOne}>Add One</button>
</div>
