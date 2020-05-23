uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float circleShape(vec2 position, float radius) {
    return step(radius, length(position-vec2(0.5, 0.5)));
}

void main() {
    vec2 position = gl_FragCoord.xy/u_resolution;
    vec3 color= vec3(0.0);
    
    float circle = circleShape(position, 0.2);
    color = vec3(circle);
    
    gl_FragColor = vec4(color,1.0);
}
