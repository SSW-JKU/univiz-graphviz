import * as d3 from "d3";
import type {
	PedagogicalAnnotation,
	PetAnnotationTarget,
	PetAskAnnotation,
	PetHighlightAnnotation,
	PetQuestionAnswer,
	PetQuestionOption,
	PetSayAnnotation,
} from "../algorithms/types";

type Point = {
	x: number;
	y: number;
};

type LocalBox = {
	x: number;
	y: number;
	width: number;
	height: number;
};

type TextMetrics = {
	lineCount: number;
	width: number;
};

type SVGPetAnnotationManagerOptions = {
	getSvg: () => SVGSVGElement | null;
	getRootG: () => SVGGElement | null;
	getAnswer: (annotationId: string) => PetQuestionAnswer | undefined;
	onAnswer: (annotationId: string, option: PetQuestionOption) => void;
};

export class TablePetAnnotationManager {
	private annotations: PedagogicalAnnotation[] = [];
	// Values are node d3 IDs whose distance columns should receive a PET highlight.
	private distanceHighlightNodeIds = new Set<number>();
	private localMinHighlightActive = false;

	public setAnnotations(annotations: PedagogicalAnnotation[]): void {
		this.annotations = annotations.filter(
			(annotation) => !annotation.view || annotation.view === "TableView"
		);
		this.updateHighlightState();
	}

	public clear(): void {
		this.annotations = [];
		this.updateHighlightState();
	}

	public hasDistanceHighlight(nodeId: number): boolean {
		return this.distanceHighlightNodeIds.has(nodeId);
	}

	public hasLocalMinHighlight(): boolean {
		return this.localMinHighlightActive;
	}

	private updateHighlightState(): void {
		this.distanceHighlightNodeIds = new Set();
		for (const annotation of this.annotations) {
			if (
				annotation.action === "highlight" &&
				annotation.target.kind === "distance"
			) {
				this.distanceHighlightNodeIds.add(annotation.target.nodeId);
			}
		}
		this.localMinHighlightActive = this.annotations.some(
			(annotation) =>
				annotation.action === "highlight" &&
				annotation.target.kind === "localMin"
		);
	}
}

const DEFAULT_CALLOUT_OFFSET: Point = { x: 18, y: -42 };
const CALLOUT_MIN_WIDTH = 120;
const CALLOUT_MAX_WIDTH = 260;
const CALLOUT_TEXT_FALLBACK_CHAR_WIDTH = 7;

export class SVGPetAnnotationManager {
	private annotations: PedagogicalAnnotation[] = [];
	// Keys are PET annotation IDs; values are callout offsets from the target
	// anchor in graph-local coordinates.
	private readonly calloutOffsets = new Map<string, Point>();

	public constructor(private readonly options: SVGPetAnnotationManagerOptions) {}

	public setAnnotations(annotations: PedagogicalAnnotation[]): void {
		this.annotations = annotations.filter(
			(annotation) => !annotation.view || annotation.view === "GraphView"
		);
		this.redraw();
	}

	public clear(): void {
		this.annotations = [];
		this.redraw();
	}

	public redraw(): void {
		const rootG = this.options.getRootG();
		if (!rootG) return;

		const layer = d3.select(rootG);
		layer.selectAll("g.pet-annotation").remove();

		for (const annotation of this.annotations) {
			if (annotation.action === "highlight") {
				this.drawHighlight(layer, annotation);
			}
		}

		for (const annotation of this.annotations) {
			if (annotation.action === "say") {
				this.drawBubble(layer, annotation);
			} else if (annotation.action === "ask") {
				this.drawQuestion(layer, annotation);
			}
		}
	}

