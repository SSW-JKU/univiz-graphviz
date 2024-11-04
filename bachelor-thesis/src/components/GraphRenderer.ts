import * as dot from "graphlib-dot";
import type { D3Edge, D3Node, GraphLayout, NodeObject } from "../types/Graph";
import { createNode } from "../modes/GraphBuilder";
import { instance, type Viz } from "@viz-js/viz";

export const convertDotSrc = (dotSrc: string, viz: Viz): [D3Node[], D3Edge[]] => {
  try {
    const jsonOutput = viz.renderJSON(dotSrc) as GraphLayout;
    console.log(jsonOutput)
    const nodes: D3Node[] = jsonOutput.objects.map((node: NodeObject, index: number) => {
      const posString = node.pos.split(",")
      const [posX, posY] = [parseInt(posString[0]), parseInt(posString[1])]
      return (
        {
        id: node.name,
        d3id: index,
        label: node.label,
        posX,
        posY,
        width: parseFloat(node.width) * 72,
        height: parseFloat(node.height) * 72,
      })
    });

    const edges: D3Edge[] = jsonOutput.edges.map((edge: any) => ({
      from: edge.tail,
      to: edge.head,
      pos: edge.pos,
    }));

    return [nodes, edges];
  } catch (error) {
    console.error("Error converting DOT to JSON:", error);
    return [[],[]];
  }
};
