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

export const createNode = (
  id: number,
  label?: string,
  posX?: number,
  posY?: number
): D3Node => {
  return {
    id: "node" + id,
    label: label ?? "Node " + id,
    posX: posX ?? 0,
    posY: posY ?? 0,
  };
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
    .attr("data-node", (d) => d.id)
    .style("stroke", "gray")
    .style("fill", "white")
    .on("click", function (event, d) {
      const currentFill = d3.select(this).style("fill");
      d3.select(this).style("fill", currentFill === "red" ? "white" : "red");
    });
  // redrawLines(svg, edges, radius);
};

export const getDotSrc = (nodes: D3Node[], edges: D3Edge[]): string => {
  const nodeLabels = nodes.map((node) => `${node.id} [label="${node.label}"]`);
  const edgeLabels = edges.map((edge) => `${edge.from.id} -> ${edge.to.id}`);
  const dotSrc = `digraph { \n${nodeLabels.join("\n")}\n${edgeLabels.join(
    "\n"
  )}}`;
  return dotSrc;
};

export const updateNodePositions = (layout: any, nodes: D3Node[]) => {
  const positions = layout.objects;
  nodes.forEach((node) => {
    const position = positions.find((pos: any) => pos.name === node.id);
    if (position && position.pos) {
      const [x, y] = position.pos.split(",").map(parseFloat);
      node.posX = x;
      node.posY = y;
    }
  });
};