	private drawHighlight(
		layer: d3.Selection<SVGGElement, unknown, null, undefined>,
		annotation: PetHighlightAnnotation
	): void {
		if (annotation.target.kind === "edge") {
			this.drawEdgeHighlight(layer, annotation);
			return;
		}

		const box = this.targetLocalBox(annotation.target);
		if (!box) return;

		const padding = annotation.payload?.padding ?? 8;
		const group = layer
			.append("g")
			.attr("class", "pet-annotation pet-highlight")
			.attr("data-pet-id", annotation.id);
		group.lower();

		group
			.append("rect")
			.attr("x", box.x - padding)
			.attr("y", box.y - padding)
			.attr("width", Math.max(box.width + padding * 2, 18))
			.attr("height", Math.max(box.height + padding * 2, 18))
			.attr("rx", 6)
			.attr("ry", 6)
			.attr("fill", annotation.payload?.color ?? "#ffc552")
			.attr("opacity", annotation.payload?.opacity ?? 0.35);
	}

	private drawEdgeHighlight(
		layer: d3.Selection<SVGGElement, unknown, null, undefined>,
		annotation: PetHighlightAnnotation
	): void {
		const rootG = this.options.getRootG();
		if (!rootG) return;

		const paths = this.targetElements(rootG, annotation.target).filter(
			(element): element is SVGPathElement => element instanceof SVGPathElement
		);
		if (paths.length === 0) return;

		const group = layer
			.append("g")
			.attr("class", "pet-annotation pet-highlight")
			.attr("data-pet-id", annotation.id);
		group.lower();

		for (const path of paths) {
			group
				.append("path")
				.attr("d", path.getAttribute("d"))
				.attr("fill", "none")
				.attr("stroke", annotation.payload?.color ?? "#ffc552")
				.attr("stroke-width", 10)
				.attr("stroke-linecap", "round")
				.attr("stroke-linejoin", "round")
				.attr("opacity", annotation.payload?.opacity ?? 0.35);
		}
	}

	private drawBubble(
		layer: d3.Selection<SVGGElement, unknown, null, undefined>,
		annotation: PetSayAnnotation
	): void {
		this.drawCallout(
			layer,
			annotation,
			"pet-speech-bubble",
			annotation.payload.text
		);
	}

	private drawQuestion(
		layer: d3.Selection<SVGGElement, unknown, null, undefined>,
		annotation: PetAskAnnotation
	): void {
		this.drawCallout(
			layer,
			annotation,
			"pet-question",
			annotation.payload.question,
			annotation.payload.options
		);
	}

