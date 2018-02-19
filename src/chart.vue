<template>
  <div>
    <svg class="svg" id="svg" ref="svg">
    </svg>
  </div>
</template>


<script>

import { select } from 'd3';
import { scaleLinear } from 'd3-scale';
import { rgb } from 'd3-color';
import { axisBottom, axisLeft } from 'd3-axis';
import { map } from 'lodash';

const HISTOGRAM_HEIGHT = 100;
const FPS = 25;

let xAxis = null;
let yAxis = null;

export default {
  name: 'chart',
  props: ['frame', 'color'],
  mounted() {
    this.setupChart();
    this.getCurrentTime();
  },
  watch: {
    frame() {
      this.updateChart();
    },
  },
  methods: {
    // moves the needle showing the current frame
    getCurrentTime() {
      const vid = document.getElementById('video');
      this.currentTime = vid.currentTime;
      const dX = xAxis(this.currentTime * FPS);
      select('.needle-line')
        .attr('d', () => `M${dX},${HISTOGRAM_HEIGHT} ${dX}, 0`);
      requestAnimationFrame(this.getCurrentTime);
    },
    updateChart() {
      const frame = this.frame;
      const color = this.color;
      const svg = select('#svg');

      // map through the color keys (red, green, and blue) and
      // append a circle for each one at the current frame
      map(color, (c, k) => {
        svg
          .append('circle')
          .attr('r', 1)
          .attr('cx', xAxis(frame))
          .attr('cy', yAxis(c))
          .attr('fill', () => {
            const n = rgb();
            n[k] = c;
            return n;
          });
      });

      // for each update, append a rectangle showing the current average color
      svg
        .append('rect')
        .attr('x', xAxis(frame))
        .attr('y', yAxis(310))
        .attr('width', 3)
        .attr('height', 20)
        .attr('fill', rgb(color.r, color.g, color.b));
    },
    setupChart() {
      const videoNode = document.getElementById('video');
      const svgNode = document.getElementById('svg');
      svgNode.setAttribute('width', videoNode.offsetWidth);
      svgNode.setAttribute('height', HISTOGRAM_HEIGHT);

      // xDomain is the length of the video in frames
      const xDomain = [0, videoNode.duration * FPS];

      // yDomain is the range of possible values for each color
      const yDomain = [0, 256];

      const svg = select('#svg');
      const width = svg.attr('width');
      const height = svg.attr('height');
      const g = svg.append('g');

      // both axes are D3 linear scales
      xAxis = scaleLinear().range([0, width]);
      yAxis = scaleLinear().range([height, 0]);

      // apply the domain to the axes
      xAxis.domain(xDomain);
      yAxis.domain(yDomain);

      // draws the bottom axis
      g.append('g')
        .attr('class', 'axis axis-x')
        .attr('transform', `translate(0, ${height})`)
        .call(axisBottom(xAxis));

      // draws the left axis
      g.append('g')
        .attr('class', 'axis axis--y')
        .call(axisLeft(yAxis));

      // draws the needle line which shows the current frame
      g.append('path')
        .attr('class', 'needle-line')
        .style('stroke', 'black')
        .style('stroke-width', '3px')
        .style('opacity', '1');
    },
  },
};
</script>
