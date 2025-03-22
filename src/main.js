import * as THREE from 'three';
import vertex from '../shaders/vertex.glsl'
import fragment from '../shaders/fragment.glsl'
import gsap from 'gsap'

const scene = new THREE.Scene();
const distance = 20; // Camera distance
const fov = 2 * Math.atan((window.innerHeight / 2) / distance) * (180 / Math.PI); // Correct FOV calculation

const camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.z = distance;

const canvas = document.querySelector("#canvas");
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const img = document.querySelector("img")
const texture = new THREE.TextureLoader().load(img.src)
const imgbounds = img.getBoundingClientRect()
 // Convert from screen space to Three.js world space
 const worldX = imgbounds.left - window.innerWidth / 2 + imgbounds.width / 2;
 const worldY = -(imgbounds.top - window.innerHeight / 2 + imgbounds.height / 2);

const geometry = new THREE.PlaneGeometry(imgbounds.width, imgbounds.height); // 100x100 world units (should match pixels)
const material = new THREE.ShaderMaterial({ 
  uniforms: {
    uTexture : {value: texture},
    uMouse : { value : new THREE.Vector2(0.5,.5)},
    uHover: {value: 0},
    uTime :  {value: 0.0}
  },
  vertexShader: vertex, fragmentShader: fragment });
const plane = new THREE.Mesh(geometry, material);
plane.position.set(worldX,worldY, 0)
scene.add(plane);

const clock = new THREE.Clock()

function animate() {
  requestAnimationFrame(animate);
  
  plane.material.uniforms.uTime.value += clock.getElapsedTime() * .0005
  renderer.render(scene, camera);
}

animate();

let timeout

window.addEventListener("mousemove", (event) => {
  clearTimeout(timeout)

  const bounds = img.getBoundingClientRect();

  // Convert mouse position to UV space (0 to 1)
  const mouseX = (event.clientX - bounds.left) / bounds.width;
  const mouseY = 1.0 - (event.clientY - bounds.top) / bounds.height; // Invert Y for UV space

  gsap.to(plane.material.uniforms.uHover, {
    value: 1,
    duration: .5,
    ease: "linear"
  });

  plane.material.uniforms.uMouse.value.set(mouseX, mouseY);

  timeout = setTimeout(() => {
    gsap.to(plane.material.uniforms.uHover, {
      value: 0,
      duration: 2,
      ease: "linear"
    });
  }, 100);
});

// Reset hover effect smoothly when leaving
window.addEventListener("mouseleave", () => {
  gsap.to(plane.material.uniforms.uHover, {
    value: 0,
    duration: 5,
    ease: "linear"
  });
});

// Resize Handling
window.addEventListener("resize", () => {
  const fov = 2 * Math.atan((window.innerHeight / 2) / distance) * (180 / Math.PI); // Recalculate FOV
  camera.fov = fov;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
