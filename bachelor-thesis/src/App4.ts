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

export const redraw = (svg: SVGElement) => {
  // Render lines first to render circles over lines 
  redrawLines(svg);
  d3.select(svg)
    .selectAll<SVGCircleElement, D3Node>("circle")
    .data(testNodes, (d: D3Node) => d.id)
    .join("circle")
    // TODO enter + update
    .attr("r", 25)
    .attr("cx", (d) => d.posX)
    .attr("cy", (d) => d.posY)
    .style("stroke", "gray")
    .style("fill", "white")
    .call(drag(svg));
};

const redrawLines = (svg: SVGElement) => {
  d3.select(svg)
    .selectAll<SVGLineElement, D3Edge>("line")
    .data(testEdges, (d: D3Edge) => d.from.id + "_" + d.to.id)
    .join("line")
    .attr("x1", (d) => d.from.posX)
    .attr("x2", (d) => d.to.posX)
    .attr("y1", (d) => d.from.posY)
    .attr("y2", (d) => d.to.posY)
    .style("stroke", "red");
};

const drag = (svg: SVGElement) => {
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
    redrawLines(svg);
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
