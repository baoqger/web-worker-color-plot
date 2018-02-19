<template>
  <div class="container">
    <video
      class="video"
      src="./assets/test.mp4"
      autoplay
      loop
      controls
      ref="video"
      id="video"/>
    <canvas class="canvas" ref="canvas" hidden></canvas>

    <chart v-if="videoLoaded" :frame="frame" :color="averageColor"></chart>
  </div>
</template>

<script>
import Chart from './chart';

const FPS = 25;
const INTERVAL = 1000 / (FPS / 10);
let then = new Date().getTime();

export default {
  name: 'App',
  data() {
    return {
      worker: null,
      videoLoaded: false,
      isPlaying: false,
      ctx: null,
      averageColor: { r: 0, g: 0, b: 0 },
      frame: 0,
    };
  },
  created() {
    this.worker = this.$worker.create([
      {
        message: 'plot',
        func: (data) => {
          const length = data.data.length;
          const BLOCKSIZE = 5;
          const STEPS = 4;
          let i = 0;
          let count = 0;
          const rgb = { r: 0, g: 0, b: 0 };

          while (i < length) {
            count += 1;
            rgb.r += data.data[i];
            rgb.g += data.data[i + 1];
            rgb.b += data.data[i + 2];
            i += BLOCKSIZE * STEPS;
          }
          /* eslint-disable-next-line */
          rgb.r = ~~(rgb.r / count);
          /* eslint-disable-next-line */
          rgb.g = ~~(rgb.g / count);
          /* eslint-disable-next-line */
          rgb.b = ~~(rgb.b / count);
          return rgb;
        },
      },
    ]);
  },
  mounted() {
    const canvasNode = this.$refs.canvas;
    const videoNode = this.$refs.video;
    this.ctx = canvasNode.getContext('2d');

    videoNode.addEventListener('canplay', () => {
      canvasNode.height = videoNode.offsetHeight;
      canvasNode.width = videoNode.offsetWidth;
      this.videoLoaded = true;
    });

    videoNode.addEventListener('play', () => {
      this.isPlaying = true;
    });

    videoNode.addEventListener('pause', () => {
      this.isPlaying = false;
    });
  },
  destroyed() {
    this.worker = null;
  },
  methods: {
    drawCanvas() {
      requestAnimationFrame(this.drawCanvas);

      const now = new Date().getTime();
      const delta = now - then;

      if (delta > INTERVAL) {
        then = now - (delta % INTERVAL);
        const vid = this.$refs.video;
        let x1 = 0;
        let y1 = 0;
        x1 = vid.offsetWidth;
        y1 = vid.offsetHeight;

        // draws image into canvas using video source
        this.ctx.drawImage(vid, 0, 0, x1, y1);
        // gets the image data from the canvas
        const data = this.ctx.getImageData(0, 0, x1, y1);
        this.worker.postMessage('plot', [data]).then((res) => {
          this.averageColor = res;
          this.frame = Math.floor(this.$refs.video.currentTime * FPS);
        });
      }
    },
  },
  watch: {
    isPlaying() {
      requestAnimationFrame(this.drawCanvas);
    },
  },
  components: {
    Chart,
  },
};
</script>

<style>
  * {
    box-sizing: border-box;
  }
  .container {
    padding: 0;
    margin: 0 auto;
    width: 95%;
    max-width: 1000px;
    position: relative;
  }
  .video {
    width: 100%;
    height: auto;
    margin-bottom: 2rem;
  }
  .canvas {
    position: absolute;
    left: 0;
    top: 0;
    pointer-events: none;
    display: none;
  }
  .color {
    height: 50px;
    width: 50px;
  }
</style>
