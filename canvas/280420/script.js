let canvas = CANVAS;
let canvasTemp = CANVAS_TEMP;
let ctx = canvas.getContext("2d");
let ctxTemp = canvasTemp.getContext("2d");
const multipleBtn = document.getElementById("multiple-btn");
const resetBtn = document.getElementById("reset-btn");
const xCoord = document.getElementById("x");
const yCoord = document.getElementById("y");
const dist = document.getElementById("dist");

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
  const { offsetX, offsetY } = e;
  ctxTemp.clearRect(0, 0, canvasTemp.width, canvasTemp.height);
  xCoord.innerText = offsetX;
  yCoord.innerText = offsetY;
  dist.innerText = calculateDistance(offsetX, offsetX, 250, 250);

  if (!nb) {
    drawCircle(offsetX, offsetY, ctxTemp);
  } else {
    console.log("draw " + nb);
    drawMultiCircles(offsetX, offsetY, ctxTemp);
  }
});

canvasTemp.addEventListener("mousedown", (e) => {
  const { offsetX, offsetY } = e;
  if (!nb) {
    drawCircle(offsetX, offsetY, ctx);
  } else {
    console.log("draw " + nb);
    drawMultiCircles(offsetX, offsetY, ctx);
  }
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
  context.arc(x + 100, y + 100, Math.abs(200 - x), 0, Math.PI * 2);
  context.stroke();
}

function drawMultiCircles(x, y, context) {
  const angle = 360 / nb;

  for (let i = 0; i < nb; i++) {
    const length = 100; //calculateDistance(x, y, 0, 0);
    const [x1, y1] = temp1(x, y, angle * i, length);
    context.beginPath();
    context.arc(x1, y1, Math.abs(200 - x), 0, Math.PI * 2);
    context.strokeStyle = "#FF0000";
    context.stroke();
  }
}

function calculateDistance(x1, y1, x2, y2) {
  // const a = Math.abs(x1 - x2);
  // const b = Math.abs(y1 - y2);
  // const c = Math.sqrt(a*a+b*b);
  // return c;

  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

function temp1(xCoord, yCoord, angle, length) {
  // let x1, y1, x2, y2, x3, y3;
  // y3 = y1;
  // x3 = x1 + Math.cos(angle) * length;

  // x2 = xCoord + Math.cos(angle) * length;
  // y2 = yCoord + Math.sin(angle) * length;
  // return [x2, y2];

  angle = (angle * Math.PI) / 180;
  return [length * Math.cos(angle) + xCoord, length * Math.sin(angle) + yCoord];
}
