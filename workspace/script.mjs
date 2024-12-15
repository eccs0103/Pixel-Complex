"use strict";

import { } from "../scripts/structure.mjs";

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
	/**
	 * @returns {Promise<void>}
	 */
	async #main() {
		// Your run logic goes here
	}
	//#endregion
}
//#endregion

Controller.build();



class MyWorkspaceElement extends HTMLCanvasElement {
	/**
	 * @param {ModifierCallback} modifier 
	 */
	transform(modifier) {
		const context = this.getContext(`2d`, { willReadFrequently: true });
		if (!context) {
			throw new ReferenceError(`Element 'context' isn't defined.`);
		}
		const imageData = context.getImageData(0, 0, this.width, this.height);
		modifier(imageData, (progress) => { });
		context.putImageData(imageData, 0, 0);
	}
}
customElements.define(`my-workspace`, MyWorkspaceElement, { extends: `canvas` });

const inputToggleMenu = (/** @type {HTMLInputElement} */ (document.querySelector(`input#toggle-menu`)));
const inputUploadImage = (/** @type {HTMLInputElement} */ (document.querySelector(`input#upload-image`)));
const buttonDownloadImage = (/** @type {HTMLButtonElement} */ (document.querySelector(`button#download-image`)));
const canvas = (/** @type {MyWorkspaceElement} */ (document.querySelector(`canvas#preview`)));
const context = (() => {
	const context = canvas.getContext(`2d`, { willReadFrequently: true });
	if (!context) {
		throw new ReferenceError(`Element 'context' isn't defined.`);
	}
	return context;
})();
const footer = (/** @type {HTMLElement} */ (document.querySelector(`footer`)));

inputUploadImage.addEventListener(`input`, (event) => {
	const files = inputUploadImage.files;
	if (!files) {
		throw new ReferenceError(`Uploaded files list can't be empty.`);
	}
	const file = files[0];
	const reader = new FileReader();
	reader.addEventListener(`load`, (event) => {
		const image = new Image();
		image.src = String(reader.result);
		image.addEventListener(`load`, async (event) => {
			canvas.width = image.width;
			canvas.height = image.height;
			context.drawImage(image, 0, 0);
			await refresh();
		}, { once: true });
	}, { once: true });
	reader.readAsDataURL(file);
	inputToggleMenu.disabled = false;
	buttonDownloadImage.disabled = false;
});

buttonDownloadImage.addEventListener(`click`, (event) => {
	canvas.toBlob((blob) => {
		if (!blob) {
			throw new ReferenceError(`Element 'blob' isn't defined.`);
		}
		Application.download(new File([blob], `${Date.now()}.png`))
	})
});

async function refresh() {
	const canvasTemp = (/** @type {MyWorkspaceElement} */ (document.createElement(`canvas`, { is: `my-workspace` })));
	canvasTemp.width = canvas.width;
	canvasTemp.height = canvas.height;
	const contextTemp = (() => {
		const context = canvasTemp.getContext(`2d`, { willReadFrequently: true });
		if (!context) {
			throw new ReferenceError(`Element 'context' isn't defined.`);
		}
		return context;
	})();;
	footer.replaceChildren(``);
	for await (const filter of Object.values(Filters)) {
		contextTemp.putImageData(context.getImageData(0, 0, canvas.width, canvas.height), 0, 0);
		canvasTemp.transform(filter.modifier);
		const buttonFilter = footer.appendChild(document.createElement(`button`));
		buttonFilter.title = filter.name;
		buttonFilter.addEventListener(`click`, (event) => {
			canvas.transform(filter.modifier);
			refresh();
		});
		{
			const image = document.createElement(`img`);
			image.src = canvasTemp.toDataURL();
			image.style.maxWidth = `revert`;
			image.addEventListener(`load`, (event) => {
				buttonFilter.appendChild(image);
			}, { once: true });
		}
	}
}