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

function buildVertexShader(context, id) {
  return buildShader(context, context.VERTEX_SHADER, id);
}

function buildFragmentShader(context, id) {
  return buildShader(context, context.FRAGMENT_SHADER, id);
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

function updateAttribute(context, program, attributeName, elementSize, data) {
  // Retrieve attribute in my program
  const attribute = context.getAttribLocation(program, attributeName);

  // create buffer
  const buffer = context.createBuffer();
  context.bindBuffer(context.ARRAY_BUFFER, buffer);
  context.bufferData(
    context.ARRAY_BUFFER,
    new Float32Array(data),
    context.STATIC_DRAW
  );

  // bind attribute to buffer
  context.vertexAttribPointer(
    attribute,
    elementSize,
    context.FLOAT,
    false,
    0,
    0
  );
  context.enableVertexAttribArray(attribute);
}

function updateProgram(context, program, data) {
  const totalAttributes = context.getProgramParameter(
    program,
    context.ACTIVE_ATTRIBUTES
  );
  for (let i = 0; i < totalAttributes; ++i) {
    const { name, size, type } = context.getActiveAttrib(program, i);
    let elementSize = 1;
    switch (type) {
      case context.FLOAT_VEC2:
      case context.INT_VEC2:
      case context.BOOL_VEC2:
        elementSize = 2;
        break;
      case context.FLOAT_VEC3:
      case context.INT_VEC3:
      case context.BOOL_VEC3:
        elementSize = 3;
        break;
      case context.FLOAT_VEC4:
      case context.INT_VEC4:
      case context.BOOL_VEC4:
        elementSize = 4;
        break;
    }
    updateAttribute(context, program, name, elementSize, data[name]);
  }

  const totalUniforms = context.getProgramParameter(
    program,
    context.ACTIVE_UNIFORMS
  );
  for (let i = 0; i < totalUniforms; ++i) {
    const { name, size, type } = context.getActiveUniform(program, i);
    const position = context.getUniformLocation(program, name);
    let elementSize = 1;
    switch (type) {
      case context.FLOAT:
        context.uniform1f(position, ...data[name]);
        break;
      case context.FLOAT_VEC2:
        context.uniform2f(position, ...data[name]);
        break;
      case context.FLOAT_VEC3:
        context.uniform3f(position, ...data[name]);
        break;
      case context.FLOAT_VEC4:
        context.uniform4f(position, ...data[name]);
        break;
    }
  }
}

function radian(degree) {
  var rad = degree * (Math.PI / 180);
  return rad;
}

function renderProgram(context, program, data) {
  // Use the program
  context.useProgram(program);

  // Update data
  updateProgram(context, program, data);

  // Render program
  context.lineWidth(2);

  context.drawArrays(context.TRIANGLE_FAN, 0, 360);
}

function init(context) {
  // Build program
  return buildProgram(context, "VERTEX_SHADER", "FRAGMENT_SHADER");
}

function render(context, program, data) {
  renderProgram(context, program, data);
}

function main() {
  const canvas = CANVAS;
  const context = canvas.getContext("webgl");
  const program = init(context);

  let rotation = [];
  let color = [];
  for (let i = 0; i <= 360; i++) {
    rotation.push(Math.cos(radian(i)), Math.sin(radian(i)));
  }
  render(context, program, {
    canvas: [500, 500],
    position: rotation,
    color: [0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1],
  });
}

window.onload = main;
