<template>
	<div id="app" @mousedown.self="deselectTable()">
		<div class="floor_paln_editor">
			<div class="parent_canvas" id="parent_canvas" @mousedown.self="deselectObject()">
				<DragResize
					v-for="object in location_floor_plan.objects"
					:ref="object.id"
					:key="object.id"
					v-model:object="object"
					:selected_object_id="selected_object_id"
					@selectObject="selectObject"
				></DragResize>
			</div>
		</div>
	</div>
</template>

<script>
import { defineComponent } from 'vue';
import DragResize from '@/components/drag-resize.vue';

const OBJECT_TYPE_BARRIER = 0;
const OBJECT_TYPE_TABLE = 1;

const OBJECT_SHAPE_RECTANGLE = 0;
const OBJECT_SHAPE_CIRCLE = 1;

// Object Min width 10 px
const OBJECT_MIN_WIDTH = 10;
// Object Min height 10 px
const OBJECT_MIN_HEIGHT = 10;

export default {
	name: 'create-edit-location-floor-plans',
	components: { DragResize },
	data() {
		return {
			id: this.$route.params.id,
			dataLoading: false,
			errors: {},
			object_type_table: OBJECT_TYPE_TABLE,
			object_type_barrier: OBJECT_TYPE_BARRIER,
			object_shape_circle: OBJECT_SHAPE_CIRCLE,
			object_shape_rectangle: OBJECT_SHAPE_RECTANGLE,
			location_floor_plan: {
				id: null,
				name: null,
				location_id: null,
				sort_id: 1,
				enabled: true,
				canvas_width: 1020,
				canvas_height: 650,
				objects: [],
			},
			breadcrumbs: [{ name: 'Settings' }, { url: 'location_floor_plans.index', name: 'Floor Plans' }],
			selected_object_id: null,
			mouse_down: false,
			selected_object: null,
			object_name: null,
			object_seats: 0,
			object_width: null,
			object_height: null,
			object_shape: null,
			object_type: null,
			seats: [],
			max_floor_plans: [],
		};
	},
	watch: {
		selectedObject: {
			handler(val, oldVal) {
				if (val && val.id) {
					this.object_name = this.selected_object.name;
					this.object_seats = this.selected_object.seats;
					this.object_width = this.selected_object.width;
					this.object_height = this.selected_object.height;
					this.object_shape = this.selected_object.shape;
					this.object_type = this.selected_object.type;
				}
			},
			deep: true,
		},
		objects: {
			handler(val, oldVal) {
				if (this.selected_object_id) {
					this.selected_object = this.location_floor_plan.objects.find(({ id }) => id === this.selected_object_id);
				}
			},
			deep: true,
		},
	},
	computed: {
		disableAddButton() {
			if (this.selected_object_id) {
				return true;
			}

			return this.object_type === null || this.object_shape === null || (this.object_type === OBJECT_TYPE_TABLE && this.object_name === null)
				? true
				: false;
		},
	},
	methods: {
		addNewShape() {
			const t = this;

			if (this.object_type === OBJECT_TYPE_TABLE) {
				const object = _.find(t.location_floor_plan.objects, (object) => {
					return object.name && object.name.toLocaleLowerCase() === t.object_name.toLocaleLowerCase();
				});

				if (object) {
					Vue.toasted.error('Table Name already exist');
					return;
				}
			}

			const width = t.object_width >= 10 ? t.object_width : 50;
			const height = t.object_height >= 10 ? t.object_height : 50;
			const x_axis = (t.location_floor_plan.canvas_width - width) / 2;
			const y_axis = (t.location_floor_plan.canvas_height - height) / 2;
			const id = uuid().replace(/-/g, '');
			const seats = t.object_type === OBJECT_TYPE_BARRIER ? 0 : t.object_seats;
			t.location_floor_plan.objects.push({
				id: id,
				location_floor_plan_id: t.location_floor_plan.id,
				name: t.object_name,
				type: t.object_type,
				shape: t.object_shape,
				seats: seats,
				width: width,
				height: height,
				x_axis: x_axis,
				y_axis: y_axis,
				rotation_degree: 0,
			});
			this.selectObject(id);
		},
		deleteShape() {
			const object_index = _.findIndex(this.location_floor_plan.objects, { id: this.selected_object_id });
			if (object_index >= 0) {
				this.location_floor_plan.objects.splice(object_index, 1);
			}
			this.deselectObject();
		},
		selectObject(object_id) {
			this.selected_object_id = object_id;
			this.selected_object = this.location_floor_plan.objects.find(({ id }) => id === this.selected_object_id);
			this.mouse_down = true;
		},
		deselectObject() {
			if (!this.selected_object_id) {
				return;
			}
			this.selected_object_id = null;
			this.selected_object = null;
			this.object_name = null;
			this.object_seats = null;
			this.object_width = null;
			this.object_height = null;
			this.object_type = null;
			this.object_shape = null;
			this.mouse_down = false;
		},
		updateName() {
			const t = this;
			if (!t.selected_object_id) {
				return;
			}

			const object = _.find(t.location_floor_plan.objects, (object) => {
				return object.name && object.name.toLocaleUpperCase() === t.object_name.toLocaleUpperCase() && t.selected_object_id !== object.id;
			});

			if (object) {
				Vue.toasted.error('Table Name already exist');
				return;
			}

			t.selected_object.name = t.object_name;
			t.updateSelectedObject();
		},
		updateSeats() {
			if (!this.selected_object_id) {
				return;
			}

			this.selected_object.seats = this.object_seats;
			this.updateSelectedObject();
		},
		updateWidth() {
			if (!this.selected_object_id) {
				return;
			}

			// NOTE: MIN object width should be OBJECT_MIN_WIDTH
			if (this.object_width <= OBJECT_MIN_WIDTH) {
				this.object_width = OBJECT_MIN_WIDTH;
			}

			// NOTE: object should be inside Parent Canvas
			if (this.object_width + this.selected_object.x_axis > this.location_floor_plan.canvas_width) {
				this.object_width = this.location_floor_plan.canvas_width - this.selected_object.x_axis;
			}

			this.selected_object.width = this.object_width;

			this.updateSelectedObject();
		},
		updateHeight() {
			if (!this.selected_object_id) {
				return;
			}

			// NOTE: MIN object height should be OBJECT_MIN_HEIGHT
			if (this.object_height <= OBJECT_MIN_HEIGHT) {
				this.object_height = OBJECT_MIN_HEIGHT;
			}

			// NOTE: object should be inside Parent Canvas
			if (this.object_height + this.selected_object.y_axis > this.location_floor_plan.canvas_height) {
				this.object_height = this.location_floor_plan.canvas_height - this.selected_object.y_axis;
			}

			this.selected_object.height = this.object_height;
			this.updateSelectedObject();
		},
		updateShape(shape) {
			if (this.selected_object_id) {
				return;
			}

			this.object_shape = shape;
		},
		updateType(type) {
			if (this.selected_object_id) {
				return;
			}

			this.object_type = type;

			// NOTE: if object type is obstruction then set seats to zero
			if (this.object_type === OBJECT_TYPE_BARRIER) {
				this.object_seats = 0;
			}
		},
		updateSelectedObject() {
			const objectIndex = _.findIndex(this.location_floor_plan.objects, { id: this.selected_object_id });

			if (objectIndex >= 0) {
				this.location_floor_plan.objects[objectIndex] = this.selected_object;
				// redraw element on update
				if (this.selected_object_id && this.$refs[this.selected_object_id]) {
					this.$refs[this.selected_object_id][0].draw();
				}
			}
		},
	},
};
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
