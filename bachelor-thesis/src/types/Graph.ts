export type D3Node = {
  id: string; // Unique identifier for the node
  d3id: number;
  label: string | null; // The label displayed for the node
  posX: number; // X-coordinate position of the node in the SVG canvas
  posY: number; // Y-coordinate position of the node in the SVG canvas
  width: number;
  height: number;
};

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

export type DrawOp = {
  op: string; // Operation type (e.g., 'c' for color, 'b' for bezier curve)
  grad?: string; // Gradient color, if applicable
  color?: string; // Color for the operation
  rect?: [number, number, number, number]; // Rectangle dimensions for ellipse
  points?: [number, number][]; // Array of points for bezier curves or polygons
  style?: string; // Line style (solid, dashed, etc.)
};

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

export type EdgeLayout = {
  _gvid: number; // Graphviz ID for the edge
  tail: number; // The tail node index
  head: number; // The head node index
  _draw_: DrawOp[]; // Drawing operations for the edge
  _hdraw_: DrawOp[]; // Highlight drawing operations (for hover/selection)
  pos: string; // Edge position string with control points
};
