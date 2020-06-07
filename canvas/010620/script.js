const canvas = CANVAS;
const context = canvas.getContext("2d");

function draw(instruction) {
  const splittedIntruction = instruction.split(" ");

  for (let i = 0; i < splittedIntruction.length; i + 2) {
    switch (splittedIntruction[i]) {
      case "M":
        moveTo(splittedIntruction[i + 1], splittedIntruction[i + 2]);
      case "L":
        lineTo(splittedIntruction[i + 1], splittedIntruction[i + 2]);
      default:
        console.warn("No instruction found");
    }
  }
}

function moveTo(x, y) {
  context.moveTo(x, y);
}

function lineTo(x, y) {
  context.lineTo(x, y);
}

function drawFemale() {
  context.translate(200, 100);
  context.arc(37.168, 20.168, 20.168, 0, 2 * Math.PI * 2);
  context.fillStyle = "#cfd8dc";
  context.fill();

  context.beginPath();
  context.translate(-5.298, 32.212);
  const p = new Path2D(
    "M50.279,178.03h-13.9a9.857,9.857,0,0,1-9.856-9.856v-65.2H11.645A6.356,6.356,0,0,1,5.3,96.626L22.381,20.445a6.358,6.358,0,0,1,6.357-6.35h1.041a20.1,20.1,0,0,0,13.548,5.227,20.1,20.1,0,0,0,13.548-5.227h.641a6.361,6.361,0,0,1,6.35,6.35L80.591,96.622a6.356,6.356,0,0,1-6.35,6.347H60.131v65.2A9.858,9.858,0,0,1,50.279,178.03Z"
  );

  context.fillStyle = "#cfd8dc";
  context.fill(p);
}

function drawMale() {
  context.arc(180.168, -12.168, 20.168, 0, 2 * Math.PI * 2);
  context.fillStyle = "#cfd8dc";
  context.fill();

  context.translate(108.938, 0);
  const p = new Path2D(
    "M81.706,178.031H61.085a9.857,9.857,0,0,1-9.856-9.856v-65.2H47.639a9.857,9.857,0,0,1-9.856-9.856V23.952A9.857,9.857,0,0,1,47.639,14.1H58.22a20.1,20.1,0,0,0,13.548,5.227A20.1,20.1,0,0,0,85.317,14.1H95.524a9.857,9.857,0,0,1,9.856,9.856v69.17a9.857,9.857,0,0,1-9.856,9.856H91.562v65.2a9.857,9.857,0,0,1-9.856,9.856Z"
  );
  context.fillStyle = "#cfd8dc";
  context.fill(p);
}

drawFemale();
drawMale();
