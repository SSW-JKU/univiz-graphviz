import * as d3 from "d3";

export type D3Node = {
  id: string;
  label: string;
  posX: number;
  posY: number;
};

export type D3Edge = {
  from: D3Node;
  to: D3Node;
};

export const redraw = (svg: SVGElement, nodes: D3Node[], edges: D3Edge[]) => {
  const radius = 25;
  d3.select(svg)
    .selectAll<SVGCircleElement, D3Node>("circle")
    .data(nodes, (d: D3Node) => d.id)
    .join("circle")
    // TODO enter + update
    .attr("r", radius)
    .attr("cx", (d) => d.posX)
    .attr("cy", (d) => d.posY)
    // Add from - to id to HTML element
    .attr("data-node", (d) => {
      return d.id;
    })
    .style("stroke", "gray")
    .style("fill", "white")
    .call(drag(svg, edges, radius));
  redrawLines(svg, edges, radius);
};

export const getDotSrc = (nodes: D3Node[], edges: D3Edge[]): string => {
  const nodeLabels = [];
  const edgesWithLabels = [];
  for (const node of nodes) {
    nodeLabels.push(node.id);
  }
  for (const edge of edges) {
    edgesWithLabels.push(edge.from.id + "->" + edge.to.id);
  }
  const dotSrc =
    "digraph { \n" +
    nodeLabels.join("\n") +
    "\n" +
    edgesWithLabels.join("\n") +
    "\n}";
  return dotSrc;
};

const redrawLines = (svg: SVGElement, edges: D3Edge[], radius: number) => {
  d3.select(svg)
    .selectAll<SVGLineElement, D3Edge>("line")
    .data(edges, (d: D3Edge) => d.from.id + "_" + d.to.id)
    .join("line")
    .attr("x1", (d) => {
      const dx = d.to.posX - d.from.posX;
      const dy = d.to.posY - d.from.posY;
      const length = Math.sqrt(dx * dx + dy * dy);
      const offsetX = (dx * radius) / length;
      return Number.isNaN(offsetX) ? d.from.posX : d.from.posX + offsetX;
    })
    .attr("y1", (d) => {
      const dx = d.to.posX - d.from.posX;
      const dy = d.to.posY - d.from.posY;
      const length = Math.sqrt(dx * dx + dy * dy);
      const offsetY = (dy * radius) / length;
      return Number.isNaN(offsetY) ? d.from.posY : d.from.posY + offsetY;
    })
    .attr("x2", (d) => {
      const dx = d.to.posX - d.from.posX;
      const dy = d.to.posY - d.from.posY;
      const length = Math.sqrt(dx * dx + dy * dy);
      const offsetX = (dx * radius) / length;
      return Number.isNaN(offsetX) ? d.from.posX : d.to.posX - offsetX;
    })
    .attr("y2", (d) => {
      const dx = d.to.posX - d.from.posX;
      const dy = d.to.posY - d.from.posY;
      const length = Math.sqrt(dx * dx + dy * dy);
      const offsetY = (dy * radius) / length;
      return Number.isNaN(offsetY) ? d.from.posY : d.to.posY - offsetY;
    })
    .style("stroke", "red")
    .attr("marker-end", "url(#arrow)")
    // Add from - to id to HTML element
    .attr("data-edge", (d) => {
      return d.from.id + "->" + d.to.id;
    });
};

const drag = (svg: SVGElement, edges: D3Edge[], radius: number) => {
  // Offset to prevent circles' center jumping to mouse when dragging
  let offsetX: number;
  let offsetY: number;

  function dragstarted(
    this: SVGCircleElement,
    event: d3.D3DragEvent<SVGCircleElement, D3Node, D3Node>,
    d: D3Node
  ) {
    d3.select(this).raise().attr("stroke", "black");
    const [mouseX, mouseY] = d3.pointer(event, this);
    offsetX = d.posX - mouseX;
    offsetY = d.posY - mouseY;
  }

  function dragged(
    this: SVGCircleElement,
    event: d3.D3DragEvent<SVGCircleElement, D3Node, D3Node>,
    d: D3Node
  ) {
    const [mouseX, mouseY] = d3.pointer(event, this);
    d.posX = mouseX + offsetX;
    d.posY = mouseY + offsetY;
    d3.select(this).attr("cx", d.posX).attr("cy", d.posY);
    redrawLines(svg, edges, radius);
  }

  function dragended(
    this: SVGCircleElement,
    event: d3.D3DragEvent<SVGCircleElement, D3Node, D3Node>,
    d: D3Node
  ) {
    d3.select(this).attr("stroke", null);
  }

  return d3
    .drag<SVGCircleElement, D3Node>()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
};
