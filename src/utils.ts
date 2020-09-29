export const SHAPE_SHAPE_RECTANGLE = 0;
export const SHAPE_SHAPE_CIRCLE = 1;

// Shape Min width 20 px
export const SHAPE_MIN_WIDTH = 20;
// Shape Min height 10 px
export const SHAPE_MIN_HEIGHT = 20;
// Shape Max width 1020 px
export const SHAPE_MAX_WIDTH = 1020;
// Shape Max height 600px
export const SHAPE_MAX_HEIGHT = 600;

export function uuid() {
	const chars = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'];
	return [...Array(15)].map(() => chars[~~(Math.random() * chars.length) | 0]).join('');
}

export function computeWidth(cnavasWidth: number, left: number, right: number) {
	return cnavasWidth - left - right;
}

export function computeHeight(canvasHeight: number, top: number, bottom: number) {
	return canvasHeight - top - bottom;
}

export function restrictToBounds(value: number, min: null | number, max: null | number) {
	if (min !== null && value < min) {
		return min;
	}

	if (max !== null && max < value) {
		return max;
	}

	return value;
}

export function snapToGrid(grid: number[], pendingX: number, pendingY: number, scale = 1) {
	const x = Math.round(pendingX / scale / grid[0]) * grid[0];
	const y = Math.round(pendingY / scale / grid[1]) * grid[1];

	return [x, y];
}