	private drawCallout(
		layer: d3.Selection<SVGGElement, unknown, null, undefined>,
		annotation: PetSayAnnotation | PetAskAnnotation,
		className: "pet-speech-bubble" | "pet-question",
		textValue: string,
		options: PetQuestionOption[] = []
	): void {
		const anchor = this.targetAnchor(annotation.target);
		if (!anchor) return;

		const group = layer
			.append("g")
			.attr("class", `pet-annotation ${className}`)
			.attr("data-pet-id", annotation.id);

		const paddingX = 10;
		const paddingY = 8;
		const lineHeight = 16;
		const buttonHeight = 24;
		const buttonGap = 6;
		const feedbackGap = 8;
		const answer = this.options.getAnswer(annotation.id);
		const feedbackText = answer?.feedback;

		const text = group
			.append("text")
			.attr("class", `${className}-text`)
			.attr("x", 0)
			.attr("y", 0);

		const textMetrics = wrapText(text, textValue, CALLOUT_MAX_WIDTH, lineHeight);
		const optionWidth =
			options.length > 0
				? Math.max(
						...options.map(
							(option) =>
								measureText(group, "pet-question-option-text", option.label) + 20
						)
					)
				: 0;
		const feedbackWidth = feedbackText
			? Math.min(
					CALLOUT_MAX_WIDTH,
					measureText(group, "pet-question-feedback", feedbackText)
				)
			: 0;
		const contentWidth = Math.min(
			CALLOUT_MAX_WIDTH,
			Math.max(CALLOUT_MIN_WIDTH, textMetrics.width, optionWidth, feedbackWidth)
		);
		const feedbackLines = feedbackText
			? Math.max(1, Math.ceil(feedbackText.length / 42))
			: 0;
		const optionBlockHeight =
			options.length > 0
				? buttonGap + options.length * buttonHeight + (options.length - 1) * 4
				: 0;
		const feedbackBlockHeight =
			feedbackLines > 0 ? feedbackGap + feedbackLines * 14 : 0;
		const rectWidth = contentWidth + paddingX * 2;
		const rectHeight =
			textMetrics.lineCount * lineHeight +
			paddingY * 2 +
			optionBlockHeight +
			feedbackBlockHeight;
		const calloutPosition = this.calloutPosition(
			annotation.id,
			anchor,
			rectWidth,
			rectHeight
		);
		const rectX = calloutPosition.x;
		const rectY = calloutPosition.y;

		group
			.insert("path", "text")
			.attr("class", `${className}-pointer`)
			.attr("d", pointerPath(anchor, rectX, rectY, rectWidth, rectHeight));

		group
			.insert("rect", "text")
			.attr("class", `${className}-box`)
			.attr("x", rectX)
			.attr("y", rectY)
			.attr("width", rectWidth)
			.attr("height", rectHeight)
			.attr("rx", 6)
			.attr("ry", 6);

		text.attr(
			"transform",
			`translate(${rectX + paddingX}, ${rectY + paddingY + 11})`
		);

		let y = rectY + paddingY + textMetrics.lineCount * lineHeight + buttonGap;
		if (options.length > 0) {
			this.drawQuestionButtons(
				group,
				annotation as PetAskAnnotation,
				options,
				rectX + paddingX,
				y,
				contentWidth,
				buttonHeight
			);
			y += options.length * buttonHeight + (options.length - 1) * 4 + feedbackGap;
		}

		if (feedbackText) {
			const feedback = group
				.append("text")
				.attr("class", `pet-question-feedback ${answer.correct ? "correct" : "incorrect"}`)
				.attr("transform", `translate(${rectX + paddingX}, ${y + 10})`);
			wrapText(feedback, feedbackText, contentWidth, 14);
		}

		group.call(
			d3
				.drag<SVGGElement, unknown>()
				.on("start", () => {
					group.classed("dragging", true);
				})
				.on("drag", (event) => {
					const scale = this.graphScale();
					const offset = this.calloutOffset(annotation.id);
					this.calloutOffsets.set(annotation.id, {
						x: offset.x + event.dx / scale,
						y: offset.y + event.dy / scale,
					});
					this.redraw();
				})
				.on("end", () => {
					group.classed("dragging", false);
				})
		);
	}

	private drawQuestionButtons(
		group: d3.Selection<SVGGElement, unknown, null, undefined>,
		annotation: PetAskAnnotation,
		options: PetQuestionOption[],
		x: number,
		y: number,
		width: number,
		buttonHeight: number
	): void {
		const answer = this.options.getAnswer(annotation.id);

		options.forEach((option, index) => {
			const selected = answer?.optionId === option.id;
			const button = group
				.append("g")
				.attr(
					"class",
					`pet-question-option ${selected ? "selected" : ""} ${
						selected ? (answer.correct ? "correct" : "incorrect") : ""
					}`
				)
				.attr("transform", `translate(${x}, ${y + index * (buttonHeight + 4)})`)
				.on("click", (event) => {
					event.stopPropagation();
					this.options.onAnswer(annotation.id, option);
				});

			button
				.append("rect")
				.attr("width", width)
				.attr("height", buttonHeight)
				.attr("rx", 4)
				.attr("ry", 4);

			button
				.append("text")
				.attr("class", "pet-question-option-text")
				.attr("x", 8)
				.attr("y", 16)
				.text(option.label);
		});
	}

