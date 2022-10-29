import fs from 'node:fs';
import sizeOf from 'image-size'
import { createCanvas, loadImage } from 'canvas';
import sanitizer from './sanitizer';

const formats = require('../formats');

const isForked = Boolean(process.send);

const processMessage = (cb: Function, message: WatermarkOutputResult | WatermarkErrorResult) => {
	if(process.send)
	{
		process.send(message);
		process.exit();
	}
	else
		cb(message);
};

const watermarker = (config: WatermarkConfig) => {
	const { input, output, watermark, position, margin, size, opacity, blender, callback } = sanitizer(config);

	return new Promise(async resolve => {
		const cb = (message: any) => {
			if(callback)
				callback(message);
			resolve(message);
		};

		try{
			let format = input.split('.').pop();
			const mimeType = format ? formats[format] : null;

			if(!mimeType)
			{
				processMessage(cb, {
					error: "invalid input format"
				});
				return;
			}

			if(!watermark)
			{
				processMessage(cb, {
					status: "nochange",
					output: input
				});
				return;
			}


			let ratio, width: number, height: number, watermarkWidth = 0, watermarkHeight = 0, watermarkX = 0, watermarkY = 0;
			/* Get base size */
			try {
				const dimensions = await sizeOf(input);
				width = dimensions.width ?? 0;
				height = dimensions.height ?? 0;
			}
			catch{
				processMessage(cb, {
					error: "error while reading input"
				});
				return;
			}

			/* Get watermark image info */
			try {
				const watermarkDimensions = await sizeOf(watermark);
				watermarkWidth = watermarkDimensions.width ?? 0;
				watermarkHeight = watermarkDimensions.height ?? 0;
			}
			catch{
				processMessage(cb, {
					error: "error while reading watermark"
				});
				return;
			}

			const minorSide = width > height ? height : width;

			/* Size */
			if(watermarkWidth >= watermarkHeight)
			{
				const oldWidth = watermarkWidth;
				watermarkWidth = minorSide * size;
				ratio = watermarkWidth/oldWidth;
				watermarkHeight *= ratio;
			}
			else
			{
				const oldHeight = watermarkHeight;
				watermarkHeight = minorSide * size;
				ratio = watermarkHeight/oldHeight;
				watermarkWidth *= ratio;
			}

			/* Position (+ margin) */
			const marginX = Math.round(margin.x * minorSide);
			const marginY = Math.round(margin.y * minorSide);
			const dots = 3;

			const converter = (select: number, pixels: number) => (select-1) * (pixels / (dots-1));
			watermarkX = converter(position.x, width) - converter(position.x, watermarkWidth) + ((dots-1 - position.x) * marginX);
			watermarkY = converter(position.y, height) - converter(position.y, watermarkHeight) + ((dots-1 - position.y) * marginY);


			/* Validate sizes */
			if(isNaN(width) || isNaN(height) || width < 1 || height < 1)
			{
				processMessage(cb, {
					error: "invalid width / height"
				});
				return;
			}

			/* Load images */
			let image, watermarkImage;
			try{
				image = await loadImage(input);
				watermarkImage = await loadImage(watermark);
			}
			catch(e)
			{
				processMessage(cb, {
					error: "error while loading images"
				});
				return;
			}

			/* Create cavnas and begin watermark job */
			const canvas = createCanvas(width, height);
			const ctx = canvas.getContext("2d");

			ctx.drawImage(image, 0, 0, width, height); /* draw main image */

			ctx.globalAlpha = opacity;

			if(blender)
				ctx.globalCompositeOperation = blender;

			ctx.drawImage( /* draw watermark image */
				watermarkImage,
				Math.floor(watermarkX),
				Math.floor(watermarkY),
				Math.floor(watermarkWidth),
				Math.floor(watermarkHeight)
			);

			const outputBuffer: Buffer = canvas.toBuffer(mimeType);

			const done = () => {
				processMessage(cb, {
					status: "ok",
					output
				});
			};

			fs.writeFile(output, outputBuffer, (err) => {
				if (err) 
				{
					processMessage(cb, {
						error: "error while saving"
					});
					return;
				}
				done();
			});
		}
		catch(mainError)
		{
			console.log(mainError);
			processMessage(cb, {
				error: "error in watermark"
			});
		}
	});
};

if(isForked)
	process.on('message', watermarker);
else
	module.exports = watermarker;
