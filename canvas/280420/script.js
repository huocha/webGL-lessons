let canvas = CANVAS;
let canvasTemp = CANVAS_TEMP;
let ctx = canvas.getContext("2d");
let ctxTemp = canvasTemp.getContext("2d");
const multipleBtn = document.getElementById("multiple-btn");
const resetBtn = document.getElementById("reset-btn");
const xCoord = document.getElementById("x");
const yCoord = document.getElementById("y");

let nb = 0;

function initCircle() {
  // draw the circle
  ctx.moveTo(450, 250);
  ctx.arc(250, 250, 200, 0, Math.PI * 2);
  ctx.clip();
  ctx.stroke();

  ctxTemp.moveTo(450, 250);
  ctxTemp.arc(250, 250, 200, 0, Math.PI * 2);
  ctxTemp.clip();
  ctxTemp.stroke();
}

initCircle();

canvasTemp.addEventListener("mousemove", (e) => {
  ctxTemp.clearRect(0, 0, canvasTemp.width, canvasTemp.height);
  xCoord.innerText = e.offsetX;
  yCoord.innerText = e.offsetY;

  if (!nb) {
    drawCircle(e.offsetX, e.offsetY, ctxTemp);
  } else {
    console.log("draw " + nb);
    drawMultiCircles(e.offsetX, e.offsetY, ctxTemp);
  }
});

canvasTemp.addEventListener("mousedown", (e) => {
  drawCircle(e.offsetX, e.offsetY, ctx);
});

multipleBtn.addEventListener("click", (e) => {
  nb += 1;
  console.log("multiple click", nb);
});

resetBtn.addEventListener("click", (e) => {
  canvas.width = canvas.width;
  canvasTemp.width = canvasTemp.width;
  initCircle();
});

function drawCircle(x, y, context) {
  context.beginPath();
  context.arc(x, y, Math.abs(100 - x), 0, Math.PI * 2);
  context.stroke();
}

function drawMultiCircles(x, y, context) {
  context.beginPath();
  context.arc(x, y, Math.abs(100 - x), 0, Math.PI * 2);
  context.stroke();

  context.beginPath();
  context.arc(x + 100, y + 100, Math.abs(100 - x), 0, Math.PI * 2);
  context.stroke();
}
