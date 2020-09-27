const SIZE = 256;

function buildShader(context, shaderType, id) {
  const shader = context.createShader(shaderType);
  context.shaderSource(shader, document.getElementById(id).innerHTML);
  context.compileShader(shader);

  if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
    console.error(
      "Shader [" + id + "] fail to build",
      context.getShaderInfoLog(shader)
    );
  }

  return shader;
}

function buildFragmentShader(context, id) {
  return buildShader(context, context.FRAGMENT_SHADER, id);
}

function buildVertexShader(context, id) {
  return buildShader(context, context.VERTEX_SHADER, id);
}

function buildProgram(context, vertexShaderId, fragmentShaderId) {
  const vertexShader = buildVertexShader(context, vertexShaderId);
  const fragmentShader = buildFragmentShader(context, fragmentShaderId);
  const program = context.createProgram();

  context.attachShader(program, vertexShader);
  context.attachShader(program, fragmentShader);
  context.linkProgram(program);

  if (!context.getProgramParameter(program, context.LINK_STATUS)) {
    console.error(
      "Program [" + vertexShaderId + ", " + fragmentShaderId + "] fail to link",
      context.getProgramInfoLog(program)
    );
  }

  context.validateProgram(program);
  if (!context.getProgramParameter(program, context.VALIDATE_STATUS)) {
    console.error(
      "Program [" +
        vertexShaderId +
        ", " +
        fragmentShaderId +
        "] fail to validate",
      context.getProgramInfoLog(program)
    );
  }

  return program;
}

function updateTextureGameOfLife(
  context,
  textureId,
  url,
  top,
  right,
  bottom,
  left,
  columns,
  lines,
  shift
) {
  return new Promise((resolve) => {
    // Create image
    const image = new Image();

    // Add onload event
    image.onload = () => {
      const data = new Array(lines)
        .fill(0)
        .map(() => new Array(columns).fill(0).map(() => [255, 255, 255]));

      const canvas = document.createElement("canvas");

      const width = right - left;
      const height = bottom - top;

      const context2d = canvas.getContext("2d");
      canvas.width = width;
      canvas.height = height;
      context2d.drawImage(image, left, top, width, height, 0, 0, width, height);

      const imageData = context2d.getImageData(0, 0, width, height);
      const cw = width / columns;
      const ch = height / lines;
      const cw2 = ~~(cw / 2);
      const ch2 = ~~(ch / 2);
      for (let y = 0; y < lines; ++y) {
        for (let x = 0; x < columns; ++x) {
          const index = (x * cw + cw2 + (y * ch * width + ch2 * width)) * 4;
          const px = imageData.data[index];
          if (px == 0) {
            data[y][x] = [0, 0, 0];
          }
        }
      }

      const [matrix, w, h] = ensureMatrixPowOf2(growMatrix(data, shift));
      const buffer = matrix.flat(2);
      const texture = updateTextureBuffer(context, textureId, w, h, buffer);
      resolve(texture);
    };

    // Change image url
    image.src = url;
  });
}

function growMatrix(matrix, growBy) {
  const height = matrix.length;
  const width = matrix[0].length;
  return [
    ...new Array(growBy)
      .fill(0)
      .map(() =>
        new Array(width + growBy * 2).fill(0).map(() => [255, 255, 255])
      ),
    ...matrix.map((v) => [
      ...new Array(growBy).fill(0).map(() => [255, 255, 255]),
      ...v,
      ...new Array(growBy).fill(0).map(() => [255, 255, 255]),
    ]),
    ...new Array(growBy)
      .fill(0)
      .map(() =>
        new Array(width + growBy * 2).fill(0).map(() => [255, 255, 255])
      ),
  ];
}
function ensureMatrixPowOf2(matrix) {
  const ch = matrix.length;
  const cw = matrix[0].length;
  let th = 2 ** Math.ceil(Math.log2(ch, 2));
  let tw = 2 ** Math.ceil(Math.log2(cw, 2));
  tw = th = Math.max(th, tw);

  matrix = matrix.map((l) => [
    ...l,
    ...new Array(tw - cw).fill(0).map(() => [255, 255, 255]),
  ]);
  for (let i = 0; i < th - ch; ++i) {
    matrix.push(new Array(tw).fill(0).map(() => [255, 255, 255]));
  }

  return [matrix, tw, th];
}

