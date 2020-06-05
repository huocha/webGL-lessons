const TAU = Math.PI * 2;
const cos = Math.cos;
const sin = Math.sin;

const canvas = CANVAS;
const context = canvas.getContext("2d");
let mandala = [
  {
    repetition: 1,
    distance: 0,
    size: 240,
  },
  {
    repetition: 3,
    distance: 0,
    size: 0,
  },
];

function drawMandala(mandala, index, startAngle, endAngle) {
  let circle = mandala[index];
  const { repetition, distance, size } = circle;

  for (let i = 0; i < repetition; ++i) {
    const angle = startAngle + (i * (endAngle - startAngle)) / repetition;
    context.beginPath();
    context.arc(
      250 + cos(angle) * distance,
      250 + sin(angle) * distance,
      size,
      0,
      TAU
    );
    context.stroke();

    if (mandala[index + 1]) {
      context.save();
      context.clip();
      drawMandala(
        mandala,
        index + 1,
        startAngle + ((i - 0.5) * TAU) / repetition,
        startAngle + ((i + 0.5) * TAU) / repetition
      );
      context.restore();
    }
  }
}

function setup() {
  canvas.onmousemove = (e) => {
    const { offsetX, offsetY } = e;
    mandala[mandala.length - 1].distance = 250 - offsetX;
    mandala[mandala.length - 1].size = Math.abs(250 - offsetY);

    draw();
  };

  canvas.onclick = (e) => {
    mandala.push({
      repetition: 4,
      size: 0,
      distance: 0,
    });
    draw();
  };

  canvas.onmousewheel = (e) => {
    // deltaY > 1, then increment, otherwise decrement

    if (e.deltaY > 1) {
      mandala[mandala.length - 1].repetition += 1;
    } else if (mandala[mandala.length - 1].repetition > 2) {
      mandala[mandala.length - 1].repetition -= 1;
    }
    draw();
  };
}

function draw() {
  canvas.width = canvas.width;
  context.strokeStyle = "black";
  drawMandala(mandala, 0, 0, TAU);
}

setup();
draw();
