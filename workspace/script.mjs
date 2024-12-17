"use strict";

import { DataPair } from "../scripts/core/extensions.mjs";
/** @typedef {import("../scripts/dom/storage.mjs").DatabaseStore} DatabaseStore */

import { } from "../scripts/dom/extensions.mjs";
import { Database } from "../scripts/dom/storage.mjs";
import { Filter } from "../scripts/structure.mjs";

//#region Alert severity
/**
 * @enum {number}
 */
const AlertSeverity = {
	/**
	 * Ignore the response, taking no action.
	 * @readonly
	 */
	ignore: 0,
	/**
	 * Log the response for informational purposes.
	 * @readonly
	 */
	log: 1,
	/**
	 * Throw an error in response to a critical event.
	 * @readonly
	 */
	throw: 2,
};
Object.freeze(AlertSeverity);
//#endregion
//#region Controller
/**
 * Represents the controller for the application.
 */
class Controller {
	//#region Internal
	/** @type {boolean} */
	static #locked = true;
	/**
	 * Starts the main application flow.
	 * @returns {Promise<void>}
	 */
	static async build() {
		Controller.#locked = false;
		const self = new Controller();
		Controller.#locked = true;

		try {
			await self.#main();
		} catch (reason) {
			await self.#catch(Error.from(reason));
		}
	}
	constructor() {
		if (Controller.#locked) throw new TypeError(`Illegal constructor`);
	}
	/** @type {AlertSeverity} */
	#severity = AlertSeverity.throw;
	/**
	 * @param {Error} error 
	 * @returns {Promise<void>}
	 */
	async #catch(error) {
		switch (this.#severity) {
			case AlertSeverity.ignore: break;
			case AlertSeverity.log: {
				console.error(error);
			} break;
			case AlertSeverity.throw: {
				await window.alertAsync(error);
				location.reload();
			} break;
		}
	}
	//#endregion
	//#region Implementation
	//#region Model
	/**
	 * @returns {Promise<void>}
	 */
	async #buildModel() {
		const urlEffectsApplicator = new URL(`./workers/effects-applicator.mjs`, location.href);
		const workerEffectsApplicator = this.#workerEffectsApplicator = new Worker(urlEffectsApplicator, { type: `module` });

