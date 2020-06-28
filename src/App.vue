<template>
  <div id="app">
    <div
      class="parent_canvas"
      id="parent_canvas"
      @mouseup="mouse_down = false"
      @mousedown="mouse_down = true"
    >
      <div
        v-for="table in tables"
        :key="table.id"
        class="draggable"
        :class="{ 'active': draggable_element_id === table.id }"
        :id="table.id"
      >
        <Rotate v-if="draggable_element_id === table.id" @mousedown="rotate"></Rotate>
        <div
          class="drag_item"
          @mousemove.self="doDrag"
          @mousedown="startDrag(table.id)"
        >{{ table.name }}</div>
        <template v-if="draggable_element_id === table.id">
          <div
            class="resizer resizer_left"
            @mousedown="mouseDown"
            @mousemove.stop.prevent="resize('left', $event)"
          ></div>
          <div
            class="resizer resizer_top"
            @mousedown="mouseDown"
            @mousemove.stop.prevent="resize('top', $event)"
          ></div>
          <div
            class="resizer resizer_right"
            @mousedown="mouseDown"
            @mousemove.stop.prevent="resize('right', $event)"
          ></div>
          <div
            class="resizer resizer_bottom"
            @mousedown="mouseDown"
            @mousemove.stop.prevent="resize('bottom', $event)"
          ></div>
        </template>
      </div>
      <!-- X => {{ x }} : Y => {{ y }} -->
    </div>
  </div>
</template>
<script>
import Rotate from "@/components/rotate.vue";

export default {
  name: "App",
  components: { Rotate },
  data() {
    return {
      tables: [
        {
          id: "draggable_1",
          name: "A",
          width: 50,
          height: 50,
          top: 80,
          left: 70,
          angle: 45
        },
        {
          id: "draggable_2",
          name: "B",
          width: 150,
          height: 100,
          top: 200,
          left: 150,
          angle: 0
        }
      ],
      draggable_element_id: null,
      mouse_down: false,
      original_width: 0,
      original_height: 0,
      original_x: 0,
      original_y: 0,
      original_mouse_x: 0,
      original_mouse_y: 0
    };
  },
  mounted() {
    this.draw();
  },
  methods: {
    startDrag(id) {
      this.draggable_element_id = id;
    },
    stopDrag() {
      // this.draggable_element_id = null;
      this.mouse_down = false;
    },
    doDrag(event) {
      if (this.draggable_element_id && this.mouse_down) {
        const element = document.getElementById(this.draggable_element_id);

        element.style.left =
          event.clientX - Math.round(element.offsetWidth / 3) + "px";
        element.style.top =
          event.clientY - Math.round(element.offsetHeight / 3) + "px";
      }
    },
    draw() {
      for (const table of this.tables) {
        const draggable = document.getElementById(table.id);

        draggable.style.top = table.top + "px";
        draggable.style.left = table.left + "px";

        draggable.style.width = table.width + "px";
        draggable.style.height = table.height + "px";
      }

      const parent_canvas = document.getElementById("parent_canvas");
      parent_canvas.addEventListener("mouseup", event => {
        this.stopDrag();
      });
    },
    mouseDown(event) {
      const element = document.getElementById(this.draggable_element_id);

      this.original_width = element.offsetWidth;
      this.original_height = element.offsetHeight;
      this.original_x = element.getBoundingClientRect().left;
      this.original_y = element.getBoundingClientRect().top;
      this.original_mouse_x = event.pageX;
      this.original_mouse_y = event.pageY;
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
        case "top": // if (x === 'value2')
          element.style.height =
            this.original_height - (event.pageY - this.original_mouse_y) + "px";
          element.style.top =
            this.original_y + (event.pageY - this.original_mouse_y) + "px";
          break;

        case "right": // if (x === 'value1')
          element.style.width =
            event.pageX - element.getBoundingClientRect().left + "px";
          break;

        case "bottom": // if (x === 'value2')
          element.style.height =
            this.original_height + (event.pageY - this.original_mouse_y) + "px";
          break;

        case "left": // if (x === 'value2')
          element.style.width =
            this.original_width - (event.pageX - this.original_mouse_x) + "px";
          element.style.left =
            this.original_x + (event.pageX - this.original_mouse_x) + "px";
          break;

        default:
          // do nothing
          break;
      }
    },
    resizeLeft(event) {
      if (this.draggable_element_id === null) {
        return;
      }

      if (this.mouse_down === false) {
        return;
      }

      const element = document.getElementById(this.draggable_element_id);

      element.style.width =
        this.original_width - (event.pageX - this.original_mouse_x) + "px";

      element.style.left =
        this.original_x + (event.pageX - this.original_mouse_x) + "px";
    },
    resizeRight(event) {
      if (this.draggable_element_id === null) {
        return;
      }

      if (this.mouse_down === false) {
        return;
      }

      const element = document.getElementById(this.draggable_element_id);

      element.style.width =
        event.pageX - element.getBoundingClientRect().left + "px";
    },
    resizeBottom(event) {
      if (this.draggable_element_id === null) {
        return;
      }

      if (this.mouse_down === false) {
        return;
      }

      const element = document.getElementById(this.draggable_element_id);

      element.style.height =
        this.original_height + (event.pageY - this.original_mouse_y) + "px";
    },
    resizeTop(event) {
      if (this.draggable_element_id === null) {
        return;
      }

      if (this.mouse_down === false) {
        return;
      }

      const element = document.getElementById(this.draggable_element_id);

      element.style.height =
        this.original_height - (event.pageY - this.original_mouse_y) + "px";

      element.style.top =
        this.original_y + (event.pageY - this.original_mouse_y) + "px";
    },
    rotate(event) {
      if (this.draggable_element_id === null) {
        return;
      }

      if (this.mouse_down === false) {
        return;
      }

      const element = document.getElementById(this.draggable_element_id);
      console.log(element);
      element.style.transform = "rotate(30deg)";
    }
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
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
