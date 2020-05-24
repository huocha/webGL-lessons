# webGL-lessons

Ref: https://thebookofshaders.com/

### Install glslViewer

brew update
brew install glslViewer

### Run glslViewer

glslViewer file_name.frag

### Vertex shaders need data. They can get that data in 3 ways.

- Attributes (data pulled from buffers)
- Uniforms (values that stay the same for all vertices of a single draw call)
- Textures (data from pixels/texels)

### Fragment shaders need data. They can get data in 3 ways

- Uniforms (values that stay the same for every pixel of a single draw call)
- Textures (data from pixels/texels)
- Varyings (data passed from the vertex shader and interpolated)
