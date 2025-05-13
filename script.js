import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const selector = document.getElementById('ringSelector');
selector.addEventListener('change', (e) => {
  loadRingModel(e.target.value);
});

const canvas = document.getElementById('three-canvas');
const scene = new THREE.Scene();
const camera3D = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000);
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

camera3D.position.z = 0.5;


// Свет
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 2, 2);
scene.add(light);

// Загрузка модели кольца
let ringModel;
const loader = new GLTFLoader();

// Подключаем MediaPipe Hands и камеру
const videoElement = document.getElementById('video');

const hands = new Hands({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
});

hands.onResults(onResults);

// Инициализация камеры
const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({ image: videoElement });
  },
  width: 640,
  height: 480
});
videoElement.style.transform = "scaleX(-1)"; // отразить видео для пользователя

camera.start();

function onResults(results) {
  if (!ringModel || !results.multiHandLandmarks || results.multiHandLandmarks.length === 0) return;

  const landmarks = results.multiHandLandmarks[0];
  const pointA = landmarks[13]; // середина безымянного пальца
  const pointB = landmarks[14]; // чуть ближе к ногтю

  // Позиция — как обычно
const x = -(pointA.x - 0.5) * 2; // инвертируем X
const y = -(pointA.y - 0.5) * 2;
const z = -pointA.z;
ringModel.position.set(x, y, z);


  // Вектор направления пальца
  const dir = new THREE.Vector3(
    pointB.x - pointA.x,
    -(pointB.y - pointA.y),
    -(pointB.z - pointA.z)
  );
  dir.normalize();

  // Ось поворота: перпендикулярна направлению пальца
  const up = new THREE.Vector3(0, 1, 0);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(up, dir);
  ringModel.setRotationFromQuaternion(quaternion);
}

function loadRingModel(path) {
  loader.load(path, (gltf) => {
    if (ringModel) {
      scene.remove(ringModel);
    }
    ringModel = gltf.scene;
ringModel.scale.set(0.05, 0.05, 0.05);

    scene.add(ringModel);
  }, undefined, (error) => {
    console.error('Error loading model:', error);
  });
}

// Загрузим по умолчанию
loadRingModel(selector.value);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera3D);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
  camera3D.aspect = window.innerWidth / window.innerHeight;
  camera3D.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
console.log(gltf.scene);

