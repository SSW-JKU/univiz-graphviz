import { EditorView } from "@codemirror/view";
import type { D3Node } from "../types/Graph";

export const findNodeByD3ID = (
	gvid: number,
	nodes: D3Node[]
): string | undefined => {
	const node = nodes.find((node) => node.d3id === gvid);
	return node?.label || node?.id;
};

// Define a custom theme for read-only mode
export const readOnlyTheme = EditorView.theme({
	"&": {
		color: "gray", // Gray out the text
		backgroundColor: "#f5f5f5", // Optional: light gray background
	},
	".cm-content": {
		pointerEvents: "none", // Disable text selection and interaction
	},
	".cm-line": {
		color: "gray", // Ensure individual lines are also gray
		fontStyle: "italic", // Make text italic
	},
});
