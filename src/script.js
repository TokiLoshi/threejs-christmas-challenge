import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import * as CANNON from "cannon-es";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";

/**
 * Debug Controls
 */
const gui = new GUI();
const debugObject = {};

/** Debugging */

const addSound = new Audio("/sounds/adding.mp3");
const cleanUpSound = new Audio("/sounds/cleanup.mp3");
// Add Presents
console.log(addSound);
debugObject.addPresents = () => {
	console.log("Time to add some presents");
	addPresents(Math.random(), Math.random(), Math.random(), {
		x: (Math.random() - 0.5) * 3,
		y: 3,
		z: (Math.random() - 0.5) * 3,
	});
	console.log("Adding Presents");
	addSound.currentTime = 0;
	addSound.play();
};
gui.add(debugObject, "addPresents");

// Add Reset
debugObject.cleanUp = () => {
	for (const object of objectsToUpdate) {
		// Remove body
		world.removeBody(object.body);
		scene.remove(object.mesh);
	}
	objectsToUpdate.splice(0, objectsToUpdate.length);
	cleanUpSound.play();
};
gui.add(debugObject, "cleanUp");

/**
 * Base
 */

// Canvas
const canvas = document.querySelector(".webgl");
// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color("#22092C");

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

const textures = [
	textureLoader.load("/textures/2.png"),
	textureLoader.load("/textures/2.png"),
	textureLoader.load("/textures/3.png"),
	textureLoader.load("/textures/4.png"),
	textureLoader.load("/textures/5.png"),
	textureLoader.load("/textures/6.png"),
	textureLoader.load("/textures/7.png"),
	textureLoader.load("/textures/8.png"),
	textureLoader.load("/textures/9.png"),
	textureLoader.load("/textures/10.png"),
	textureLoader.load("/textures/11.png"),
	textureLoader.load("/textures/12.png"),
	textureLoader.load("/textures/13.png"),
	textureLoader.load("/textures/14.png"),
	textureLoader.load("/textures/15.png"),
];
// const sphereTest = new THREE.TextureLoader().load("/textures/1.png");
const snowTexture = textureLoader.load("/textures/16.png");

/**
 * Models
 */

const loader = new GLTFLoader();
let modelPosition = {};
// const dracoLoader = new DRACOLoader();
loader.load(
	// "textures/snowman1.glb",
	"models/snowman1.glb",
	(gltf) => {
		// gltf.scene.scale.set(20, 20, 20);
		// console.log(gltf);
		gltf.scene.position.y = -0.3;
		gltf.scene.position.x = -1;
		gltf.scene.rotation.y = Math.PI * 0.45;
		gltf.scene.castShadow = true;
		gltf.scene.traverse((child) => {
			if (child instanceof THREE.Mesh) {
				child.castShadow = true;
				child.receiveShadow = true;
				child.geometry.computeBoundingSphere();
				// console.log(child.name, child.geometry.boundingSphere);
			}
		});
		scene.add(gltf.scene);
	},
	undefined,
	(error) => {
		console.log(error);
	}
);

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
		restitution: 0.3,
	}
);

world.addContactMaterial(defaultContactMaterial);

// Floor
const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body({
	mass: 0,
	shape: floorShape,
	material: defaultMaterial,
});
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5);
floorBody.position.set(0, 0.1, 0);
world.addBody(floorBody);

// Snowman
const snowmanPosition = new CANNON.Vec3(-1, -0.3, 0);

// Create the spheres based on the provided diameters (divide by 2 for radius)
const bottomRadius = 1.84 / 2;
const middleRadius = 1.35 / 2;
const topRadius = 1.15 / 2;

// Create sphere shapes
const bottomSphereShape = new CANNON.Sphere(bottomRadius);
const middleSphereShape = new CANNON.Sphere(middleRadius);
const topSphereShape = new CANNON.Sphere(topRadius);
const snowmanBody = new CANNON.Body({ mass: 0 });

// Calculate the position of the bottom sphere (touching the ground)
const bottomSpherePos = new CANNON.Vec3(
	snowmanPosition.x,
	snowmanPosition.y + bottomRadius,
	snowmanPosition.z
);

const middleSpherePos = new CANNON.Vec3(
	snowmanPosition.x,
	bottomSpherePos.y + bottomRadius + middleRadius,
	snowmanPosition.z
);

