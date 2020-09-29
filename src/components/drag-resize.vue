<template>
	<div
		:key="object.id"
		class="draggable"
		:class="{
			active: selectedObjectId === object.id,
		}"
		:id="object.id"
		@mousedown.stop.prevent="selectObject(object.id)"
	>
		<div class="drag_content" :id="object.id + 'drag_content'">
			{{ object.name }}
		</div>
		<div
			v-show="selectedObjectId === object.id"
			class="object_resizer object_resizer_top"
			:id="object.id + 'object_resizer_top'"
			@mousedown.stop.prevent="selectResizeDirection('top')"
		></div>
		<div
			v-show="selectedObjectId === object.id"
			class="object_resizer object_resizer_right"
			:id="object.id + 'object_resizer_right'"
			@mousedown.stop.prevent="selectResizeDirection('right')"
		></div>
		<div
			v-show="selectedObjectId === object.id"
			class="object_resizer object_resizer_bottom"
			:id="object.id + 'object_resizer_bottom'"
			@mousedown.stop.prevent="selectResizeDirection('bottom')"
		></div>
		<div
			v-show="selectedObjectId === object.id"
			class="object_resizer object_resizer_left"
			:id="object.id + 'object_resizer_left'"
			@mousedown.stop.prevent="selectResizeDirection('left')"
		></div>
		<!-- <span v-show="selectedObjectId === object.id" class="object_rotate_handler"
			><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<path
					d="M12 0c-3.31 0-6.291 1.353-8.459 3.522l-2.48-2.48-1.061 7.341 7.437-.966-2.489-2.488c1.808-1.808 4.299-2.929 7.052-2.929 5.514 0 10 4.486 10 10s-4.486 10-10 10c-3.872 0-7.229-2.216-8.89-5.443l-1.717 1.046c2.012 3.803 6.005 6.397 10.607 6.397 6.627 0 12-5.373 12-12s-5.373-12-12-12z"
				/></svg
		></span> -->
	</div>
</template>
<script lang="ts">
import { defineComponent, reactive, ref, onMounted } from 'vue';
import { Bounds, MousePoistion } from '@/types';
import { computeWidth, computeHeight, restrictToBounds, snapToGrid } from '@/utils';

