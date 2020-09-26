export const SHAPE_SHAPE_RECTANGLE = 0;
export const SHAPE_SHAPE_CIRCLE = 1;

// Shape Min width 10 px
export const SHAPE_MIN_WIDTH = 10;
// Shape Min height 10 px
export const SHAPE_MIN_HEIGHT = 10;
// Shape Max width 1020 px
export const SHAPE_MAX_WIDTH = 1020;
// Shape Max height 600px
export const SHAPE_MAX_HEIGHT = 600;

export function uuid() {
    const chars = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'];
    return [...Array(15)].map(() => chars[~~(Math.random() * chars.length) | 0]).join('');
}