const topSpherePos = new CANNON.Vec3(
	snowmanPosition.x,
	middleSpherePos.y + middleRadius + topRadius,
	snowmanPosition.z
);

// Add the shapes to the snowman body
snowmanBody.addShape(bottomSphereShape, bottomSpherePos);
snowmanBody.addShape(middleSphereShape, middleSpherePos);
snowmanBody.addShape(topSphereShape, topSpherePos);
world.addBody(snowmanBody);

/**
 * Utils
 */
const objectsToUpdate = [];

// Presents
const presentGeometry = new THREE.BoxGeometry(1, 1, 1);

const addPresents = (width, height, depth, position) => {
	const texture = textures[Math.floor(Math.random() * textures.length)];
	const presentMaterial = new THREE.MeshStandardMaterial({
		map: texture,
		bumpScale: 0.5,
		// color: "#eeC31B",
		metalness: 0.3,
		// roughness: 0.4,
		// envMap: environmentMapTexture,
		// envMapIntensity: 0.5,
	});
	// Three mesh
	const mesh = new THREE.Mesh(presentGeometry, presentMaterial);
	mesh.scale.set(width, height, depth);
	mesh.castShadow = true;
	mesh.position.copy(position);
	scene.add(mesh);

	// Cannon.js body
	const shape = new CANNON.Box(
		new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5)
	);

	const body = new CANNON.Body({
		mass: 1,
		position: new CANNON.Vec3(0.1, 3, 0.1),
		shape: shape,
		material: defaultMaterial,
	});
	body.position.copy(position);
	world.addBody(body);
	objectsToUpdate.push({ mesh, body });
};

addPresents(1, 1.5, 2, {
	x: 0.1,
	y: 3,
	z: 0.01,
});

/**
 * Snow
 */
// Geometry
const snowGeometry = new THREE.BufferGeometry();
const snowCount = 30000;
const positionArray = new Float32Array(snowCount * 3);
for (let i = 0; i < snowCount * 3; i++) {
	positionArray[i] = (Math.random() - 0.5) * 10;
}
snowGeometry.setAttribute(
	"position",
	new THREE.BufferAttribute(positionArray, 3)
);
const snowMaterial = new THREE.PointsMaterial({
	size: 0.003,
	sizeAttenuation: true,
});
snowMaterial.depthWrite = false;
snowMaterial.blending = THREE.AdditiveBlending;

const snow = new THREE.Points(snowGeometry, snowMaterial);
scene.add(snow);

/**
 * Floor
 */
const floor = new THREE.Mesh(
	new THREE.PlaneGeometry(10, 10),
	new THREE.MeshStandardMaterial({
		map: snowTexture,
		// metalness: 0.3,
		// roughness: 0.4,
		// envMap: environmentMapTexture,
		// envMapIntensity: 0.5,
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
renderer.gammaOutput = true;
renderer.gammaFactor = 2.2;

/**
 * Animate
 */
const clock = new THREE.Clock();
let oldElapsedTime = 0;

const tick = () => {
	const elapsedTime = clock.getElapsedTime();
	const deltaTime = elapsedTime - oldElapsedTime;
	oldElapsedTime = elapsedTime;

	// snow.position.y -= deltaTime * 0.1;
	const positions = snowGeometry.attributes.position.array;
	for (let i = 0; i < snowCount; i += 3) {
		positions[i + 1] -= deltaTime * 0.1;
		positions[i] += Math.sin(elapsedTime * 0.1 + i) * 0.2 * deltaTime;
		if (positions[i + 1] < -5) {
			positions[i + 1] = 5;
			positions[i] = (Math.random() - 0.5) * 10;
			positions[i + 2] = (Math.random() - 0.5) * 10;
		}
	}
	snowGeometry.attributes.position.needsUpdate = true;

	// Update physics world
	world.step(1 / 60, deltaTime, 3);
	for (const object of objectsToUpdate) {
		object.mesh.position.copy(object.body.position);
		object.mesh.quaternion.copy(object.body.quaternion);
	}

	// Upate controls
	controls.update();

	// Render
	renderer.render(scene, camera);

	window.requestAnimationFrame(tick);
};
tick();
