uniform sampler2D uTexture;
uniform vec2 uMouse;
uniform float uHover;
uniform float uTime;
varying vec2 vUv;

void main() {
    // Create pixelation grid
    float pixels = 1000.0; // Adjust for pixel size
    vec2 pixelatedUV = floor(vUv * pixels) / pixels;
    
    // Calculate distance from mouse
    float distance = length(vUv - uMouse);
    float hoverMask = smoothstep(.5, 0.0, distance) * uHover;
    
    // Create glitch effect on hover
    vec2 distortedUV = vUv;
    if (hoverMask > 0.0) {
        // Random offset based on position and time
        float noise = fract(sin(dot(pixelatedUV, vec2(12.9898, 78.233)) + uTime) * 43758.5453);
        vec2 offset = vec2(noise *.05  - .0) * hoverMask;
        distortedUV = mix(vUv, pixelatedUV + offset, hoverMask);
    }
    
    // Sample texture with distortion
    vec4 color = texture2D(uTexture, distortedUV);
    
    gl_FragColor = color;
}
