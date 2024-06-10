<script lang="ts">
  import { afterUpdate, onMount } from "svelte";
  import * as d3 from "d3";

  let svgContainer: SVGGElement;
  let svg: d3.Selection<SVGGElement, unknown, null, undefined>;

  let nodeElements: (SVGGElement | null)[] = [];
  let selectedNodes: d3.Selection<SVGGElement, unknown, null, undefined>[] = [];
  let nodeLinks: [
    d3.Selection<SVGGElement, unknown, null, undefined>,
    d3.Selection<SVGGElement, unknown, null, undefined>,
    d3.Selection<SVGPathElement, unknown, null, undefined>,
  ][] = [];

  onMount(() => {
    svg = d3.select(svgContainer);
  });

  function addNode() {
    // Define circle properties
    const circleRadius = 50;
    const circleFillColor = "white";
    const circleStrokeColor = "black";

    // Define text properties
    const textColor = "black";

    // Get the dimensions of the SVG container
    const svgWidth = svgContainer.clientWidth;
    const svgHeight = svgContainer.clientHeight;

    // Calculate the center of the SVG container
    const centerX = svgWidth / 2;
    const centerY = svgHeight / 2;

    // Append a group element to the SVG for the node
    const node = svg
      .append("g")
      .attr("class", "node")
      .attr(
        "transform",
        `translate(${centerX - circleRadius},${centerY - circleRadius})`
      )
      .call(
        d3
          .drag<SVGGElement, unknown>()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

    // Append a circle to the node
    node
      .append("circle")
      .attr("r", circleRadius)
      .style("fill", circleFillColor)
      .style("stroke", circleStrokeColor)
      .style("stroke-width", 2);

    // Append text inside the node
    node
      .append("text")
      .attr("dy", "0.35em")
      .style("text-anchor", "middle") 
      .style("fill", textColor)
      .text(`A${+nodeElements.length}`);

    nodeElements.push(node.node());

    node.on("click", () => {
      node.classed(
        "selected",
        !node.classed("selected") && selectedNodes.length < 2
      );
      if (node.classed("selected")) {
        if (selectedNodes.length < 2 && !selectedNodes.includes(node)) {
          selectedNodes.push(node);
          node.select("circle").style("stroke", "red");
        }
      } else {
        const index = selectedNodes.findIndex((curNode) => curNode === node);
        if (index !== -1) {
          selectedNodes.splice(index, 1);
          node.select("circle").style("stroke", "black");
        }
      }
    });

    // Rename node with double click
    node.on("dblclick", function () {
      const textElement = d3.select(this).select("text");
      const bbox = (textElement.node() as SVGGElement)?.getBBox();

      // Create a text input element
      const input = d3
        .select(this)
        .append("foreignObject")
        .attr("x", bbox.x)
        .attr("y", bbox.y)
        .attr("width", bbox.width)
        .attr("height", bbox.height)
        .append("xhtml:input")
        .attr("type", "text")
        .attr("value", textElement.text())
        .on("blur", function () {
          const newText = (this as HTMLInputElement)?.value;
          console.log(newText)
          textElement.text(newText);
          input.remove(); // Remove the input element after editing
        })
        .on("keydown", function (event) {
          const newEvent = event as KeyboardEvent
          if (newEvent.key === "Enter") {
            const newText = (this as HTMLInputElement).value;
            textElement.text(newText);  
            input.remove();
          } else if (newEvent.key === "Escape") {
            input.remove();
          }
        });

      // Focus on the input element
      const inputElement = input.node() as HTMLInputElement;
      inputElement.focus();
    });
  }

  // Drag functions
  function dragstarted(this: SVGGElement) {
    d3.select(this).raise().classed("active", true);
  }

  function dragged(this: SVGGElement, event: MouseEvent) {
    // Get the dimensions of the SVG container
    const svgWidth = svgContainer.clientWidth;
    const svgHeight = svgContainer.clientHeight;

    // Get the radius of the circle
    const circleRadius = parseInt(d3.select(this).select("circle").attr("r"));

    // Calculate the boundaries
    const minX = circleRadius;
    const minY = circleRadius;
    const maxX = svgWidth - circleRadius;
    const maxY = svgHeight - circleRadius;

    // Update the position within bounds
    let newX = Math.max(minX, Math.min(maxX, event.x));
    let newY = Math.max(minY, Math.min(maxY, event.y));

    d3.select(this).attr("transform", `translate(${newX},${newY})`);

    // Update the links positions
    updateLinks();
  }

  function dragended(this: SVGGElement) {
    d3.select(this).classed("active", false);
  }

  function clearSelectedNodes() {
    selectedNodes.forEach((node) => {
      node.classed("selected", false);
      node.select("circle").style("stroke", "black");
    });
    selectedNodes = [];
  }

  function getNodePosition(node: SVGGElement | null): [number, number] {
    const cx = node?.getCTM()?.e;
    const cy = node?.getCTM()?.f;
    return [cx || 0, cy || 0];
  }

  function connectNodes() {
    if (selectedNodes.length < 2) return;
    const node1 = selectedNodes[0].node();
    const node2 = selectedNodes[1].node();
    if (!node1 || !node2) return;

    const [cx1, cy1] = getNodePosition(node1);
    const [cx2, cy2] = getNodePosition(node2);
    const radius = 50;

    const angle = Math.atan2(cy2 - cy1, cx2 - cx1);
    const x1 = cx1 + Math.cos(angle) * radius;
    const y1 = cy1 + Math.sin(angle) * radius;
    const x2 = cx2 - Math.cos(angle) * radius;
    const y2 = cy2 - Math.sin(angle) * radius;

    if (!edgeExists(node1, node2) && !nodesConnected(node1, node2)) {
      // Define line coordinates for a straight line
      const line = d3.line()([
        [x1, y1],
        [x2, y2],
      ]);

      if (!line) return;

      // Append the line to the SVG and store its reference
      const newLink = svg
        .append("path")
        .attr("d", line)
        .attr("stroke", "black")
        .attr("stroke-width", "2px")
        .attr("fill", "none")
        .attr("path-type", "straight");

      // Add arrow marker to the end of the path
      svg
        .append("defs")
        .append("marker")
        .attr("id", "arrowhead")
        .attr("markerWidth", 10)
        .attr("markerHeight", 10)
        .attr("refX", 10)
        .attr("refY", 5)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M 0 0 L 10 5 L 0 10 z")
        .attr("fill", "black");

      newLink.attr("marker-end", "url(#arrowhead)");

      // Store the link reference
      nodeLinks.push([selectedNodes[0], selectedNodes[1], newLink]);
    } else if (!edgeExists(node1, node2) && nodesConnected(node1, node2)) {
      const existingLink = findEdge(node1, node2);

      if (existingLink) {
        const index = nodeLinks.findIndex(([link1, link2, _]) => {
          return (
            (link1.node() === node1 && link2.node() === node2) ||
            (link1.node() === node2 && link2.node() === node1)
          );
        });

        if (index !== -1) {
          // Remove the link from the nodeLinks array
          nodeLinks.splice(index, 1);
          // Remove the link from the SVG
          existingLink[2].remove();
        }
      }

      // Define control points for the curved line
      const dx1 = x2 - x1,
        dy1 = y2 - y1;
      const dr1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
      const drx1 = dr1,
        dry1 = dr1;
      const sweep = angle > 0 ? 1 : 0;
      const path1 = `M${x1},${y1}A${drx1},${dry1} 0 0,${sweep} ${x2},${y2}`;

      // Append the line to the SVG and store its reference
      const newLink1 = svg
        .append("path")
        .attr("d", path1)
        .attr("stroke", "black")
        .attr("stroke-width", "2px")
        .attr("fill", "none")
        .attr("path-type", "curved1");

      // Add arrow marker to the end of the path
      svg
        .append("defs")
        .append("marker")
        .attr("id", "arrowhead")
        .attr("markerWidth", 10)
        .attr("markerHeight", 10)
        .attr("refX", 10)
        .attr("refY", 5)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M 0 0 L 10 5 L 0 10 z")
        .attr("fill", "black");

      newLink1.attr("marker-end", "url(#arrowhead)");

      const dx2 = x1 - x2,
        dy = y1 - y2;
      const dr2 = Math.sqrt(dx2 * dx2 + dy * dy);
      const drx2 = dr2,
        dry = dr2;

      // Path definition for the curved line
      const path2 = `M${x2},${y2}A${drx2},${dry} 0 0,${sweep} ${x1},${y1}`; // Swap x1, y1 and x2, y2

      // Append the curved line to the SVG and store its reference
      const newLink2 = svg
        .append("path")
        .attr("d", path2)
        .attr("stroke", "black")
        .attr("stroke-width", "2px")
        .attr("fill", "none")
        .attr("path-type", "curved2");

      // Add arrow marker to the end of the path
      svg
        .append("defs")
        .append("marker")
        .attr("id", "arrowhead")
        .attr("markerWidth", 10)
        .attr("markerHeight", 10)
        .attr("refX", 8) // Adjust as needed
        .attr("refY", 3) // Adjust as needed
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,0 L0,6 L9,3 z")
        .attr("fill", "black");

      newLink2.attr("marker-end", "url(#arrowhead)");
      nodeLinks.push([selectedNodes[1], selectedNodes[0], newLink1]);
      nodeLinks.push([selectedNodes[0], selectedNodes[1], newLink2]);
    }
    clearSelectedNodes();
  }

  function updateLinks() {
    nodeLinks.forEach((nodeLink) => {
      const node1 = nodeLink[0].node();
      const node2 = nodeLink[1].node();
      const [cx1, cy1] = getNodePosition(node1);
      const [cx2, cy2] = getNodePosition(node2);
      const radius = 50;

      const angle = Math.atan2(cy2 - cy1, cx2 - cx1);
      const x1 = cx1 + Math.cos(angle) * radius;
      const y1 = cy1 + Math.sin(angle) * radius;
      const x2 = cx2 - Math.cos(angle) * radius;
      const y2 = cy2 - Math.sin(angle) * radius;

      if (!isNaN(x1) && !isNaN(y1) && !isNaN(x2) && !isNaN(y2)) {
        // Check the custom attribute to determine the path type
        const pathType = nodeLink[2].attr("path-type");
        const dx = x2 - x1,
          dy = y2 - y1;
        const dr = Math.sqrt(dx * dx + dy * dy);
        if (pathType === "curved1") {
          // Update the coordinates of the curved path
          const sweep = angle > 0 ? 0 : 1;
          const path1 = `M${x1},${y1}A${dr},${dr} 0 0,${sweep} ${x2},${y2}`;
          console.log("1", path1);
          nodeLink[2].attr("d", path1);
        } else if (pathType === "curved2") {
          const sweep = angle > 0 ? 1 : 0;
          const path2 = `M${x1},${y1}A${dr},${dr} 0 0,${sweep} ${x2},${y2}`; // Update the path based on the new positions
          console.log("2", path2);
          nodeLink[2].attr("d", path2);
        } else if (pathType === "straight") {
          // Update the coordinates of the straight path
          const line = d3.line()([
            [x1, y1],
            [x2, y2],
          ]);
          if (line) nodeLink[2].attr("d", line);
        }
      }
    });
  }

  function edgeExists(node1: SVGGElement, node2: SVGGElement): boolean {
    for (const [node1Link, node2Link, _] of nodeLinks) {
      const [node1X, node1Y] = getNodePosition(node1);
      const [node2X, node2Y] = getNodePosition(node2);
      const [node1XLink, node1YLink] = getNodePosition(node1Link.node());
      const [node2XLink, node2YLink] = getNodePosition(node2Link.node());
      if (
        node1XLink === node1X &&
        node1YLink === node1Y &&
        node2XLink === node2X &&
        node2YLink === node2Y
      ) {
        return true;
      }
    }
    return false;
  }

  function nodesConnected(node1: SVGGElement, node2: SVGGElement): boolean {
    for (const [node1Link, node2Link, _] of nodeLinks) {
      const [node1X, node1Y] = getNodePosition(node1);
      const [node2X, node2Y] = getNodePosition(node2);
      const [node1XLink, node1YLink] = getNodePosition(node1Link.node());
      const [node2XLink, node2YLink] = getNodePosition(node2Link.node());
      if (
        (node1XLink === node1X &&
          node1YLink === node1Y &&
          node2XLink === node2X &&
          node2YLink === node2Y) ||
        (node1XLink === node2X &&
          node1YLink === node2Y &&
          node2XLink === node1X &&
          node2YLink === node1Y)
      ) {
        return true;
      }
    }
    return false;
  }

  function findEdge(
    node1: SVGGElement,
    node2: SVGGElement
  ):
    | (
        | d3.Selection<SVGGElement, unknown, null, undefined>
        | d3.Selection<SVGPathElement, unknown, null, undefined>
      )[]
    | null {
    for (const [node1Link, node2Link, edge] of nodeLinks) {
      const [node1X, node1Y] = getNodePosition(node1);
      const [node2X, node2Y] = getNodePosition(node2);
      const [node1XLink, node1YLink] = getNodePosition(node1Link.node());
      const [node2XLink, node2YLink] = getNodePosition(node2Link.node());
      if (
        (node1XLink === node1X &&
          node1YLink === node1Y &&
          node2XLink === node2X &&
          node2YLink === node2Y) ||
        (node1XLink === node2X &&
          node1YLink === node2Y &&
          node2XLink === node1X &&
          node2YLink === node1Y)
      ) {
        return [node1Link, node2Link, edge];
      }
    }
    return null;
  }
</script>

<svg bind:this={svgContainer} width="400" height="400"></svg>
<button on:click={addNode}>Add node</button>
<button on:click={connectNodes}>Connect nodes</button>

<style>
  svg {
    border: 1px solid black;
  }
</style>
