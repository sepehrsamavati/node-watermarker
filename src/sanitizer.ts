export default (config: WatermarkConfig) => {

	const sanitizedConfig: SanitizedWatermarkConfig = {
		input: config.input,
		watermark: config.watermark,
		size: config.size ?? 50,
		opacity: config.opacity ?? 50,
		output: config.output ?? config.input,
		margin: config.margin ?? { x: 5, y: 5 },
		position: config.position ?? { x: 2, y: 2 },
		blender: config.blender,
		callback: config.callback
	};

	sanitizedConfig.size /= 100;
	sanitizedConfig.opacity /= 100;

	sanitizedConfig.margin.x /= 100;
	sanitizedConfig.margin.y /= 100;

	return sanitizedConfig;
};