import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import * as CANNON from "cannon-es";

/**
 * Debug Controls
 */

const gui = new GUI();
const debugObject = {};
debugObject.createSphere = () => {
	createSphere(Math.random() * 0.5, {
		x: (Math.random() - 0.5) * 3,
		y: 3,
		z: (Math.random() - 0.5) * 3,
	});
};
gui.add(debugObject, "createSphere");

/**
 * Base
 */

// Canvas
const canvas = document.querySelector(".webgl");
// Scene
const scene = new THREE.Scene();

/**
 * Sounds
 */

/** Textures  */
const textureLoader = new THREE.TextureLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();
const environmentMapTexture = cubeTextureLoader.load([
	"/textures/environmentMaps/0/px.png",
	"/textures/environmentMaps/0/nx.png",
	"/textures/environmentMaps/0/py.png",
	"/textures/environmentMaps/0/ny.png",
	"/textures/environmentMaps/0/pz.png",
	"/textures/environmentMaps/0/nz.png",
]);

/**
 * Pysics
 */

// World
const world = new CANNON.World();
world.broadphase = new CANNON.SAPBroadphase(world);
world.allowSleep = true;
world.gravity.set(0, -9.82, 0);

// Materials
const defaultMaterial = new CANNON.Material("default");
const defaultContactMaterial = new CANNON.ContactMaterial(
	defaultMaterial,
	defaultMaterial,
	{
		friction: 1,
		restitution: 0.7,
	}
);

world.addContactMaterial(defaultContactMaterial);

const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body();
floorBody.mass = 0;
floorBody.addShape(floorShape);
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5);
world.addBody(floorBody);

/**Test sphere */
const sphere = new THREE.Mesh(
	new THREE.SphereGeometry(1, 20, 20),
	new THREE.MeshStandardMaterial({
		metalness: 0.3,
		roughness: 0.4,
		envMap: environmentMapTexture,
		envMapIntensity: 0.5,
	})
);
sphere.castShadow = true;
sphere.position.y = 0.5;
scene.add(sphere);

/**
 * Snow
 */
// Geometry
const snowGeometry = new THREE.BufferGeometry();
const snowCount = 5000;
const positionArray = new Float32Array(snowCount * 3);
for (let i = 0; i < snowCount * 3; i++) {
	positionArray[i] = (Math.random() - 0.5) * 10;
}
snowGeometry.setAttribute(
	"position",
	new THREE.BufferAttribute(positionArray, 3)
);
const snowMaterial = new THREE.PointsMaterial({
	size: 0.008,
	sizeAttenuation: true,
});
const snow = new THREE.Points(snowGeometry, snowMaterial);
scene.add(snow);
/**
 * Floor
 */
const floor = new THREE.Mesh(
	new THREE.PlaneGeometry(10, 10),
	new THREE.MeshStandardMaterial({
		color: "#777777",
		metalness: 0.3,
		roughness: 0.4,
		envMap: environmentMapTexture,
		envMapIntensity: 0.5,
	})
);
floor.receiveShadow = true;
floor.rotation.x = -Math.PI * 0.5;
scene.add(floor);

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight("#ffffff", 2.1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight("#ffffff", 0.6);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

/**
 * Sizes
 */

const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

window.addEventListener("resize", () => {
	// Update sizes
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Update camera
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Update renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
	75,
	sizes.width / sizes.height,
	0.1,
	100
);
camera.position.set(-3, 3, 3);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Utils
 */

/**
 * Animate
 */
const clock = new THREE.Clock();
let oldElapsedTime = 0;

const tick = () => {
	const elapsedTime = clock.getElapsedTime();
	const deltaTime = elapsedTime - oldElapsedTime;
	oldElapsedTime = elapsedTime;

	snow.position.y -= deltaTime * 0.1;

	// Update physics world
	world.step(1 / 60, deltaTime, 3);

	// Upate controls
	controls.update();

	// Render
	renderer.render(scene, camera);

	window.requestAnimationFrame(tick);
};
tick();
