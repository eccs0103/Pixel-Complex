"use strict";

import { Texture } from "../../scripts/dom/palette.mjs";
import { Filter } from "../../scripts/structure.mjs";

self.addEventListener(`message`, (event) => {
	if (!(event instanceof MessageEvent)) throw new TypeError(`The event ${event} must be a MessageEvent`);
	if (!(event.data instanceof Array)) throw new TypeError(`The event data ${event.data} must be a Array`);
	const [data, name] = event.data;
	if (!(data instanceof ImageData)) throw new TypeError(`The data ${data} must be a ImageData`);
	if (typeof (name) !== `string`) throw new TypeError(`The name ${name} must be a string`);
	const filter = Filter.find(name);
	const texture = Texture.fromImageData(data);
	filter.apply(texture);
	self.postMessage(Texture.toImageData(texture));
});