export default defineComponent({
	name: 'drag-resize',
	props: ['object', 'selectedObjectId'],
	setup(props, context) {
		const state = reactive({
			minWidth: 10,
			maxWidth: 0,
			minHeight: 10,
			maxHeight: 0,
			cnavasWidth: 1020,
			canvasHeight: 650,
			width: 0,
			height: 0,
			mouseClickPosition: {},
			grid: [1, 1],
			left: 0,
			top: 0,
			bottom: 0,
			right: 0,
			scale: 1,
		});

		const element = ref<null | HTMLElement>(null);
		const resizeDirection = ref<null | string>(null);
		let mouseClickPosition = reactive<MousePoistion>({
			mouseX: 0,
			mouseY: 0,
			left: 0,
			right: 0,
			top: 0,
			bottom: 0,
		});

		let bounds = reactive<Bounds>({
			minLeft: null,
			maxLeft: null,
			minTop: null,
			maxTop: null,
			minRight: null,
			maxRight: null,
			minBottom: null,
			maxBottom: null,
		});

		function draw() {
			element.value = document.getElementById(props.object.id);

			if (!element.value) {
				return false;
			}

			element.value.style.top = props.object.xAxis + 'px';
			element.value.style.left = props.object.yAxis + 'px';

			element.value.style.width = props.object.width + 'px';
			element.value.style.height = props.object.height + 'px';
			element.value.style.transform = 'rotate(' + props.object.rotationDegree + 'deg)';
			if (props.object.shape === 1) {
				element.value.style.borderRadius = '50%';
			} else {
				element.value.style.borderRadius = '1px';
			}

			// eslint-disable-next-line @typescript-eslint/no-use-before-define
			setResizerPosition();

			// eslint-disable-next-line @typescript-eslint/no-use-before-define
			makeDraggableDiv(props.object.id);
			const resizers = document.querySelectorAll('.object_resizer');
			if (resizers) {
				for (const resize of resizers) {
					// eslint-disable-next-line @typescript-eslint/no-use-before-define
					makeResizableDiv(resize);
				}
			}

			// eslint-disable-next-line @typescript-eslint/no-use-before-define
			makeRotatableDiv();
		}

		onMounted(() => {
			draw();

			state.width = props.object.width;
			state.height = props.object.height;
			state.top = props.object.yAxis;
			state.left = props.object.xAxis;
			state.right = state.cnavasWidth - state.width - state.left;
			state.bottom = state.canvasHeight - state.height - state.top;
			mouseClickPosition = {
				mouseX: 0,
				mouseY: 0,
				left: 0,
				right: 0,
				top: 0,
				bottom: 0,
			};
		});

		function calcResizeLimits() {
			const minW = state.minWidth;
			const minH = state.minHeight;
			let maxH = state.maxHeight;
			let maxW = state.maxWidth;
			const [gridX, gridY] = state.grid;
			const width = props.object.width;
			const height = props.object.height;
			const left = props.object.xAxis;
			const top = props.object.yAxis;
			const right = state.right;
			const bottom = state.bottom;

			maxW = maxW - (maxW % gridX);
			maxH = maxH - (maxH % gridY);
			const limits: Bounds = {
				minLeft: null,
				maxLeft: null,
				minTop: null,
				maxTop: null,
				minRight: null,
				maxRight: null,
				minBottom: null,
				maxBottom: null,
			};
			limits.minLeft = left % gridX;
			limits.maxLeft = left + Math.floor((width - minW) / gridX) * gridX;
			limits.minTop = top % gridY;
			limits.maxTop = top + Math.floor((height - minH) / gridY) * gridY;
			limits.minRight = right % gridX;
			limits.maxRight = right + Math.floor((width - minW) / gridX) * gridX;
			limits.minBottom = bottom % gridY;
			limits.maxBottom = bottom + Math.floor((height - minH) / gridY) * gridY;
			if (maxW) {
				limits.minLeft = Math.max(limits.minLeft, state.cnavasWidth - right - maxW);
				limits.minRight = Math.max(limits.minRight, state.cnavasWidth - left - maxW);
			}
			if (maxH) {
				limits.minTop = Math.max(limits.minTop, state.canvasHeight - bottom - maxH);
				limits.minBottom = Math.max(limits.minBottom, state.canvasHeight - top - maxH);
			}

			return limits;
		}

		function setResizerPosition() {
			if (!element.value) {
				return;
			}

			const horizontalResizerPosition = Math.round(element.value.offsetWidth / 2) - 5;
			const topResizer = document.getElementById(props.object.id + 'object_resizer_top');
			const bottomResizer = document.getElementById(props.object.id + 'object_resizer_bottom');

			if (topResizer) {
				topResizer.style.left = horizontalResizerPosition + 'px';
			}
			if (bottomResizer) {
				bottomResizer.style.left = horizontalResizerPosition + 'px';
			}

			const verticalResizerPosition = Math.round(element.value.offsetHeight / 2) - 5;
			const leftResizer = document.getElementById(props.object.id + 'object_resizer_left');
			const rightResizer = document.getElementById(props.object.id + 'object_resizer_right');

			if (leftResizer) {
				leftResizer.style.top = verticalResizerPosition + 'px';
			}
			if (rightResizer) {
				rightResizer.style.top = verticalResizerPosition + 'px';
			}
		}

		function drag(event: MouseEvent) {
			if (props.object.id !== props.selectedObjectId || !element.value) {
				return;
			}

			// movementX & movementY is the difference in the X & Y coordinate of the mouse pointer between the current event and the previous mousemove event
			let left = event.movementX + element.value.offsetLeft;
			if (left < 0) {
				left = 0;
			}

			if (left + element.value.offsetWidth > 1020) {
				left = 1020 - element.value.offsetWidth;
			}

			let top = event.movementY + element.value.offsetTop;

			if (top < 0) {
				top = 0;
			}

			if (top + element.value.offsetHeight >= 650) {
				top = 650 - element.value.offsetHeight;
			}

			state.left = left;
			state.top = top;

			element.value.style.left = left + 'px';
			element.value.style.top = top + 'px';
			state.right = state.cnavasWidth - state.width - state.left;
			state.bottom = state.canvasHeight - state.height - state.top;
		}

		function stopDrag() {
			// updateObject();
			window.removeEventListener('mousemove', drag);
		}

		function resize(event: MouseEvent) {
			if (!element.value) {
				return;
			}

			let left = state.left;
			let top = state.top;
			let right = state.right;
			let bottom = state.bottom;
			const amouseClickPosition = mouseClickPosition;
			const tmpDeltaX = amouseClickPosition.mouseX - event.pageX;
			const tmpDeltaY = amouseClickPosition.mouseY - event.pageY;

			const [deltaX, deltaY] = snapToGrid(state.grid, tmpDeltaX, tmpDeltaY, state.scale);
			if (resizeDirection.value === 'bottom') {
				bottom = restrictToBounds(amouseClickPosition.bottom + deltaY, bounds.minBottom, bounds.maxBottom);
			} else if (resizeDirection.value === 'top') {
				top = restrictToBounds(amouseClickPosition.top - deltaY, bounds.minTop, bounds.maxTop);
			} else if (resizeDirection.value === 'right') {
				right = restrictToBounds(amouseClickPosition.right + deltaX, bounds.minRight, bounds.maxRight);
			} else if (resizeDirection.value === 'left') {
				left = restrictToBounds(amouseClickPosition.left - deltaX, bounds.minLeft, bounds.maxLeft);
			}

			const width = computeWidth(state.cnavasWidth, left, right);
			const height = computeHeight(state.canvasHeight, top, bottom);

			state.left = left;
			state.top = top;
			state.right = right;
			state.bottom = bottom;
			state.width = width;
			state.height = height;

			element.value.style.left = left + 'px';
			element.value.style.top = top + 'px';

			element.value.style.width = width + 'px';
			element.value.style.height = height + 'px';
			setResizerPosition();
		}

		function stopResize() {
			resizeDirection.value = null;
			// updateObject();
			window.removeEventListener('mousemove', resize);
		}

		function rotate(event: MouseEvent) {
			if (props.selectedObjectId !== props.object.id || !element.value) {
				return;
			}
			const arrowX = event.pageX || event.clientX + document.documentElement.scrollLeft;
			const arrowY = event.pageY || event.clientY + document.documentElement.scrollTop;
			const rect = element.value.getBoundingClientRect();

			const radian = Math.atan2(arrowY - rect.top - rect.height / 2, arrowX - rect.left - rect.width / 2);

			const degree = Math.round(radian * (180 / Math.PI)) + 40;

			const rotate = 'rotate(' + degree + 'deg)';

			// props.object.rotationDegree = degree;

			element.value.style.webkitTransform = rotate;
			element.value.style.webkitTransformOrigin = '50% 50%';
			element.value.style.transform = rotate;
			element.value.style.transformOrigin = '50% 50%';
		}

		function stopRotate() {
			// updateObject();
			window.removeEventListener('mousemove', rotate);
		}

		function makeDraggableDiv(id: string) {
			element.value = document.getElementById(id);
			if (!element.value) {
				return;
			}

			element.value.addEventListener('mousedown', (event: MouseEvent) => {
				event.stopPropagation();
				event.preventDefault();
				// if the mouse is somehow slipped out of the drag_element,
				// the element will still drag based on the mouse position
				mouseClickPosition.mouseX = event.pageX;
				mouseClickPosition.mouseY = event.pageY;
				mouseClickPosition.left = state.left;
				mouseClickPosition.right = state.right;
				mouseClickPosition.top = state.top;
				mouseClickPosition.bottom = state.bottom;
				bounds = calcResizeLimits();
				window.addEventListener('mousemove', drag);
				window.addEventListener('mouseup', stopDrag);
			});
		}

		function makeResizableDiv(element: Element) {
			element.addEventListener('mousedown', (event) => {
				event.stopPropagation();
				event.preventDefault();

				// mouseClickPosition.mouseX = event.pageX;
				// mouseClickPosition.mouseY = event.pageY;
				mouseClickPosition.left = state.left;
				mouseClickPosition.right = state.right;
				mouseClickPosition.top = state.top;
				mouseClickPosition.bottom = state.bottom;
				bounds = calcResizeLimits();
				// if the mouse is somehow slipped out of the drag_element,
				// the element will still drag based on the mouse position
				window.addEventListener('mousemove', resize);
				window.addEventListener('mouseup', stopResize);
			});
		}

		function makeRotatableDiv() {
			const element = document.getElementById('object_rotate_handler');
			if (!element) {
				return;
			}

			element.addEventListener('mousedown', (event) => {
				event.stopPropagation();
				event.preventDefault();
				// if the mouse is somehow slipped out of the drag_element,
				// the element will still drag based on the mouse position
				window.addEventListener('mousemove', rotate);
				window.addEventListener('mouseup', stopRotate);
			});
		}

		function selectObject(id: string) {
			context.emit('selectobject', id);
		}

		function selectResizeDirection(direction: string | null) {
			resizeDirection.value = direction;
		}

		// function updateObject() {
		//   if (!element.value) {
		//     return;
		//   }

		// props.object.xAxis = element.value.offsetLeft;
		// props.object.yAxis = element.value.offsetTop;
		// props.object.width = element.value.offsetWidth;
		// props.object.height = element.value.offsetHeight;
		// emit('update:object', props.object);
		// }

		return {
			draw,
			selectObject,
			selectResizeDirection,
			rotate,
		};
	},
});
</script>

