export type Shape = {
	id: string;
	shape: number;
	width: number;
	height: number;
	xAxis: number;
	yAxis: number;
	rotationDegree: number;
};

export type Bounds = {
	minLeft: null | number;
	maxLeft: null | number;
	minTop: null | number;
	maxTop: null | number;
	minRight: null | number;
	maxRight: null | number;
	minBottom: null | number;
	maxBottom: null | number;
};

export type MousePoistion = {
	mouseX: number;
	mouseY: number;
	left: number;
	right: number;
	top: number;
	bottom: number;
};

export type NewObject = {
	objectShape: number;
	objectWidth: number;
	objectHeight: number;
};
