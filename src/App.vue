<template>
  <div id="app" @mousedown.self="deselectTable()">
    <div class="parent_canvas" id="parent_canvas" @mousedown.self="deselectTable()">
      <div
        v-for="table in tables"
        :key="table.id"
        class="draggable"
        :class="{ 'active': draggable_element_id === table.id }"
        :id="table.id"
      >
        <Rotate
          v-if="draggable_element_id === table.id && table.type != 1"
          @mousedown="mouseDown"
          @mousemove="rotate"
        ></Rotate>
        <div
          class="drag_item"
          @mousemove.self="drag"
          @mousedown="selectTable(table.id)"
        >{{ table.name }}</div>
        <template v-if="draggable_element_id === table.id">
          <div
            class="resizer resizer_top"
            @mousedown="resizeMouseDown"
            @mousemove="resize('top', $event)"
          ></div>
          <div
            class="resizer resizer_right"
            @mousedown="resizeMouseDown"
            @mousemove="resize('right', $event)"
          ></div>
          <div
            class="resizer resizer_bottom"
            @mousedown="resizeMouseDown"
            @mousemove="resize('bottom', $event)"
          ></div>
          <div
            class="resizer resizer_left"
            @mousedown="resizeMouseDown"
            @mousemove="resize('left', $event)"
          ></div>
        </template>
      </div>
      <!-- X => {{ x }} : Y => {{ y }} -->
    </div>
  </div>
</template>
<script>
import Rotate from '@/components/rotate.vue';

export default {
	name: 'App',
	components: { Rotate },
	data() {
		return {
			tables: [
				{
					id: 'draggable_1',
					name: 'A',
					width: 50,
					height: 50,
					top: 80,
					left: 70,
					angle: 45,
					// type 0 is rectangle
					type: 0,
				},
				{
					id: 'draggable_2',
					name: 'B',
					width: 150,
					height: 100,
					top: 200,
					left: 150,
					angle: 0,
					type: 0,
				},
				{
					id: 'draggable_3',
					name: 'C',
					width: 60,
					height: 60,
					top: 200,
					left: 350,
					angle: 0,
					type: 1,
				},
			],
			draggable_element_id: null,
			mouse_down: false,
			original_width: 0,
			original_height: 0,
			original_x: 0,
			original_y: 0,
			original_mouse_x: 0,
			original_mouse_y: 0,
			minWidth: 20,
			maxWidth: 450,
			minHeight: 20,
			maxHeight: 450,
		};
	},
	mounted() {
		this.draw();
	},
	methods: {
		selectTable(id) {
			this.draggable_element_id = id;
			this.mouse_down = true;
		},
		deselectTable() {
			this.draggable_element_id = null;
			this.mouse_down = false;
		},
		drag(event) {
			if (this.draggable_element_id && this.mouse_down) {
				const element = document.getElementById(this.draggable_element_id);

				element.style.left = event.clientX - Math.round(element.offsetWidth / 3) + 'px';
				element.style.top = event.clientY - Math.round(element.offsetHeight / 3) + 'px';
			}
		},
		draw() {
			for (const table of this.tables) {
				const draggable = document.getElementById(table.id);

				draggable.style.top = table.top + 'px';
				draggable.style.left = table.left + 'px';

				draggable.style.width = table.width + 'px';
				draggable.style.height = table.height + 'px';
				draggable.style.transform = 'rotate(' + table.angle + 'deg)';
				if (table.type === 1) {
					draggable.style.borderRadius = '50%';
				}
			}

			const parent_canvas = document.getElementById('parent_canvas');
			parent_canvas.addEventListener('mouseup', (event) => {
				this.mouse_down = false;
			});
		},
		mouseDown(event) {
			this.mouse_down = true;
		},
		resizeMouseDown(event) {
			const element = document.getElementById(this.draggable_element_id);

			this.original_width = element.offsetWidth;
			this.original_height = element.offsetHeight;
			this.original_x = element.getBoundingClientRect().left;
			this.original_y = element.getBoundingClientRect().top;
			this.original_mouse_x = event.pageX;
			this.original_mouse_y = event.pageY;
			this.mouse_down = true;
		},
		resize(direction, event) {
			if (this.draggable_element_id === null) {
				return;
			}

			if (this.mouse_down === false) {
				return;
			}

			const element = document.getElementById(this.draggable_element_id);

			switch (direction) {
				case 'top':
					const top_height = this.original_height - (event.pageY - this.original_mouse_y);

					element.style.height = this.getHeight(top_height) + 'px';
					element.style.top = this.original_y + (event.pageY - this.original_mouse_y) + 'px';
					break;

				case 'right':
					const right_width = event.pageX - element.getBoundingClientRect().left;
					element.style.width = this.getWidth(right_width) + 'px';
					break;

				case 'bottom':
					const bottom_height = this.original_height + (event.pageY - this.original_mouse_y);

					element.style.height = this.getHeight(bottom_height) + 'px';
					break;

				case 'left':
					const left_width = this.original_width - (event.pageX - this.original_mouse_x);

					element.style.width = this.getWidth(left_width) + 'px';
					element.style.left = this.original_x + (event.pageX - this.original_mouse_x) + 'px';
					break;

				default:
					// do nothing
					break;
			}
		},
		rotate(event) {
			if (this.draggable_element_id === null) {
				return;
			}

			if (this.mouse_down === false) {
				return;
			}

			const element = document.getElementById(this.draggable_element_id);

			const pwBox = element.getBoundingClientRect();
			const center_x = (pwBox.left + pwBox.right) / 2;
			const center_y = (pwBox.top + pwBox.bottom) / 2;
			// get mouse position
			const mouse_x = event.pageX;
			const mouse_y = event.pageY;
			const radians = Math.atan2(mouse_x - center_x, mouse_y - center_y);
			const degree = Math.round(radians * (180 / Math.PI) * -1 + 100);

			const rotate = 'rotate(' + (degree + 30) + 'deg)';

			element.style.transform = rotate;
		},
		getWidth(width) {
			if (width < this.minWidth) {
				return this.minWidth;
			}

			if (width > this.maxWidth) {
				return this.maxWidth;
			}

			return width;
		},
		getHeight(height) {
			if (height < this.minHeight) {
				return this.minHeight;
			}

			if (height > this.maxHeight) {
				return this.maxHeight;
			}

			return height;
		},
	},
};
</script>

