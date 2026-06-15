import * as dot from "graphlib-dot";
import type {
	D3Edge,
	D3Node,
	GraphLayout,
	LabelDrawOp,
	NodeObject,
} from "../types/Graph";
import { createNode } from "./GraphBuilder";
import { instance, type Viz } from "@viz-js/viz";

export const convertDotSrc = (
	dotSrc: string,
	viz: Viz
): [D3Node[], D3Edge[]] => {
	const labelSpace = dotSrc.replace(/label=(\w+)/g, 'label=" $1"');
	const jsonOutput = viz.renderJSON(labelSpace) as GraphLayout;
	const nodes: D3Node[] = jsonOutput.objects.map(
		(node: NodeObject, index: number) => {
			const posString = node.pos.split(",");
			const [posX, posY] = [parseInt(posString[0]), parseInt(posString[1])];
			return {
				id: node.name,
				d3id: index,
				label: node.label !== "\\N" ? node.label : null,
				posX,
				posY,
				width: parseFloat(node.width) * 72,
				height: parseFloat(node.height) * 72,
			};
		}
	);

	// Helper function to find a node by its d3id
	const findNodeByD3ID = (gvid: number): D3Node | undefined => {
		return nodes.find((node) => node.d3id === gvid);
	};
	let edges: D3Edge[] = [];

	// Edges might not exist
	if (jsonOutput.edges) {
		edges = jsonOutput.edges.map((edge: any) => {
			const fromNode = findNodeByD3ID(edge.tail);
			const toNode = findNodeByD3ID(edge.head);
			if (!fromNode || !toNode) {
				throw new Error(
					`Edge refers to non-existent nodes: ${edge.tail} -> ${edge.head}`
				);
			}
			let textPos = null;
			let weight: number | null = null;

			try {
				const edgeText = edge._ldraw_.find(
					(text: LabelDrawOp) => text.op === "T"
				);
				textPos = edgeText.pt;
				weight = parseInt(edgeText.text);
			} catch {
				console.log("No ldraw TODO");
			}

			return {
				from: fromNode, // Assign the actual D3Node object for `from`
				to: toNode, // Assign the actual D3Node object for `to`
				pos: edge.pos,
				weight: weight || null,
				textPos,
			};
		});
	}

	return [nodes, edges];
};
