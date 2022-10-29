interface Axis {
    x: number;
    y: number;
}

interface WatermarkConfig {
	input: string;
	output?: string;
	watermark: string;
	position?: Axis;
	margin?: Axis;
	size?: number;
	opacity?: number;
	blender?: GlobalCompositeOperation;
	callback?: Function;
}

interface SanitizedWatermarkConfig {
	input: string;
	output: string;
	watermark: string;
	position: Axis;
	margin: Axis;
	size: number;
	opacity: number;
	blender?: GlobalCompositeOperation;
	callback?: Function;
}

interface WatermarkErrorResult {
	error: string;
}

interface WatermarkOutputResult {
	status: string;
	output: string;
}