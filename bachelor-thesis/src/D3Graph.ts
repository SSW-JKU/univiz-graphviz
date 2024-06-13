import * as d3 from "d3";
import { type Graphviz } from "d3-graphviz";
import type { Writable } from "svelte/store";

export const handleResize = (
  entries: ResizeObserverEntry[],
  graphviz: Graphviz<SVGGElement, unknown, null, undefined>
): void => {
  for (let entry of entries) {
    const { width, height } = entry.contentRect;
    console.log(graphviz.data(), height, width);
    graphviz.width(width).height(height);
  }
  renderGraph(graphviz);
};

export const renderGraph = (
  graphviz: Graphviz<SVGGElement, unknown, null, undefined>
): void => {
  graphviz.render();
  // .on("end", interactive);
};

/**
 * UNUSED
 */
export const interactive = () => {
  const nodes = d3.selectAll(".node,.edge");
  nodes.on("click", function () {
    const element = d3.select(this);
    const title = element.selectAll("title").text().trim();
    const text = element.selectAll("text").text();
    const id = element.attr("id");
    const class1 = element.attr("class");
    const dotElement = title.replace("->", " -> ");

    dotSrcLines = dotSrcLines.filter((line) => !line.includes(dotElement));

    dotSrc = dotSrcLines.join("\n");
    renderGraph();
  });
};

export const addNode = (nodesStore: Writable<string[]>, newNode: string, dotSrcStore: Writable<string>) => {
    nodesStore.update((existingNodes) => [...existingNodes, newNode])
}