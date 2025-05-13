import * as THREE from './three.module.js';
import { GLTFLoader } from './GLTFLoader.js';

let scene, camera, renderer, ringModel;
let currentRing = 'ring1.glb';

init();
animate();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.z = 2;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const light = new THREE.HemisphereLight(0xffffff, 0x444444);
  scene.add(light);

  loadRingModel(currentRing);

  document.getElementById('ringSelect').addEventListener('change', function (event) {
    const selectedRing = event.target.value;
    if (ringModel) {
      scene.remove(ringModel);
    }
    loadRingModel(selectedRing);
  });

  // камера
  navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
      // video.srcObject = stream; // если используется видео-фид
      console.log('Камера подключена');
    })
    .catch((err) => {
      console.error('Ошибка доступа к камере:', err);
    });
}

function loadRingModel(modelPath) {
  const loader = new GLTFLoader();

  loader.load(
    modelPath,
    function (gltf) {
      ringModel = gltf.scene;
      ringModel.scale.set(0.5, 0.5, 0.5);
      ringModel.position.set(0, 0, 0);
      scene.add(ringModel);
    },
    undefined,
    function (error) {
      console.error('Ошибка загрузки модели:', error);
    }
  );
}

function animate() {
  requestAnimationFrame(animate);
  if (ringModel) ringModel.rotation.y += 0.01;
  renderer.render(scene, camera);
}
