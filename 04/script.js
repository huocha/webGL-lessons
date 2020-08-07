function preloadImage(url) {
  return new Promise((resolve, reject) => {
    const image = document.createElement("img");
    image.crossOrigin = "Anonymous";
    image.src = url;
    image.onload = () => resolve(image);
    image.onerror = () => reject();
  });
}

function main(image) {
  const canvas = CANVAS;
  const originBtn = ORIGIN;
  const grayScaleBtn = GRAY_SCALE;
  const brightnessBtn = BRIGHTNESS;
  let ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  let bright = 5;

  ctx.drawImage(image, 0, 0, w, h);
  const imageData = ctx.getImageData(0, 0, w, h);

  function putImage(data) {
    const newImageData = new ImageData(new Uint8ClampedArray(data), w, h);
    ctx.putImageData(newImageData, 0, 0);
  }

  originBtn.addEventListener("click", () => {
    ctx.putImageData(imageData, 0, 0);
    bright = 5;
  });
  grayScaleBtn.addEventListener("click", () => {
    putImage(onGrayScale([...imageData.data]));
  });
  brightnessBtn.addEventListener("click", () => {
    putImage(onBrightness([...imageData.data], bright));
    bright += 10;
  });
}

function onGrayScale(data) {
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];
    const newValue = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    data[i] = data[i + 1] = data[i + 2] = newValue;
  }
  return data;
}

function onBrightness(data, adj) {
  for (let i = 0; i < data.length; i += 4) {
    data[i] += adj;
    data[i + 1] += adj;
    data[i + 2] += adj;
  }
  return data;
}

function init() {
  preloadImage("https://i.imgur.com/d79yUgm.jpg").then((result) => {
    main(result);
  });
}

window.onload = init;
