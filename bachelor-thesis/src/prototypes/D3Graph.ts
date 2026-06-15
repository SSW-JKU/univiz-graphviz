import * as d3 from "d3";
import { type Graphviz } from "d3-graphviz";
import { get, type Writable } from "svelte/store";
import type { GraphNode } from "./D3GraphTypes";

export const renderGraph = (
  graphviz: Graphviz<SVGElement, unknown, null, undefined>
): void => {
  graphviz.render();
  // .on("end", interactive);
};

export const addNode = (
  nodesStore: Writable<GraphNode[]>,
  label: string,
  id: number
) => {
  label = label.replace(/[\r\n]+/g, " ");
  console.log("label", label);
  const newNode: GraphNode = {
    id,
    label: label,
    posX: 0,
    posY: 0,
    connectedNodes: [],
  };
  nodesStore.update((existingNodes) => [...existingNodes, newNode]);
};

export const labelExists = (
  nodesStore: Writable<GraphNode[]>,
  label: string
) => {
  const nodes = get(nodesStore);
  if (label === "") {
    return true;
  }
  return nodes.some((node) => node.label.includes(label));
};

export const updateDotSrc = (
  dotSrcStore: Writable<string>,
  nodesStore: Writable<GraphNode[]>
) => {
  let newDotSrc: string;
  let nodeStrings: string[] = [];
  for (const node of get(nodesStore)) {
    nodeStrings.push(node.label + '[id="node' + node.id + '"]');
  }
  newDotSrc = "digraph { " + nodeStrings.join(" ") + " }";
  console.log(newDotSrc)
  dotSrcStore.update((dotSrc) => (dotSrc = newDotSrc));
};

export const handleResize = (
  entries: ResizeObserverEntry[],
  graphviz: Graphviz<SVGElement, unknown, null, undefined>
): void => {
  for (let entry of entries) {
    const { width, height } = entry.contentRect;
    console.log(graphviz.data(), height, width);
    graphviz.width(width).height(height);
  }
  renderGraph(graphviz);
};

export const getGraphNodeByID = () => {

}

export const getSVGNodeByID = (id: number): SVGGElement | null => {
  return document.getElementById(`node${id}`) as SVGGElement | null;
}

//////////////////// UNUSED

// export const interactive = () => {
//   const nodes = d3.selectAll(".node,.edge");
//   nodes.on("click", function () {
//     const element = d3.select(this);
//     const title = element.selectAll("title").text().trim();
//     const text = element.selectAll("text").text();
//     const id = element.attr("id");
//     const class1 = element.attr("class");
//     const dotElement = title.replace("->", " -> ");

//     dotSrcLines = dotSrcLines.filter((line) => !line.includes(dotElement));

//     dotSrc = dotSrcLines.join("\n");
//     renderGraph();
//   });
// };

// export const isNodeLabelUnique = (
//   label: string,
//   nodes: GraphNode[]
// ): boolean => {
//   for (const node of nodes) {
//     if (label === node.label) {
//       return false;
//     }
//   }
//   return true;
// };
