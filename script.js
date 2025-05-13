import * as THREE from 'https://cdn.skypack.dev/three@0.152.2';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.152.2/examples/jsm/loaders/GLTFLoader.js';

let scene, camera, renderer, loader;
let model;
let currentModelPath = 'ring1.glb'; // Золото по умолчанию

init();
animate();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 2;

  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  loader = new GLTFLoader();

  // Загрузка первого кольца
  loadRingModel(currentModelPath);

  // Камера
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
    })
    .catch(err => {
      console.error("Ошибка доступа к камере:", err);
    });

  // Смена кольца
  document.getElementById('ringSelect').addEventListener('change', event => {
    const value = event.target.value;
    if (value === 'Золотое кольцо') currentModelPath = 'ring1.glb';
    if (value === 'Серебряное кольцо') currentModelPath = 'ring2.glb';
    if (value === 'Платиновое кольцо') currentModelPath = 'ring3.glb';
    loadRingModel(currentModelPath);
  });
}

function loadRingModel(path) {
  if (model) {
    scene.remove(model);
  }

  loader.load(
    path,
    function (gltf) {
      model = gltf.scene;
      model.scale.set(0.5, 0.5, 0.5);
      scene.add(model);
    },
    undefined,
    function (error) {
      console.error('Ошибка загрузки модели:', error);
    }
  );
}

function animate() {
  requestAnimationFrame(animate);
  if (model) model.rotation.y += 0.01;
  renderer.render(scene, camera);
}