		const storeUploadHistory = this.#storeUploadHistory = await Database.Store.open(navigator.dataPath, `Upload history`);
	}
	/** @type {Worker} */
	#workerEffectsApplicator;
	/**
	 * @param {ImageData} data 
	 * @param {string} name 
	 * @returns {Promise<ImageData>}
	 */
	async #queryFilterEffect(data, name) {
		const workerEffectsApplicator = this.#workerEffectsApplicator;
		const dataResult = await Promise.withSignal((signal, resolve, reject) => {
			workerEffectsApplicator.addEventListener(`message`, event => resolve(event.data), { signal });
			workerEffectsApplicator.addEventListener(`messageerror`, event => reject(event.data), { signal });
			workerEffectsApplicator.addEventListener(`error`, event => reject(event.error ?? event.message), { signal });
			workerEffectsApplicator.postMessage([data, name]);
		});
		if (!(dataResult instanceof ImageData)) throw new TypeError(`The data ${dataResult} must be a ImageData`);
		return dataResult;
	}
	/** @type {DatabaseStore} */
	#storeUploadHistory;
	/**
	 * @returns {Promise<ImageData?>}
	 */
	async #loadLastUpload() {
		const storeUploadHistory = this.#storeUploadHistory;
		const [data] = await storeUploadHistory.select(0);
		if (data instanceof ImageData) return data;
		await storeUploadHistory.remove(0);
		return null;
	}
	/**
	 * @param {ImageData?} data 
	 * @returns {Promise<void>}
	 */
	async #saveLastUpload(data) {
		const storeUploadHistory = this.#storeUploadHistory;
		if (data === null) return await storeUploadHistory.remove(0);
		await storeUploadHistory.update(new DataPair(0, data));
	}
	//#endregion
	//#region View
	/**
	 * @returns {Promise<void>}
	 */
	async #buildView() {
		const inputToggleMenu = this.#inputToggleMenu = document.getElement(HTMLInputElement, `input#toggle-menu`);

		const inputUploadImage = this.#inputUploadImage = document.getElement(HTMLInputElement, `input#upload-image`);
		const buttonDownloadImage = this.#buttonDownloadImage = document.getElement(HTMLButtonElement, `button#download-image`);

		const canvas = document.getElement(HTMLCanvasElement, `canvas#preview`);
		const context = this.#context = Object.suppress(canvas.getContext(`2d`, { willReadFrequently: true }), `context`);

		const footer = this.#footer = document.getElement(HTMLElement, `footer`);
		const canvasTemporary = document.createElement(`canvas`);
		const contextTemporary = this.#contextTemporary = Object.suppress(canvasTemporary.getContext(`2d`, { willReadFrequently: true }), `temporary context`);

	}
	/** @type {HTMLInputElement} */
	#inputToggleMenu;
	/** @type {HTMLInputElement} */
	#inputUploadImage;
	/** @type {HTMLButtonElement} */
	#buttonDownloadImage;
	/** @type {CanvasRenderingContext2D} */
	#context;
	/** @type {AbortController} */
	#loadConroller = new AbortController();
	/**
	 * @param {ImageData} data 
	 * @returns {Promise<void>}
	 */
	async #applyImageData(data) {
		this.#loadConroller.abort();

		const context = this.#context;
		const canvas = context.canvas;

		const { width, height } = data;
		canvas.width = width;
		canvas.height = height;
		context.putImageData(data, 0, 0);

		const controller = this.#loadConroller = new AbortController();
		await this.#rebuildFilters(data, controller.signal);
	}
	/**
	 * @returns {Promise<void>}
	 */
	async #dataLoadAndApply() {
		const dataPrevious = await this.#loadLastUpload();
		if (dataPrevious === null) return;
		await this.#applyImageData(dataPrevious);
	}
	/**
	 * @param {ImageData} data 
	 * @returns {Promise<void>}
	 */
	async #dataApplyAndSave(data) {
		await this.#applyImageData(data);
		await this.#saveLastUpload(data);
	}
	/** @type {HTMLElement} */
	#footer;
	/** @type {CanvasRenderingContext2D} */
	#contextTemporary;
	/**
	 * @param {ImageData} data 
	 * @param {string} name 
	 * @returns {Promise<void>}
	 */
	async #addFilterButton(data, name) {
		const footer = this.#footer;
		const promiseDataApplied = this.#queryFilterEffect(data, name);
		const contextTemporary = this.#contextTemporary;
		const canvasTemporary = contextTemporary.canvas;

		const buttonFilter = footer.appendChild(document.createElement(`button`));
		buttonFilter.type = `button`;
		buttonFilter.classList.add(`filter`);
		promiseDataApplied.then((dataApplied) => {
			buttonFilter.title = name;
			buttonFilter.addEventListener(`click`, event => this.#applyImageData(dataApplied));
		});

		const image = buttonFilter.appendChild(document.createElement(`img`));
		promiseDataApplied.then((dataApplied) => {
			image.alt = `${name} preview`;
			const { width, height } = dataApplied;
			canvasTemporary.width = width;
			canvasTemporary.height = height;
			contextTemporary.putImageData(dataApplied, 0, 0);
			image.src = canvasTemporary.toDataURL(`image/png`);
		});

		await promiseDataApplied;
	}
	/**
	 * @param {ImageData} data 
	 * @param {AbortSignal} signal 
	 * @returns {Promise<void>}
	 */
	async #rebuildFilters(data, signal) {
		const footer = this.#footer;

		footer.replaceChildren();
		for (const name of Filter.definitions) {
			if (signal.aborted) break;
			await this.#addFilterButton(data, name);
		}
	}
	/**
	 * @param {File} file 
	 * @returns {Promise<ImageData>}
	 */
	async #readDataFrom(file) {
		const contextTemporary = this.#contextTemporary;
		const canvasTemporary = contextTemporary.canvas;

		const image = document.createElement(`img`);
		await Promise.withSignal((signal, resolve, reject) => {
			image.addEventListener(`load`, event => resolve(null), { signal });
			image.addEventListener(`error`, event => reject(event.error ?? event.message), { signal });
			image.src = URL.createObjectURL(file);
		});
		URL.revokeObjectURL(image.src);
		const { width, height } = image;
		canvasTemporary.width = width;
		canvasTemporary.height = height;
		contextTemporary.drawImage(image, 0, 0);
		return contextTemporary.getImageData(0, 0, width, height);
	}
	/** @type {string?} */
	#fileName = null;
	/**
	 * @returns {Promise<void>}
	 */
	async #runViewInitialization() {
		const inputUploadImage = this.#inputUploadImage;
		const buttonDownloadImage = this.#buttonDownloadImage;
		const canvas = this.#context.canvas;

		await this.#dataLoadAndApply();

		inputUploadImage.addEventListener(`input`, async (event) => {
			try {
				const files = Object.suppress(inputUploadImage.files, `files list`);
				const file = files.item(0);
				if (file === null) return;
				const data = await this.#readDataFrom(file);
				await this.#dataApplyAndSave(data);
				this.#fileName = file.name;
			} catch (reason) {
				await this.#catch(Error.from(reason));
			} finally {
				inputUploadImage.value = String.empty;
			}
		});

		buttonDownloadImage.addEventListener(`click`, (event) => {
			try {
				const name = `${this.#fileName ?? Date.now()}.png`;
				const type = `image/png`;
				canvas.toBlob((blob) => {
					if (blob === null) throw new Error(`Blob mustn't be null`);
					const file = new File([blob], name.trim(), { type });
					navigator.download(file);
				}, type);
			} catch (reason) {
				this.#catch(Error.from(reason));
			}
		});
	}
	/**
	 * @returns {Promise<void>}
	 */
	async #runViewKeybindings() {
		const inputToggleMenu = this.#inputToggleMenu;
		const inputUploadImage = this.#inputUploadImage;
		const buttonDownloadImage = this.#buttonDownloadImage;

		window.addEventListener(`keydown`, (event) => {
			if (event.key !== `Tab`) return;
			event.preventDefault();
			inputToggleMenu.click();
		});

		window.addEventListener(`keydown`, (event) => {
			if (!event.altKey || event.code !== `KeyO`) return;
			event.preventDefault();
			inputUploadImage.click();
		});

		window.addEventListener(`keydown`, (event) => {
			if (!event.altKey || event.code !== `KeyS`) return;
			event.preventDefault();
			buttonDownloadImage.click();
		});
	}
	//#endregion

	/**
	 * @returns {Promise<void>}
	 */
	async #main() {
		await this.#buildModel();

		await this.#buildView();
		await this.#runViewInitialization();
		await this.#runViewKeybindings();
	}
	//#endregion
}
//#endregion

Controller.build();
