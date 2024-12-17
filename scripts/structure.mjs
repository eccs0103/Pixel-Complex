"use strict";

import { Texture } from "./dom/palette.mjs";

//#region Filter
/**
 * @callback ModifierCallback
 * @param {Texture} texture
 * @returns {void}
 */

class Filter {
	/** @type {Map<string, Filter>} */
	static #mapNameToFilter = new Map();
	/**
	 * @readonly
	 * @returns {string[]}
	 */
	static get definitions() {
		return Array.from(Filter.#mapNameToFilter, ([name]) => name);
	}
	/**
	 * @param {string} name 
	 * @returns {Filter}
	 */
	static find(name) {
		return Filter.#mapNameToFilter.get(name) ?? Error.throws(`Undefined filter '${name}' name`);
	}
	/**
	 * @param {string} name 
	 * @param {ModifierCallback} modifier 
	 * @returns {void}
	 */
	static define(name, modifier) {
		const mapNameToFilter = Filter.#mapNameToFilter;
		if (mapNameToFilter.has(name)) throw new Error(`Filter '${name}' already defined`);
		const filter = new Filter(name, modifier);
		mapNameToFilter.set(name, filter);
	}
	/**
	 * @param {string} name 
	 * @param {ModifierCallback} modifier 
	 */
	constructor(name, modifier) {
		this.#name = name;
		this.#modifier = modifier;
	}
	/** @type {string} */
	#name;
	/**
	 * @readonly
	 * @returns {string}
	 */
	get name() {
		return this.#name;
	}
	/** @type {ModifierCallback} */
	#modifier;
	/**
	 * @param {Texture} texture 
	 * @returns {void}
	 */
	apply(texture) {
		this.#modifier.call(this, texture);
	}
}
//#endregion
//#region Filters
Filter.define(`Grayscale`, texture => texture.grayscale());

Filter.define(`Red emphasis `, texture => texture.redEmphasis());

Filter.define(`Green emphasis `, texture => texture.greenEmphasis());

Filter.define(`Blue emphasis `, texture => texture.blueEmphasis());

Filter.define(`Sepia`, texture => texture.sepia());

Filter.define(`Red`, texture => texture.forEach((pixel) => {
	pixel.green = 0;
	pixel.blue = 0;
}));

Filter.define(`Green`, (texture) => texture.forEach((pixel) => {
	pixel.red = 0;
	pixel.blue = 0;
}));

Filter.define(`Blue`, (texture) => texture.forEach((pixel) => {
	pixel.red = 0;
	pixel.green = 0;
}));

Filter.define(`Redless`, (texture) => texture.forEach((pixel) => {
	pixel.red = 0;
}));

Filter.define(`Greenless`, (texture) => texture.forEach((pixel) => {
	pixel.green = 0;
}));

Filter.define(`Blueless`, (texture) => texture.forEach((pixel) => {
	pixel.blue = 0;
}));

Filter.define(`Invert`, texture => texture.invert());
//#endregion

export { Filter };
