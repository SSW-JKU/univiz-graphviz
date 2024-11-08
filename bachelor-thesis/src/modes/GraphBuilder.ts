import * as d3 from "d3";
import * as transition from "d3-transition";
import { get, type Writable } from "svelte/store";
import type { D3Edge, D3Node, EdgeLayout, GraphLayout } from "../types/Graph";

/**
 * Creates a new node with an optional label and position.
 *
 * @param id - The unique numeric ID of the node
 * @param label - Optional label for the node. Defaults to "Node {id}"
 * @param posX - Optional X-coordinate for the node. Defaults to 0
 * @param posY - Optional Y-coordinate for the node. Defaults to 0
 * @returns The created node object
 */
export const createNode = (
	id: string,
	d3id: number,
	label?: string,
	posX?: number,
	posY?: number,
	width?: number,
	height?: number
): D3Node => {
	return {
		id, // Creates a unique id like "node1", "node2"
		d3id,
		label: label ?? null, // Assigns a default label if none provided
		posX: posX ?? 0, // Default position for X (0 if not provided)
		posY: posY ?? 0, // Default position for Y (0 if not provided)
		width: width ?? 0,
		height: height ?? 0,
	};
};

/**
 * Redraws the nodes and edges on the SVG canvas.
 * It binds node data to circles and edge data to lines using D3.js.
 *
 * @param svg - The SVG element to draw on
 * @param nodes - Array of nodes (D3Node) to render
 * @param edges - Array of edges (D3Edge) to render
 * @param selectedNodes - List of currently selected nodes
 */
export const redraw = (
	svg: SVGElement,
	nodes: D3Node[],
	edges: D3Edge[],
	selectedNodes: Writable<D3Node[]>,
	selectedEdge: Writable<D3Edge | null>,
	directedGraph: boolean,
	editable: boolean
) => {
	const { width, height } = svg.getBoundingClientRect();

	const g = d3
		.select(svg)
		.selectAll<SVGGElement, unknown>("g")
		.data([null]) // Dummy data to ensure only one <g> element is created
		.join("g");

	const handleNodeClick = (event: MouseEvent, d: D3Node) => {
		// Select the corresponding ellipse element to update its fill color
		const ellipse = d3.select(`[data-node="${d.id}"]`);

		const currentFill = ellipse.style("fill"); // Get current fill color
		if (currentFill === "white" && get(selectedNodes).length < 2) {
			ellipse.style("fill", "red");
			selectedNodes.update((nodes) => (nodes = [...nodes, d]));
		} else if (currentFill === "red") {
			ellipse.style("fill", "white");
			selectedNodes.update((nodes) => nodes.filter((node) => node.id !== d.id));
		}
	};

	g.selectAll<SVGEllipseElement, D3Node>("ellipse")
		.data(nodes, (d: D3Node) => d.id)
		.join("ellipse")
		.attr("cx", (d) => d.posX)
		.attr("cy", (d) => height - d.posY)
		.attr("rx", (d) => d.width / 2)
		.attr("ry", (d) => d.height / 2)
		.attr("data-node", (d) => d.id)
		.style("stroke", "gray")
		.style("fill", (d) =>
			get(selectedNodes).find((selectedNode) => selectedNode.id === d.id)
				? "red"
				: "white"
		)
		.style("cursor", editable ? "pointer" : "")
		.on("click", editable ? handleNodeClick : () => { });

	g.selectAll<SVGTextElement, D3Node>("text")
		.data(nodes, (d: D3Node) => d.id)
		.join("text")
		.attr("x", (d) => d.posX)
		.attr("y", (d) => height - d.posY)
		.attr("text-anchor", "middle")
		.attr("dominant-baseline", "middle")
		.style("font-size", "12px")
		.style("fill", "black")
		.text((d) => (d.label && d.label !== "\\N" ? d.label : d.id))
		.style("cursor", editable ? "pointer" : "")
		.on("click", editable ? handleNodeClick : () => { });

	redrawLines(g, edges, svg, directedGraph, editable, selectedEdge);
};

const addArrowMarker = (svg: SVGElement) => {
	d3.select(svg)
		.append("defs")
		.append("marker")
		.attr("id", "arrow")
		.attr("viewBox", "0 -5 10 10")
		.attr("refX", 9)
		.attr("refY", 0)
		.attr("markerWidth", 12)
		.attr("markerHeight", 9)
		.attr("orient", "auto")
		.append("path")
		.attr("d", "M0,-5L10,0L0,5")
		.attr("fill", "black");
};

