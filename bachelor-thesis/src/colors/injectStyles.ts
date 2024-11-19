import { colors } from './colors';

export function injectCSSVariables() {
	const root = document.documentElement;
	for (const [key, value] of Object.entries(colors)) {
		root.style.setProperty(`--${key}`, value);
	}
}
