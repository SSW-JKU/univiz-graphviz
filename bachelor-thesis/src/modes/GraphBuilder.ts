import * as d3 from "d3";
import * as transition from "d3-transition";
import { get, type Writable } from "svelte/store";

// Define the type for a node in the graph
export type D3Node = {
  id: string; // Unique identifier for the node
  d3id: number;
  label: string; // The label displayed for the node
  posX: number; // X-coordinate position of the node in the SVG canvas
  posY: number; // Y-coordinate position of the node in the SVG canvas
  width: number;
  height: number;
};

// Define the type for an edge connecting two nodes in the graph
export type D3Edge = {
  from: D3Node; // Starting node of the edge
  to: D3Node; // Ending node of the edge
  pos: string; //
};

export type GraphLayout = {
  name: string; // Graph name
  directed: boolean; // Whether the graph is directed
  strict: boolean; // Whether the graph is strict
  _draw_: DrawOp[]; // Drawing operations for the entire graph
  bb: string; // Bounding box for the layout
  nodesep: string; // Node separation value
  ranksep: string; // Rank separation value
  splines: string; // Splines information for edge routing
  xdotversion: string; // XDOT version
  _subgraph_cnt: number; // Number of subgraphs
  objects: NodeObject[]; // Array of node objects
  edges: EdgeLayout[]; // Array of edges
};

// Define the type for the node objects in the graph
export type NodeObject = {
  _gvid: number; // Graphviz ID for the node
  name: string; // Node name (e.g., "node0", "node1")
  _draw_: DrawOp[]; // Drawing operations for rendering the node
  _ldraw_: LabelDrawOp[]; // Drawing operations for the label
  height: string; // Node height
  label: string; // Node label (text shown)
  pos: string; // Position of the node in the layout
  width: string; // Node width
};

// Define the type for drawing operations (used in both nodes and edges)
export type DrawOp = {
  op: string; // Operation type (e.g., 'c' for color, 'b' for bezier curve)
  grad?: string; // Gradient color, if applicable
  color?: string; // Color for the operation
  rect?: [number, number, number, number]; // Rectangle dimensions for ellipse
  points?: [number, number][]; // Array of points for bezier curves or polygons
  style?: string; // Line style (solid, dashed, etc.)
};

// Define the type for label drawing operations (text, font size, etc.)
export type LabelDrawOp = {
  op: string; // Operation type ('F' for font, 'T' for text)
  size?: number; // Font size for text labels
  face?: string; // Font face (e.g., 'Times-Roman')
  grad?: string; // Gradient color, if applicable
  color?: string; // Color for text or other elements
  pt?: [number, number]; // Position of the text (or other elements)
  align?: string; // Text alignment (e.g., 'c' for center)
  width?: number; // Width of the text label
  text?: string; // The actual label text
};

// Define the type for edges between nodes
export type EdgeLayout = {
  _gvid: number; // Graphviz ID for the edge
  tail: number; // The tail node index
  head: number; // The head node index
  _draw_: DrawOp[]; // Drawing operations for the edge
  _hdraw_: DrawOp[]; // Highlight drawing operations (for hover/selection)
  pos: string; // Edge position string with control points
};

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
  id: number,
  label?: string,
  posX?: number,
  posY?: number,
  width?: number,
  height?: number
): D3Node => {
  return {
    id: "node" + id, // Creates a unique id like "node1", "node2"
    d3id: id,
    label: label ?? "Node " + id, // Assigns a default label if none provided
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
  directedGraph: boolean
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
      selectedNodes.update((nodes) => (nodes = [...nodes, d])); // Add the node to the selected nodes list
    } else if (currentFill === "red") {
      ellipse.style("fill", "white");
      selectedNodes.update((nodes) => nodes.filter((node) => node.id !== d.id)); // Remove the node from the selection
    }
  };

  // Render nodes as ellipses
  g.selectAll<SVGEllipseElement, D3Node>("ellipse")
    .data(nodes, (d: D3Node) => d.id) // Use node ID as the key
    .join("ellipse")
    .attr("cx", (d) => d.posX) // X-position (center of the ellipse)
    .attr("cy", (d) => height - d.posY) // Y-position (center of the ellipse)
    .attr("rx", (d) => d.width / 2) // Half of the width for the radius
    .attr("ry", (d) => d.height / 2) // Half of the height for the radius
    .attr("data-node", (d) => d.id) // Set a custom data attribute with the node ID
    .style("stroke", "gray") // Outline color of the ellipse
    .style("fill", (d) =>
      get(selectedNodes).find((selectedNode) => selectedNode.id === d.id)
        ? "red"
        : "white"
    ) // Default fill color for non-selected nodes
    .style("cursor", "pointer")
    .on("click", handleNodeClick);

  // Add text labels for each node
  g.selectAll<SVGTextElement, D3Node>("text")
    .data(nodes, (d: D3Node) => d.id)
    .join("text")
    .attr("x", (d) => d.posX) // Center the text in the X-axis
    .attr("y", (d) => height - d.posY) // Y-position centered vertically within the ellipse (Offset to make it perfectly centered)
    .attr("text-anchor", "middle") // Align text horizontally
    .attr("dominant-baseline", "middle") // Align text vertically
    .style("font-size", "12px")
    .style("fill", "black")
    .text((d) => d.label) // Display the node label text
    .style("cursor", "pointer")
    .on("click", handleNodeClick);

  // Redraw lines representing edges between nodes
  redrawLines(g, edges, svg, directedGraph);
};