/**
 * TODO
 */
const redrawLines = (
	g: d3.Selection<SVGGElement, null, SVGElement, undefined>,
	edges: D3Edge[],
	svg: SVGElement,
	directedGraph: boolean,
	editable: boolean,
	selectedEdge: Writable<D3Edge | null>
) => {
	const lineGenerator = d3.line().curve(d3.curveBasis);
	addArrowMarker(svg);

	const handleEdgeClick = (event: MouseEvent, d: D3Edge) => {
		const edge = d3.select(`[data-edge="${d.from.id}->${d.to.id}"]`);
		const currentColor = edge.style("stroke");

		if (currentColor === "black") {
			edge.style("stroke", "red");
			selectedEdge.set(d);
		} else {
			edge.style("stroke", "black");
			selectedEdge.set(null);
		}
		console.log(get(selectedEdge));
	};

	// Invisible, thicker paths for easier clicks
	g.selectAll<SVGPathElement, D3Edge>("path.hitbox")
		.data(edges, (d: D3Edge) => d.from.id + "_" + d.to.id)
		.join("path")
		.attr("class", "hitbox")
		.attr("d", (d) => {
			const points = parseEdgePos(
				d.pos,
				svg.getBoundingClientRect().height,
				directedGraph,
				d.from.posX,
				d.from.posY + d.from.height / 2
			);
			return lineGenerator(points);
		})
		.style("stroke", "transparent")
		.style("stroke-width", 20)
		.style("cursor", "pointer")
		.on("click", editable ? handleEdgeClick : () => { });

	// Main visible paths
	g.selectAll<SVGPathElement, D3Edge>("path.edge")
		.data(edges, (d: D3Edge) => d.from.id + "_" + d.to.id)
		.join("path")
		.attr("class", "edge")
		.attr("d", (d) => {
			const points = parseEdgePos(
				d.pos,
				svg.getBoundingClientRect().height,
				directedGraph,
				d.from.posX,
				d.from.posY + d.from.height / 2
			);
			return lineGenerator(points);
		})
		.style("fill", "none")
		.style("stroke", (d) => (get(selectedEdge) === d ? "red" : "black"))
		.attr("marker-end", directedGraph ? "url(#arrow)" : null)
		.attr("data-edge", (d) => `${d.from.id}->${d.to.id}`);

	// Edge weights with refined position based on `pos` data
	g.selectAll<SVGTextElement, D3Edge>("text.edge-weight")
		.data(edges, (d: D3Edge) => d.from.id + "_" + d.to.id)
		.join("text")
		.attr("class", "edge-weight")
		.attr("x", (d) => {
			const points = parseEdgePos(
				d.pos,
				svg.getBoundingClientRect().height,
				directedGraph,
				d.from.posX,
				d.from.posY,
				11
			);
			const midpointIndex = Math.floor(points.length / 2);

			// Calculate midpoint and small offset
			const [midX, midY] = points[midpointIndex];
			const [nextX, nextY] = points[midpointIndex + 1] || points[midpointIndex - 1];
			const dx = nextX - midX;
			const dy = nextY - midY;
			const length = Math.sqrt(dx * dx + dy * dy);
			const offsetX = (-dy / length) * 10; // Offset perpendicular to the edge direction
			return midX + offsetX;
		})
		.attr("y", (d) => {
			const points = parseEdgePos(
				d.pos,
				svg.getBoundingClientRect().height,
				directedGraph,
				d.from.posX,
				d.from.posY,
				11
			);
			const midpointIndex = Math.floor(points.length / 2);

			// Calculate midpoint and small offset
			const [midX, midY] = points[midpointIndex];
			const [nextX, nextY] = points[midpointIndex + 1] || points[midpointIndex - 1];
			const dx = nextX - midX;
			const dy = nextY - midY;
			const length = Math.sqrt(dx * dx + dy * dy);
			const offsetY = (dx / length) * 10; // Offset perpendicular to the edge direction
			return midY + offsetY;
		})
		.text((d) => (d.weight !== null && d.weight !== -1 ? d.weight : ""))
		.style("font-size", "12px")
		.style("fill", "black")
		.attr("text-anchor", "middle");

	centerGroupInSvg(svg, g);
};

