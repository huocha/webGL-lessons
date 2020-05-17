(function () {
  const canvas = document.getElementById("game-surface");
  let gl = canvas.getContext("webgl");
  if (!gl) {
    alert("Doesn't support WebGL");
  }
  gl.clearColor(0.75, 0.85, 0.8, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const vertexShaderSource = document.querySelector("#vertex-shader-2d").text;
  const fragmentShaderSource = document.querySelector("#fragment-shader-2d")
    .text;

  let vertexShader = gl.createShader(gl.VERTEX_SHADER);
  let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.shaderSource(fragmentShader, fragmentShaderSource);

  gl.compileShader(vertexShader);
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.error("ERROR compiling vertex", gl.getShaderInfoLog(vertexShader));
  }
  gl.compileShader(fragmentShader);
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.error(
      "ERROR compiling fragment",
      gl.getShaderInfoLog(fragmentShader)
    );
  }

  let program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("ERROR linking program", gl.getProgramInfoLog(program));
  }
  gl.validateProgram(program);
  if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
    console.error("ERROR validating program", gl.getProgramInfoLog(program));
  }

  // Create buffer
  // X,Y  R,G,B
  const triangleVertices = [
    0.0,
    0.5,
    1.0,
    1.0,
    0.0,

    -0.5,
    -0.5,
    0.7,
    0.0,
    1.0,

    0.5,
    -0.5,
    0.1,
    1.0,
    0.6,
  ];
  let triangleVertexBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(triangleVertices),
    gl.STATIC_DRAW
  );

  let positionAttribLocation = gl.getAttribLocation(program, "vertPosition");
  let colorAttribLocation = gl.getAttribLocation(program, "vertColor");
  gl.vertexAttribPointer(
    positionAttribLocation,
    2, // number of element per attribute,
    gl.FLOAT,
    gl.FALSE,
    5 * Float32Array.BYTES_PER_ELEMENT, // size of an individual vertex
    0
  );

  gl.vertexAttribPointer(
    colorAttribLocation,
    3, // number of element per attribute,
    gl.FLOAT,
    gl.FALSE,
    5 * Float32Array.BYTES_PER_ELEMENT, // size of an individual vertex
    2 * Float32Array.BYTES_PER_ELEMENT
  );

  gl.enableVertexAttribArray(positionAttribLocation);
  gl.enableVertexAttribArray(colorAttribLocation);

  gl.useProgram(program);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
})();

function vertexShader(vertPosition, vertColor) {
  return {
    fragColor: vertColor,
    gl_Position: [vertColor.x, vertPosition.y, 0.0, 1.0],
  };
}

// vertexShaderText = [
//   "precision mediump float;",
//   "",
//   "attribute vec2 vertPosition;",
//   "void main()",
//   "",
//   "{",
//   " gl_Position = vec4(vertPosition, 0.0, 1.0);",
//   "}",
// ].join("\n");

// fragmentShaderText = [
//   "precision mediump float;",
//   "",
//   "void main()",
//   "{",
//   " gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0)",
//   "}",
// ].join("\n");