const addArrowMarker = (svg: SVGElement) => {
  d3.select(svg)
    .append("defs")
    .append("marker")
    .attr("id", "arrow")
    .attr("viewBox", "0 -5 10 10") // Define the marker's bounding box
    .attr("refX", 9) // Position of the marker's tip
    .attr("refY", 0)
    .attr("markerWidth", 12) // Size of the marker
    .attr("markerHeight", 9)
    .attr("orient", "auto") // Orient the marker automatically to follow the path's direction
    .append("path")
    .attr("d", "M0,-5L10,0L0,5") // Arrowhead shape (triangle)
    .attr("fill", "black"); // Color of the arrowhead (same as the edge stroke)
};

/**
 * TODO
 */
const redrawLines = (
  g: d3.Selection<SVGGElement, null, SVGElement, undefined>,
  edges: D3Edge[],
  svg: SVGElement,
  directedGraph: boolean
) => {
  // Create a line generator with smooth curves (using d3.curveBasis for a nice smooth path)
  const lineGenerator = d3.line().curve(d3.curveBasis);
  addArrowMarker(svg);

  g.selectAll<SVGPathElement, D3Edge>("path")
    .data(edges, (d: D3Edge) => d.from.id + "_" + d.to.id) // Use unique edge key
    .join("path")
    .attr("d", (d) => {
      // Parse the pos string into points and use it to generate the path
      const points = parseEdgePos(d.pos, svg.getBoundingClientRect().height);

      // Generate the path using the parsed control points
      return lineGenerator(points);
    })
    .style("stroke", "black") // Line color
    .style("fill", "none") // No fill for the path
    .attr("marker-end", directedGraph ? "url(#arrow)" : null) // Add arrow marker at the end of the line
    .attr("data-edge", (d) => `${d.from.id}->${d.to.id}`); // Custom data attribute for edges

  centerGroupInSvg(svg, g);
};

const centerGroupInSvg = (
  svg: SVGElement,
  group: d3.Selection<SVGGElement, null, SVGElement, undefined>
) => {
  const svgBBox = svg.getBoundingClientRect(); // Get the dimensions of the SVG
  const groupBBox = group.node()?.getBBox(); // Get the bounding box of the group

  // Calculate the translation needed to center the group
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
  extensionLength: number = 11
): [number, number][] => {
  const pointStrings = pos.split(" ").slice(1); // Ignore the first part (e.g., "e,")
  const points: [number, number][] = pointStrings.map((pointStr) => {
    const [x, y] = pointStr.split(",").map(Number);
    return [x, svgHeight - y];
  });

  // Extend the last point of the edge
  if (points.length >= 2) {
    const [x1, y1] = points[points.length - 2]; // Second to last point
    const [x2, y2] = points[points.length - 1]; // Last point

    // Calculate the direction vector from the second-to-last to the last point
    const dx = x2 - x1;
    const dy = y2 - y1;

    // Normalize the direction vector
    const length = Math.sqrt(dx * dx + dy * dy);
    const unitDx = dx / length;
    const unitDy = dy / length;

    // Extend the last point by the desired extension length
    const extendedX = x2 + unitDx * extensionLength;
    const extendedY = y2 + unitDy * extensionLength;

    // Replace the last point with the extended point
    points[points.length - 1] = [extendedX, extendedY];
  }

  return points;
};

/**
 * TODO
 */
export const getDotSrc = (nodes: D3Node[], edges: D3Edge[]): string => {
  // Create DOT node and edge strings
  const nodeLabels = nodes.map((node) => `${node.id} [label="${node.label}"]`);
  const edgeLabels = edges.map((edge) => `${edge.from.id} -> ${edge.to.id}`);
  // Combine nodes and edges into the DOT format
  const dotSrc = `digraph { \nsplines=true;\n${nodeLabels.join(
    // \nrankdir="LR" for left to right
    "\n"
  )}\n${edgeLabels.join("\n")}}`;
  return dotSrc;
};

/**
 * Updates the positions of the nodes based on a layout provided by an external tool.
 * This function takes a layout object, finds the position of each node, and updates
 * the X and Y coordinates of the corresponding node.
 *
 * @param layout - The layout data (usually from Graphviz or another graph layout engine)
 * @param nodes - Array of nodes whose positions will be updated
 */
export const updateNodePositions = (layout: GraphLayout, nodes: D3Node[]) => {
  const nodesData = layout.objects; // Layout positions, mapping node IDs to coordinates
  nodes.forEach((node) => {
    // Find the position of the node by matching its ID in the layout
    const nodeData = nodesData.find((pos: any) => pos.name === node.id);
    if (nodeData && nodeData.pos) {
      if (nodeData.pos) {
        const [x, y] = nodeData.pos.split(",").map(parseFloat);
        node.posX = x;
        node.posY = y;
      }
      if (nodeData.width) {
        node.width = parseFloat(nodeData.width) * 72; // Convert width to pixels
      }
      if (nodeData.height) {
        node.height = parseFloat(nodeData.height) * 72; // Convert height to pixels
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
  id1: number, // ID of the tail node
  id2: number, // ID of the head node
  edges: EdgeLayout[] // Array of edges from the graph layout
): string => {
  // Find the edge where tail matches id1 and head matches id2
  const edge = edges.find((edge) => edge.tail === id1 && edge.head === id2);

  // Return the `pos` string if the edge is found, otherwise return an empty string
  return edge?.pos || ""; // Use optional chaining to check if edge exists, and return "" if not found
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

/**
 * Returns true if @param nodeLabel is greater than @param nodeCount
 * or if @param nodeLabel doesn't match the Node X pattern.
 */
export const changeLabel = (nodeLabel: string, nodeCount: number): boolean => {
  const regex = /^Node (\d+)$/;

  const match = nodeLabel.match(regex);
  if (match) {
    const nodeNumber = parseInt(match[1], 10);
    return nodeNumber <= nodeCount; //
  }
  return false;
};