function updateTextureBuffer(
  context,
  textureId,
  width,
  height,
  data
) /* : texture*/ {
  const texture = context.createTexture();

  // use texture
  context.activeTexture(context["TEXTURE" + textureId]); // context.TEXTURE0
  context.bindTexture(context.TEXTURE_2D, texture);

  // upload texture
  context.texImage2D(
    context.TEXTURE_2D,
    0,
    context.RGB,
    width,
    height,
    0,
    context.RGB,
    context.UNSIGNED_BYTE,
    new Uint8Array(data)
  );

  context.texParameteri(
    context.TEXTURE_2D,
    context.TEXTURE_MAG_FILTER,
    context.NEAREST
  );
  context.texParameteri(
    context.TEXTURE_2D,
    context.TEXTURE_MIN_FILTER,
    context.NEAREST
  );

  context.generateMipmap(context.TEXTURE_2D);

  return texture;
}

function createFrameBuffer(context, texture) {
  const frameBuffer = context.createFramebuffer();

  context.bindFramebuffer(context.FRAMEBUFFER, frameBuffer);
  context.framebufferTexture2D(
    context.FRAMEBUFFER,
    context.COLOR_ATTACHMENT0,
    context.TEXTURE_2D,
    texture,
    0
  );

  return frameBuffer;
}

async function main() {
  const canvas = CANVAS;
  const context = canvas.getContext("webgl");

  const displayProg = buildProgram(
    context,
    "VERTEX_SHADER",
    "FRAGMENT_SHADER_DISPLAY"
  );
  const stepperProg = buildProgram(
    context,
    "VERTEX_SHADER",
    "FRAGMENT_SHADER_STEPPER"
  );

  context.useProgram(stepperProg);

  const stepperProgCoordLoc = context.getAttribLocation(stepperProg, "coord");
  const stepperProgPreviousStateLoc = context.getUniformLocation(
    stepperProg,
    "previousState"
  );

  const displayProgCoordLoc = context.getAttribLocation(displayProg, "coord");
  const displayProgStateLoc = context.getUniformLocation(displayProg, "state");

  const vertexBuffer = context.createBuffer();
  context.bindBuffer(context.ARRAY_BUFFER, vertexBuffer);
  context.bufferData(
    context.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, 1, 1, -1, 1]),
    context.STATIC_DRAW
  );

  context.vertexAttribPointer(
    stepperProgCoordLoc,
    2,
    context.FLOAT,
    false,
    0,
    0
  );

  const elementBuffer = context.createBuffer();
  context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, elementBuffer);
  context.bufferData(
    context.ELEMENT_ARRAY_BUFFER,
    new Uint8Array([0, 1, 2, 3]),
    context.STATIC_DRAW
  );

  const startState = new Uint8Array(SIZE * SIZE * 3);
  for (let i = 0; i < SIZE * SIZE; i++) {
    const intensity = Math.random() < 0.5 ? 255 : 0;
    startState[i * 3] = intensity;
    startState[i * 3 + 1] = 0;
    startState[i * 3 + 2] = 0;
  }

  const texture0 = updateTextureBuffer(context, 0, SIZE, SIZE, startState);
  const texture1 = updateTextureBuffer(context, 1, SIZE, SIZE, startState);
  // function updateTextureGameOfLife(context, textureId, url, top, right, bottom, left, columns, lines, shift)
  //const texture0 = await updateTextureGameOfLife(context, 0, './gol2.jpg', 0, 410,410,0, 36, 21, 10);
  //const texture1 =await updateTextureGameOfLife(context, 1, './gol2.jpg', 0, 410,410,0, 17, 17, 10);

  const framebuffers = [
    context.createFramebuffer(),
    context.createFramebuffer(),
  ];

  context.bindFramebuffer(context.FRAMEBUFFER, framebuffers[0]);
  context.framebufferTexture2D(
    context.FRAMEBUFFER,
    context.COLOR_ATTACHMENT0,
    context.TEXTURE_2D,
    texture0,
    0
  );

  context.bindFramebuffer(context.FRAMEBUFFER, framebuffers[1]);
  context.framebufferTexture2D(
    context.FRAMEBUFFER,
    context.COLOR_ATTACHMENT0,
    context.TEXTURE_2D,
    texture1,
    0
  );

  let nextStateIndex = 0;

  function draw() {
    const previousStateIndex = 1 - nextStateIndex;
    context.bindFramebuffer(context.FRAMEBUFFER, framebuffers[nextStateIndex]);
    context.useProgram(stepperProg);
    context.enableVertexAttribArray(stepperProgCoordLoc);
    context.uniform1i(stepperProgPreviousStateLoc, previousStateIndex);
    context.drawElements(context.TRIANGLE_FAN, 4, context.UNSIGNED_BYTE, 0);

    context.bindFramebuffer(context.FRAMEBUFFER, null);
    context.useProgram(displayProg);
    context.uniform1i(displayProgStateLoc, nextStateIndex);
    context.drawElements(context.TRIANGLE_FAN, 4, context.UNSIGNED_BYTE, 0);

    nextStateIndex = previousStateIndex;

    requestAnimationFrame(draw);
  }

  draw();
}

window.onload = main;