const centerGroupInSvg = (
	svg: SVGElement,
	group: d3.Selection<SVGGElement, null, SVGElement, undefined>
) => {
	const svgBBox = svg.getBoundingClientRect();
	const groupBBox = group.node()?.getBBox();

	let svgCenterX = svgBBox.width / 2;
	let svgCenterY = svgBBox.height / 2;
	const groupCenterX = groupBBox ? groupBBox.x + groupBBox.width / 2 : 0;
	const groupCenterY = groupBBox ? groupBBox.y + groupBBox.height / 2 : 0;

	const translateX = svgCenterX - groupCenterX;
	const translateY = svgCenterY - groupCenterY;

	group.attr("transform", `translate(${translateX}, ${translateY})`);
};

const parseEdgePos = (
	pos: string,
	svgHeight: number,
	directedGraph: boolean,
	fromX: number,
	fromY: number,
	extensionLength: number = 11
): [number, number][] => {
	pos = pos.replace(/^e,/, "").trim();
	const pointStrings = pos.split(" ").slice(1);
	const points: [number, number][] = pointStrings.map((pointStr) => {
		const [x, y] = pointStr.split(",").map(Number);
		return [x, svgHeight - y];
	});
	const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
	path.setAttribute("d", "M " + pos);
	const tlength = path.getTotalLength();

	if (points.length >= 2) {
		const [x1, y1] = points[points.length - 2];
		const [x2, y2] = points[points.length - 1];

		const dx = x2 - x1;
		const dy = y2 - y1;

		const length = Math.sqrt(dx * dx + dy * dy);
		const unitDx = dx / length;
		const unitDy = dy / length;

		const extendedX = x2 + unitDx * extensionLength;
		const extendedY = y2 + unitDy * extensionLength;

		points[points.length - 1] = [extendedX, extendedY];
	}

	return points;
};

/**
 * TODO
 */
export const getDotSrc = (
	nodes: D3Node[],
	edges: D3Edge[],
	directedGraph: boolean
): string => {
	const nodeLabels = nodes.map((node) => {
		let labelString = `${node.id}`;
		if (node.label) {
			labelString += ` label="${node.label}"`;
		}
		return labelString;
	});
	const edgeLabels = edges.map((edge) => {
		let labelString = `${edge.from.id}`;
		labelString += " -> ";
		return (labelString += `${edge.to.id}`);
	});
	const graphType = "digraph";
	const dotSrc = `${graphType} { \nsplines=true;\n${nodeLabels.join(
		// \nrankdir="LR" for left to right
		"\n"
	)}\n${edgeLabels.join("\n")}}`;
	return dotSrc;
};

/**
 * TODO
 */
export const updateNodePositions = (layout: GraphLayout, nodes: D3Node[]) => {
	const nodesData = layout.objects;
	nodes.forEach((node) => {
		const nodeData = nodesData.find((pos) => pos.name === node.id); // FIXED ID
		if (nodeData && nodeData.pos) {
			if (nodeData.pos) {
				const [x, y] = nodeData.pos.split(",").map(parseFloat);
				node.posX = x;
				node.posY = y;
			}
			if (nodeData.width) {
				node.width = parseFloat(nodeData.width) * 72;
			}
			if (nodeData.height) {
				node.height = parseFloat(nodeData.height) * 72;
			}
		}
	});
};

/**
 * Retrieves the `pos` string for the edge between two nodes by their IDs.
 *
 * @param id1 - The ID of the tail node (source node)
 * @param id2 - The ID of the head node (target node)
 * @param edges - The array of edges (EdgeLayout[]) in the graph
 * @returns The `pos` string of the edge, or `undefined` if no edge is found
 */
export const getEdgePosBetweenNodes = (
	id1: number,
	id2: number,
	edges: EdgeLayout[],
	directedGraph: boolean
): string => {
	let edge;
	if (directedGraph) {
		edge = edges.find((edge) => edge.tail === id1 && edge.head === id2);
	} else {
		edge =
			edges.find((edge) => edge.tail === id1 && edge.head === id2) ||
			edges.find((edge) => edge.tail === id2 && edge.head === id1);
	}
	return edge?.pos || "";
};

/**
 * Checks if an edge already exists between these 2 nodes (Only checks one direction)
 */
export const edgeExists = (
	fromNode: D3Node,
	toNode: D3Node,
	edges: D3Edge[]
): boolean => {
	return edges.some((edge) => edge.from === fromNode && edge.to === toNode);
};
