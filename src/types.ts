export type Object = {
    id: string;
    name: string;
    type: number;
    shape: number;
    width: number;
    height: number;
    x_axis: number;
    y_axis: number;
    rotation_degree: number;
}

export type Bounds = {
    minLeft: null | number;
    maxLeft: null | number;
    minTop: null | number;
    maxTop: null | number;
    minRight: null | number;
    maxRight: null | number;
    minBottom: null | number;
    maxBottom: null | number;
}

export type MousePoistion = {
    mouseX: number;
    mouseY: number;
    left: number;
    right: number;
    top: number;
    bottom: number;
}