	private targetAnchor(target: PetAnnotationTarget): Point | null {
		if (target.kind === "edge") {
			const edgeAnchor = this.edgeAnchor(target);
			if (edgeAnchor) return edgeAnchor;
		}

		const box = this.targetLocalBox(target);
		if (!box) return null;
		return {
			x: box.x + box.width,
			y: box.y,
		};
	}

	private edgeAnchor(
		target: Extract<PetAnnotationTarget, { kind: "edge" }>
	): Point | null {
		const rootG = this.options.getRootG();
		if (!rootG) return null;

		const label = rootG.querySelector<SVGGraphicsElement>(
			this.edgeSelector(target, "text.edge-weight")
		);
		if (label) {
			const box = label.getBBox();
			return {
				x: box.x + box.width / 2,
				y: box.y + box.height / 2,
			};
		}

		const path = rootG.querySelector<SVGPathElement>(
			this.edgeSelector(target, "path.edge")
		);
		if (!path) return null;

		const midpoint = path.getPointAtLength(path.getTotalLength() / 2);
		return {
			x: midpoint.x,
			y: midpoint.y,
		};
	}

	private calloutPosition(
		annotationId: string,
		anchor: Point,
		rectWidth: number,
		rectHeight: number
	): Point {
		const bounds = this.visibleLocalBounds();
		const offset = this.calloutOffset(annotationId);
		let x = anchor.x + offset.x;
		let y = anchor.y + offset.y;

		if (!bounds) return { x, y };

		const margin = 8;
		const rightLimit = bounds.x + bounds.width - margin;
		const bottomLimit = bounds.y + bounds.height - margin;

		if (!this.calloutOffsets.has(annotationId) && x + rectWidth > rightLimit) {
			x = anchor.x - rectWidth - DEFAULT_CALLOUT_OFFSET.x;
		}
		x = Math.min(Math.max(x, bounds.x + margin), rightLimit - rectWidth);
		y = Math.min(Math.max(y, bounds.y + margin), bottomLimit - rectHeight);

		return { x, y };
	}

	private calloutOffset(annotationId: string): Point {
		return this.calloutOffsets.get(annotationId) ?? DEFAULT_CALLOUT_OFFSET;
	}

	private graphScale(): number {
		const svg = this.options.getSvg();
		return svg ? d3.zoomTransform(svg).k || 1 : 1;
	}

	private visibleLocalBounds(): LocalBox | null {
		const svg = this.options.getSvg();
		const rootG = this.options.getRootG();
		const ctm = rootG?.getScreenCTM();
		if (!svg || !rootG || !ctm) return null;

		const rect = svg.getBoundingClientRect();
		const topLeft = this.pointInGraphCoordinates({
			x: rect.left,
			y: rect.top,
		});
		const bottomRight = this.pointInGraphCoordinates({
			x: rect.right,
			y: rect.bottom,
		});
		if (!topLeft || !bottomRight) return null;

		const x = Math.min(topLeft.x, bottomRight.x);
		const y = Math.min(topLeft.y, bottomRight.y);
		return {
			x,
			y,
			width: Math.abs(bottomRight.x - topLeft.x),
			height: Math.abs(bottomRight.y - topLeft.y),
		};
	}

	private pointInGraphCoordinates(point: Point): Point | null {
		const svg = this.options.getSvg();
		const rootG = this.options.getRootG();
		const ctm = rootG?.getScreenCTM();
		if (!svg || !ctm) return null;

		const svgPoint = svg.createSVGPoint();
		svgPoint.x = point.x;
		svgPoint.y = point.y;
		const localPoint = svgPoint.matrixTransform(ctm.inverse());
		return { x: localPoint.x, y: localPoint.y };
	}

