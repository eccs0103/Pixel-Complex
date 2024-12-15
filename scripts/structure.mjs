"use strict";

import { } from "./core/extensions.mjs";
import { } from "./core/generators.mjs";
import { } from "./core/measures.mjs";
import { } from "./core/palette.mjs";

import { } from "./workers/extensions.mjs";
import { } from "./workers/generators.mjs";
import { } from "./workers/measures.mjs";

import { } from "./dom/extensions.mjs";
import { } from "./dom/generators.mjs";
import { } from "./dom/palette.mjs";
import { } from "./dom/storage.mjs";

/**
 * @callback ModifierCallback
 * @param {ImageData} image
 * @param {(progress: Number) => void} callback
 */

class Filter {
	/**
	 * @param {String} name 
	 * @param {ModifierCallback} modifier 
	 */
	constructor(name, modifier) {
		this.#name = name;
		this.#modifier = modifier;
	}
	/** @type {String} */ #name;
	/** @readonly */ get name() {
		return this.#name;
	}
	/** @type {ModifierCallback} */ #modifier;
	/** @readonly */ get modifier() {
		return this.#modifier;
	}
}

/** @enum {Filter} */ const Filters = {
	//#region Grayscale
	/** @readonly */
	grayscale: new Filter(`Grayscale`, (image, callback) => {
		const total = image.width * image.height;
		for (let y = 0; y < image.height; y++) {
			for (let x = 0; x < image.width; x++) {
				const index = y * image.width + x;
				const pixel = Color.viaRGB(image.data[index * 4], image.data[index * 4 + 1], image.data[index * 4 + 2], image.data[index * 4 + 3] / 255);
				pixel.set(pixel.grayscale(1));
				[image.data[index * 4], image.data[index * 4 + 1], image.data[index * 4 + 2], image.data[index * 4 + 3]] = [pixel.red, pixel.green, pixel.blue, pixel.alpha * 255];
				callback(index / total);
			}
		}
	}),
	//#endregion
	//#region Sepia
	/** @readonly */
	sepia: new Filter(`Sepia`, (image, callback) => {
		const total = image.width * image.height;
		for (let y = 0; y < image.height; y++) {
			for (let x = 0; x < image.width; x++) {
				const index = y * image.width + x;
				const pixel = Color.viaRGB(image.data[index * 4], image.data[index * 4 + 1], image.data[index * 4 + 2], image.data[index * 4 + 3] / 255);
				pixel.set(pixel.sepia(1));
				[image.data[index * 4], image.data[index * 4 + 1], image.data[index * 4 + 2], image.data[index * 4 + 3]] = [pixel.red, pixel.green, pixel.blue, pixel.alpha * 255];
				callback(index / total);
			}
		}
	}),
	//#endregion
		//#region Red
	/** @readonly */
	redl: new Filter(`Red`, (image, callback) => {
		const total = image.width * image.height;
		for (let y = 0; y < image.height; y++) {
			for (let x = 0; x < image.width; x++) {
				const index = y * image.width + x;
				const pixel = Color.viaRGB(image.data[index * 4], image.data[index * 4 + 1], image.data[index * 4 + 2], image.data[index * 4 + 3] / 255);
				pixel.green = 0;
				pixel.blue = 0;
				[image.data[index * 4], image.data[index * 4 + 1], image.data[index * 4 + 2], image.data[index * 4 + 3]] = [pixel.red, pixel.green, pixel.blue, pixel.alpha * 255];
				callback(index / total);
			}
		}
	}),
	//#endregion
	//#region Green
	/** @readonly */
	green: new Filter(`Green`, (image, callback) => {
		const total = image.width * image.height;
		for (let y = 0; y < image.height; y++) {
			for (let x = 0; x < image.width; x++) {
				const index = y * image.width + x;
				const pixel = Color.viaRGB(image.data[index * 4], image.data[index * 4 + 1], image.data[index * 4 + 2], image.data[index * 4 + 3] / 255);
				pixel.red = 0;
				pixel.blue = 0;
				[image.data[index * 4], image.data[index * 4 + 1], image.data[index * 4 + 2], image.data[index * 4 + 3]] = [pixel.red, pixel.green, pixel.blue, pixel.alpha * 255];
				callback(index / total);
			}
		}
	}),
	//#endregion
	//#region Blue
	/** @readonly */
	blue: new Filter(`Blue`, (image, callback) => {
		const total = image.width * image.height;
		for (let y = 0; y < image.height; y++) {
			for (let x = 0; x < image.width; x++) {
				const index = y * image.width + x;
				const pixel = Color.viaRGB(image.data[index * 4], image.data[index * 4 + 1], image.data[index * 4 + 2], image.data[index * 4 + 3] / 255);
				pixel.red = 0;
				pixel.green = 0;
				[image.data[index * 4], image.data[index * 4 + 1], image.data[index * 4 + 2], image.data[index * 4 + 3]] = [pixel.red, pixel.green, pixel.blue, pixel.alpha * 255];
				callback(index / total);
			}
		}
	}),
	//#endregion
	//#region Redless
	/** @readonly */
	redless: new Filter(`Redless`, (image, callback) => {
		const total = image.width * image.height;
		for (let y = 0; y < image.height; y++) {
			for (let x = 0; x < image.width; x++) {
				const index = y * image.width + x;
				const pixel = Color.viaRGB(image.data[index * 4], image.data[index * 4 + 1], image.data[index * 4 + 2], image.data[index * 4 + 3] / 255);
				pixel.red = 0;
				[image.data[index * 4], image.data[index * 4 + 1], image.data[index * 4 + 2], image.data[index * 4 + 3]] = [pixel.red, pixel.green, pixel.blue, pixel.alpha * 255];
				callback(index / total);
			}
		}
	}),
	//#endregion
	//#region Greenless
	/** @readonly */
	greenless: new Filter(`Greenless`, (image, callback) => {
		const total = image.width * image.height;
		for (let y = 0; y < image.height; y++) {
			for (let x = 0; x < image.width; x++) {
				const index = y * image.width + x;
				const pixel = Color.viaRGB(image.data[index * 4], image.data[index * 4 + 1], image.data[index * 4 + 2], image.data[index * 4 + 3] / 255);
				pixel.green = 0;
				[image.data[index * 4], image.data[index * 4 + 1], image.data[index * 4 + 2], image.data[index * 4 + 3]] = [pixel.red, pixel.green, pixel.blue, pixel.alpha * 255];
				callback(index / total);
			}
		}
	}),
	//#endregion
	//#region Blueless
	/** @readonly */
	blueless: new Filter(`Blueless`, (image, callback) => {
		const total = image.width * image.height;
		for (let y = 0; y < image.height; y++) {
			for (let x = 0; x < image.width; x++) {
				const index = y * image.width + x;
				const pixel = Color.viaRGB(image.data[index * 4], image.data[index * 4 + 1], image.data[index * 4 + 2], image.data[index * 4 + 3] / 255);
				pixel.blue = 0;
				[image.data[index * 4], image.data[index * 4 + 1], image.data[index * 4 + 2], image.data[index * 4 + 3]] = [pixel.red, pixel.green, pixel.blue, pixel.alpha * 255];
				callback(index / total);
			}
		}
	}),
	//#endregion
	//#region Invert
	/** @readonly */
	invert: new Filter(`Invert`, (image, callback) => {
		const total = image.width * image.height;
		for (let y = 0; y < image.height; y++) {
			for (let x = 0; x < image.width; x++) {
				const index = y * image.width + x;
				const pixel = Color.viaRGB(image.data[index * 4], image.data[index * 4 + 1], image.data[index * 4 + 2], image.data[index * 4 + 3] / 255);
				pixel.set(pixel.invert(1));
				[image.data[index * 4], image.data[index * 4 + 1], image.data[index * 4 + 2], image.data[index * 4 + 3]] = [pixel.red, pixel.green, pixel.blue, pixel.alpha * 255];
				callback(index / total);
			}
		}
	}),
	//#endregion
};

export { };
