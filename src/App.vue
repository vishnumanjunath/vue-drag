<template>
	<div id="app" @mousedown.self="deselectTable()">
		<div class="floor_paln_editor">
			<div class="parent_canvas" id="parent_canvas" @mousedown.self="deselectObject()">
				<drag-resize
					v-for="object in location_floor_plan.objects"
					:ref="object.id"
					:key="object.id"
					v-model:object="object.value"
					:selected_object_id="selected_object_id"
					@selectObject="selectObject"
				></drag-resize>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, onBeforeUpdate } from 'vue';
import DragResize from '@/components/drag-resize.vue';
import { NewObject, Shape } from '@/types';
import { SHAPE_MAX_WIDTH, SHAPE_MIN_WIDTH, SHAPE_MIN_HEIGHT, SHAPE_MAX_HEIGHT, SHAPE_SHAPE_RECTANGLE, uuid, SHAPE_SHAPE_CIRCLE } from '@/utils';
import _ from 'lodash';

export default defineComponent({
	name: 'App',
	components: { DragResize },
	setup() {
		const state = reactive<NewObject>({
			objectShape: SHAPE_SHAPE_RECTANGLE,
			objectWidth: 50,
			objectHeight: 50,
		});
		const mouseDown = ref<boolean>(false);
		const objects = reactive<Shape[]>([
			{
				id: uuid(),
				shape: SHAPE_SHAPE_RECTANGLE,
				width: 100,
				height: 100,
				xAxis: 90,
				yAxis: 80,
				rotationDegree: 0,
			},
			{
				id: uuid(),
				shape: SHAPE_SHAPE_RECTANGLE,
				width: 50,
				height: 50,
				xAxis: 200,
				yAxis: 200,
				rotationDegree: 0,
			},
		]);
		const selectedObjectId = ref<null | string>(null);

		const divs = ref([]);

		// make sure to reset the refs before each update
		onBeforeUpdate(() => {
			divs.value = [];
		});

		const disableAddButton = computed(() => {
			if (selectedObjectId.value) {
				return true;
			}

			return state.objectShape === SHAPE_SHAPE_RECTANGLE || state.objectShape === SHAPE_SHAPE_CIRCLE ? true : false;
		});

		function selectObject(objectId: string) {
			selectedObjectId.value = objectId;
			mouseDown.value = true;
		}

		function deselectObject() {
			if (!selectedObjectId.value) {
				return;
			}
			selectedObjectId.value = null;
			state.objectWidth = 50;
			state.objectHeight = 50;
			state.objectShape = SHAPE_SHAPE_RECTANGLE;
			mouseDown.value = false;
		}

		function addNewShape() {
			if (!state.objectShape) {
				return;
			}

			const width = state.objectWidth && state.objectWidth >= 10 ? state.objectWidth : 50;
			const height = state.objectHeight && state.objectHeight >= 10 ? state.objectHeight : 50;
			const xAxis = (SHAPE_MAX_WIDTH - width) / 2;
			const yAxis = (SHAPE_MAX_HEIGHT - height) / 2;

			const id = uuid();

			objects.push({
				id: id,
				shape: state.objectShape,
				width: width,
				height: height,
				xAxis: xAxis,
				yAxis: yAxis,
				rotationDegree: 0,
			});

			selectObject(id);
		}

		function deleteShape() {
			const objectIndex = _.findIndex(objects, { id: selectedObjectId.value });
			if (objectIndex >= 0) {
				objects.splice(objectIndex, 1);
			}
			deselectObject();
		}

		function updateSelectedObject() {
			const objectIndex = _.findIndex(objects, { id: selectedObjectId.value });

			if (objectIndex >= 0) {
				if (selectedObjectId.value && divs.value[selectedObjectId.value]) {
					divs.value[selectedObjectId.value][0].draw();
				}
			}
		}

		function updateWidth() {
			if (!selectedObjectId.value) {
				return;
			}

			// NOTE: MIN object width should be OBJECT_MIN_WIDTH
			if (state.objectWidth && state.objectWidth <= SHAPE_MIN_WIDTH) {
				state.objectWidth = SHAPE_MIN_WIDTH;
			}

			const selectedShape: undefined | Shape = _.find(objects, { id: selectedObjectId.value });

			// NOTE: object should be inside Parent Canvas
			if (selectedShape && state.objectWidth + selectedShape.xAxis > SHAPE_MAX_WIDTH) {
				state.objectWidth = SHAPE_MAX_WIDTH - selectedShape.xAxis;
				const index: number = _.findIndex(objects, { id: selectedObjectId.value });

				if (index >= 0) {
					objects[index].width = state.objectWidth;
				}
			}

			updateSelectedObject();
		}

		function updateHeight() {
			if (!selectedObjectId.value) {
				return;
			}

			// NOTE: MIN object height should be OBJECT_MIN_HEIGHT
			if (state.objectHeight && state.objectHeight <= SHAPE_MIN_HEIGHT) {
				state.objectHeight = SHAPE_MIN_HEIGHT;
			}

			const selectedShape: undefined | Shape = _.find(objects, { id: selectedObjectId.value });

			// NOTE: object should be inside Parent Canvas
			if (selectedShape && state.objectHeight + selectedShape.yAxis > SHAPE_MAX_HEIGHT) {
				state.objectHeight = SHAPE_MAX_HEIGHT - selectedShape.yAxis;
				const index: number = _.findIndex(objects, { id: selectedObjectId.value });

				if (index >= 0) {
					objects[index].height = state.objectHeight;
				}
			}

			updateSelectedObject();
		}
	},
});
</script>
<style>
.parent_canvas {
	height: 650px;
	width: 1026px;
	background-color: #f1f4f7;
	position: relative;
	border: 1px solid #d5d9dc;
	cursor: default;
	flex: none;
	box-sizing: border-box;
	border-radius: 1px;
}

.floor_paln_editor {
	overflow: auto;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	padding: 16px;
	display: flex;
	background-color: rgba(0, 0, 0, 0.2);
	border: 1px solid #cccccc;
	border-radius: 4px;
	box-sizing: border-box;
}

.type {
	border: 1px solid #cccccc;
	border-radius: 3px;
	padding: 5px;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	align-items: center;
	background-color: #ffffff;
}
.type_rect {
	border: 1px solid #cccccc;
	height: 15px;
	width: 40px;
	margin-top: 5px;
	cursor: pointer;
}
.type_circle {
	border: 1px solid #cccccc;
	border-radius: 50%;
	height: 20px;
	width: 20px;
	margin-top: 5px;
	cursor: pointer;
}
.type_wall {
	margin-top: 5px;
	margin-bottom: 5px;
	border: 1px solid #cccccc;
	height: 10px;
	width: 40px;
	cursor: pointer;
}

.selected_type {
	background-color: #f9fefd !important;
	border: 1px solid #55c4a2 !important;
}

.svg_teal {
	fill: #00b5ad;
}

.svg_disabled {
	opacity: 0.4;
}
</style>
