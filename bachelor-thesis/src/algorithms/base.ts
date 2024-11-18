import type { D3Node } from "../types/Graph";

export const findNodeByD3ID = (gvid: number, nodes: D3Node[]): string | undefined => {
    const node = nodes.find((node) => node.d3id === gvid);
    return node?.label || node?.id
};