<style>
#app {
	font-family: 'Avenir', Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
	margin-top: 60px;
}
.parent_canvas {
	margin: 20px;
	border-radius: 3px;
	background-color: #dddddd;
	width: 450px;
	height: 450px;
	overflow: hidden;
	box-sizing: border-box;
}
.draggable {
	box-sizing: border-box;
	height: 50px;
	width: 50px;
	padding: 5px;
	background-color: #2c3e50;
	border-radius: 3px;
	cursor: move;
	position: absolute;
	-webkit-touch-callout: none; /* iOS Safari */
	-webkit-user-select: none; /* Safari */
	-khtml-user-select: none; /* Konqueror HTML */
	-moz-user-select: none; /* Old versions of Firefox */
	-ms-user-select: none; /* Internet Explorer/Edge */
	user-select: none;
}
.active {
	background-color: #0d93c9 !important;
	border: 0.7px solid #0d93c9;
	z-index: 1;
}

.active .resizer {
	width: 7px;
	height: 7px;
	border-radius: 50%; /*magic to turn square into circle*/
	background: white;
	border: 1px solid #0d93c9;
	position: absolute;
}
.resizer.resizer_left {
	left: -4px;
	bottom: 40%;
	cursor: ew-resize;
}
.resizer.resizer_top {
	left: 40%;
	top: -4px;
	cursor: ns-resize;
}
.resizer.resizer_right {
	right: -4px;
	top: 45%;
	cursor: ew-resize;
}
.resizer.resizer_bottom {
	right: 45%;
	bottom: -4px;
	cursor: ns-resize;
}
.drag_item {
	padding: 4px;
	box-sizing: border-box;
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	color: #fff;
}
.rotate_svg {
	cursor: move; /* fallback if grab cursor is unsupported */
	cursor: grab;
	cursor: -moz-grab;
	cursor: -webkit-grab;
	position: absolute;
	top: -20px;
	right: -20px;
}
</style>
