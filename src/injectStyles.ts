import { colors } from "./colors/colors";
import { constants } from "./constants";

export function injectCSSVariables() {
	const root = document.documentElement;
	for (const [key, value] of Object.entries(colors)) {
		root.style.setProperty(`--${key}`, value);
	}
	for (const [key, value] of Object.entries(constants)) {
		root.style.setProperty(`--${key}`, value);
	}
}
