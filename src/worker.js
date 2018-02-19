onmessage = function (e) {
  const data = e.data;
  const length = data.data.length;
  const BLOCKSIZE = 5;
  const STEPS = 4;
  let i = -4;
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

  postMessage(rgb);
};
