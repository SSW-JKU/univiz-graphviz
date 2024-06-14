<script lang="ts">
  /////////////////////////////////////////////////////////////////////////////////////
  //////                                Imports                                  //////
  /////////////////////////////////////////////////////////////////////////////////////

  import { afterUpdate, onMount } from "svelte";
  import { graphviz, type Graphviz } from "d3-graphviz";
  import type { BaseType } from "d3";
  import { writable, type Writable } from "svelte/store";
  import * as d3 from "d3";

  /////////////////////////////////////////////////////////////////////////////////////
  //////                               Variables                                 //////
  /////////////////////////////////////////////////////////////////////////////////////

  let graphContainer: HTMLDivElement;
  let nodes: Writable<string[]> = writable([]);
  let dotSrc = "digraph  {}";
  let graph: Graphviz<BaseType, any, BaseType, any>;
  let nodeElements: d3.Selection<BaseType, unknown, HTMLElement, any>[] = [];
  const nodeIDPrefix = "node";
  let nodePositions: Map<string, { x: number; y: number }> = new Map();
  let selectedNodes: d3.Selection<BaseType, unknown, HTMLElement, any>[] = [];
  let edges: string[] = [];

  nodes.subscribe((newItems) => {
    const newDotSrc = newItems.join("; ") + "; " + edges.join("; ");
    dotSrc =
      edges.length < 1
        ? `digraph  {${newItems.join("; ")}}`
        : `digraph  {${newDotSrc}}`;
  });

  /////////////////////////////////////////////////////////////////////////////////////
  //////                               Updating                                  //////
  /////////////////////////////////////////////////////////////////////////////////////

  afterUpdate(() => {
    if (graphContainer) {
      graph = graphviz(graphContainer).renderDot(dotSrc);
      //graph.fit(true);
      if ($nodes.length > 0) {
        nodeElements.push(getNode($nodes.length));
      }
    }
    if (nodeElements.length > 0) {
      updateNodePosition(nodeElements[nodeElements.length - 1]);
      enableSelect(nodeElements[nodeElements.length - 1]);
      // nodeElements.forEach(nodeElement => {
      //           d3.select(nodeElement.node()).attr("transform", "translate(0,0)");
      //           updateNodePosition(nodeElement);
      //       });

      // nodePositions.forEach((value, key) => {
      //   nodePositions.set(key, { x: 0, y: 0 });
      // });

      setNodePosition();

      selectedNodes.forEach((node) => {
        node.classed("selected", true);
      });
    }
    enableDrag();
  });

  /////////////////////////////////////////////////////////////////////////////////////
  //////                            Add and get node                             //////
  /////////////////////////////////////////////////////////////////////////////////////

  function addNode() {
    const newNodeId = `A${$nodes.length}`;
    const newNode = `${nodeIDPrefix}${newNodeId} [label="${newNodeId}"]`;
    nodes.update((existingNodes) => [...existingNodes, newNode]);
  }

  function getNode(
    id: number
  ): d3.Selection<BaseType, unknown, HTMLElement, any> {
    const nodeB: d3.Selection<BaseType, unknown, HTMLElement, any> = d3.select(
      `#${nodeIDPrefix}${id}`
    );
    return nodeB;
  }

  /////////////////////////////////////////////////////////////////////////////////////
  //////                        Update node position                             //////
  /////////////////////////////////////////////////////////////////////////////////////

  function updateNodePosition(
    node: d3.Selection<BaseType, unknown, HTMLElement, any>
  ) {
    const nodeElement = node.node() as SVGGElement;
    if (nodeElement) {
      const transform = nodeElement.getAttribute("transform");
      if (transform) {
        const [_, x, y] = transform.match(/translate\(([^,]+),([^,]+)\)/);
        nodePositions.set(nodeElement.id, {
          x: parseFloat(x),
          y: parseFloat(y),
        });
      } else {
        nodePositions.set(nodeElement.id, { x: 0, y: 0 });
      }
    }
  }

  function setNodePosition() {
    nodeElements.forEach((nodeElement) => {
      const nodePos = nodeElement.node() as SVGGElement;
      const nodeId = nodePos.id;
      const position = nodePositions.get(nodeId);
      if (position) {
        const { x, y } = position;
        nodeElement.attr("transform", `translate(${x},${y})`);
      }
    });
  }

  /////////////////////////////////////////////////////////////////////////////////////
  //////                             Node dragging                               //////
  /////////////////////////////////////////////////////////////////////////////////////

  // Update the position of the edges based on the positions of the connected nodes
  function updateEdgePositions() {
    edges.forEach((edge) => {
      const [sourceNodeId, targetNodeId] = edge.split("->");
      const sourceNodePosition = nodePositions.get(
        findNodeByLabel(sourceNodeId).node().id
      );
      const targetNodePosition = nodePositions.get(
        findNodeByLabel(targetNodeId).node().id
      );
      if (sourceNodePosition && targetNodePosition) {
        // Update the position of the edge
        // Example: You might need to update the 'd' attribute of the SVG path representing the edge
        // You may need to calculate the new path based on the positions of the source and target nodes
        // and update it accordingly
        // For simplicity, let's assume the edge is represented by a line from source to target
        const edgePath = document.getElementById(
          `edge1` // TODO Change
        );
        if (edgePath) {
          console.log(edgePath);
          const newPath = `M${sourceNodePosition.x},${sourceNodePosition.y} C${
            sourceNodePosition.x
          },${(sourceNodePosition.y + targetNodePosition.y) / 2} ${
            targetNodePosition.x
          },${(sourceNodePosition.y + targetNodePosition.y) / 2} ${
            targetNodePosition.x
          },${targetNodePosition.y}`;
          // Update the 'd' attribute of the path
          edgePath.setAttribute("d", newPath);
        }
      }
    });
  }

  function findNodeByLabel(
    label: string
  ): d3.Selection<BaseType, unknown, HTMLElement, any> | null {
    // Iterate through the node elements to find the node with the given label
    for (const nodeElement of nodeElements) {
      const nodeLabel = nodeElement
        .text()
        .trim()
        .match(/node([^\n]+)/)[0];
      if (nodeLabel === label) {
        return nodeElement;
      }
    }
    // If no node with the given label is found, return null
    return null;
  }

  function enableDrag() {
    nodeElements.forEach((element) => {
      element
        .call(
          d3
            .drag<BaseType, unknown>()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)
        )
        .selectAll("*")
        .attr("pointer-events", "all");
    });
  }

  let initialMouseX: number;
  let initialMouseY: number;

  function dragstarted(this: any, event: any, d: any) {
    d3.select(this).raise().classed("active", true);

    // Retrieve the current position of the node
    const nodeId = this.id;
    const currentPosition = nodePositions.get(nodeId);
    if (currentPosition) {
      // Calculate the offset between the current node position and the mouse position
      initialMouseX = event.x - currentPosition.x;
      initialMouseY = event.y - currentPosition.y;
    }
  }

  function dragged(this: any, event: any, d: any) {
    const nodeId = this.id;
    const currentPosition = nodePositions.get(nodeId);
    if (currentPosition) {
      // Calculate the new position of the node
      const newX = event.x - initialMouseX;
      const newY = event.y - initialMouseY;

      // Update the node's position to the new absolute position
      d3.select(this).attr("transform", `translate(${newX},${newY})`);

      // Update the current position of the node in the map
      nodePositions.set(nodeId, { x: newX, y: newY });
      updateEdgePositions();
    }
  }

  function dragended(this: any, event: any, d: any) {
    d3.select(this).classed("active", false);
  }

  /////////////////////////////////////////////////////////////////////////////////////
  //////                            Node selecting                               //////
  /////////////////////////////////////////////////////////////////////////////////////

  function enableSelect(
    node: d3.Selection<BaseType, unknown, HTMLElement, any>
  ) {
    node
      .selectAll("*")
      .attr("pointer-events", "all")
      .on("click", () => toggleSelection(node));
  }

  function toggleSelection(
    node: d3.Selection<BaseType, unknown, HTMLElement, any>
  ) {
    node.classed(
      "selected",
      !node.classed("selected") && selectedNodes.length < 2
    );
    if (node.classed("selected")) {
      if (selectedNodes.length < 2 && !selectedNodes.includes(node)) {
        selectedNodes.push(node);
      }
    } else {
      const index = selectedNodes.findIndex((curNode) => curNode === node);
      if (index !== -1) {
        selectedNodes.splice(index, 1);
      }
    }
  }

  /////////////////////////////////////////////////////////////////////////////////////
  //////                             Connect nodes                               //////
  /////////////////////////////////////////////////////////////////////////////////////

  function connectNodes() {
    if (selectedNodes.length === 2) {
      const nodeText1 = selectedNodes[0]
        .text()
        .trim()
        .match(/node([^\n]+)/)[0]; // TODO make better
      const nodeText2 = selectedNodes[1]
        .text()
        .trim()
        .match(/node([^\n]+)/)[0];
      const position = dotSrc.lastIndexOf("}");
      const edgeToAdd = `${nodeText1}->${nodeText2}`;
      edges.push(edgeToAdd);
      console.log("add", edges);
      dotSrc =
        dotSrc.slice(0, position) + "; " + edgeToAdd + dotSrc.slice(position);
      selectedNodes[0].classed("selected", false);
      selectedNodes[1].classed("selected", false);
      selectedNodes = [];
      graph.renderDot(dotSrc);
      setNodePosition();
    }
  }
</script>

<!------------------------- HTML Part ---------------------------------------->

<div bind:this={graphContainer}></div>
<button on:click={addNode}>Add node</button>
<button on:click={connectNodes}>Connect Nodes</button>