<style scoped>
.draggable {
	box-sizing: border-box;
	height: 50px;
	width: 50px;
	padding: 5px;
	background-color: #2c3e50;
	border-radius: 1px;
	cursor: pointer;
	position: absolute;
	-webkit-touch-callout: none; /* iOS Safari */
	-webkit-user-select: none; /* Safari */
	-khtml-user-select: none; /* Konqueror HTML */
	-moz-user-select: none; /* Old versions of Firefox */
	-ms-user-select: none; /* Internet Explorer/Edge */
	user-select: none;
}

.obstruction {
	background-color: #a3a3a3;
	text-overflow: hidden;
}

.active {
	cursor: move;
	background-color: #0d93c9;
	border: 0.7px solid #0d93c9;
	z-index: 1;
}

.active.obstruction {
	background-color: #c4c4c4 !important;
	border: 0.7px solid #c4c4c4 !important;
}

.active .object_resizer {
	width: 7px;
	height: 7px;
	border-radius: 50%;
	background: white;
	border: 1px solid #0d93c9;
	position: absolute;
}

.active .object_resizer.obstruction {
	border: 1px solid #a8a6a6;
}

.object_resizer.object_resizer_left {
	left: -4px;
	cursor: ew-resize;
}
.object_resizer.object_resizer_top {
	top: -4px;
	cursor: ns-resize;
}
.object_resizer.object_resizer_right {
	right: -4px;
	cursor: ew-resize;
}
.object_resizer.object_resizer_bottom {
	bottom: -4px;
	cursor: ns-resize;
}
.drag_content {
	padding: 4px;
	box-sizing: border-box;
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	color: #fff;
}
.object_rotate_handler {
	cursor: move; /* fallback if grab cursor is unsupported */
	cursor: -moz-grab;
	cursor: -webkit-grab;
	position: absolute;
	top: -12px;
	right: -20px;
	z-index: 1;
	background: none;
}
</style>
