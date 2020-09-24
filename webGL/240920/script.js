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

  const startState = new Uint8Array(512 * 512 * 3);
  for (let i = 0; i < 512 * 512; i++) {
    const intensity = Math.random() < 0.5 ? 255 : 0;
    startState[i * 3] = intensity;
    startState[i * 3 + 1] = intensity;
    startState[i * 3 + 2] = intensity;
  }

  const texture0 = updateTextureBuffer(context, 0, 512, 512, startState);
  const texture1 = updateTextureBuffer(context, 1, 512, 512, startState);

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