	private targetLocalBox(target: PetAnnotationTarget): LocalBox | null {
		const rootG = this.options.getRootG();
		if (!rootG) return null;

		const elements = this.targetElements(rootG, target);
		const boxes = elements
			.map((element) => element.getBBox())
			.filter((box) => box.width !== 0 || box.height !== 0);

		if (boxes.length === 0) return null;

		const left = Math.min(...boxes.map((box) => box.x));
		const top = Math.min(...boxes.map((box) => box.y));
		const right = Math.max(...boxes.map((box) => box.x + box.width));
		const bottom = Math.max(...boxes.map((box) => box.y + box.height));

		return {
			x: left,
			y: top,
			width: right - left,
			height: bottom - top,
		};
	}

	private targetElements(
		rootG: SVGGElement,
		target: PetAnnotationTarget
	): SVGGraphicsElement[] {
		if (target.kind === "graph") {
			return Array.from(
				rootG.querySelectorAll<SVGGraphicsElement>(
					"ellipse[data-node], path.edge"
				)
			);
		}

		if (target.kind === "node") {
			return Array.from(
				rootG.querySelectorAll<SVGGraphicsElement>(
					`ellipse[data-node="${target.nodeId}"]`
				)
			);
		}

		if (target.kind === "edge") {
			return Array.from(
				rootG.querySelectorAll<SVGGraphicsElement>(
					this.edgeSelector(target, "path.edge")
				)
			);
		}

		return [];
	}

	private edgeSelector(
		target: Extract<PetAnnotationTarget, { kind: "edge" }>,
		prefix: string
	): string {
		return `${prefix}[data-edge="${target.fromId}->${target.toId}"], ${prefix}[data-edge="${target.toId}->${target.fromId}"]`;
	}
}

function wrapText(
	text: d3.Selection<SVGTextElement, unknown, null, undefined>,
	value: string,
	maxWidth: number,
	lineHeight: number
): TextMetrics {
	const words = value.split(/\s+/).filter(Boolean);
	const lines: string[] = [];
	let line = "";
	const probe = text.append("tspan").attr("x", 0);

	for (const word of words) {
		const nextLine = line.length === 0 ? word : `${line} ${word}`;
		probe.text(nextLine);
		if (
			measureTextNode(probe.node(), nextLine) > maxWidth &&
			line.length > 0
		) {
			lines.push(line);
			line = word;
		} else {
			line = nextLine;
		}
	}

	if (line.length > 0) lines.push(line);
	if (lines.length === 0) lines.push("");
	probe.remove();

	const tspans = text
		.selectAll<SVGTSpanElement, string>("tspan")
		.data(lines)
		.join("tspan")
		.attr("x", 0)
		.attr("dy", (_line, index) => (index === 0 ? 0 : lineHeight))
		.text((textLine) => textLine);

	const width = Math.max(
		...tspans
			.nodes()
			.map((node) => measureTextNode(node, node.textContent ?? ""))
	);
	return { lineCount: lines.length, width };
}

function measureText(
	group: d3.Selection<SVGGElement, unknown, null, undefined>,
	className: string,
	value: string
): number {
	const text = group
		.append("text")
		.attr("class", className)
		.attr("opacity", 0)
		.text(value);
	const width = measureTextNode(text.node(), value);
	text.remove();
	return width;
}

function measureTextNode(
	node: SVGTextContentElement | null,
	fallbackText: string
): number {
	try {
		return (
			node?.getComputedTextLength() ??
			fallbackText.length * CALLOUT_TEXT_FALLBACK_CHAR_WIDTH
		);
	} catch {
		return fallbackText.length * CALLOUT_TEXT_FALLBACK_CHAR_WIDTH;
	}
}

function pointerPath(
	anchor: Point,
	rectX: number,
	rectY: number,
	rectWidth: number,
	rectHeight: number
): string {
	const attachX = anchor.x < rectX ? rectX : rectX + rectWidth;
	const attachY = Math.min(Math.max(anchor.y, rectY + 12), rectY + rectHeight - 12);
	const halfBase = 7;
	return `M${anchor.x},${anchor.y} L${attachX},${attachY - halfBase} L${attachX},${attachY + halfBase} Z`;
}
