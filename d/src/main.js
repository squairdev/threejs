import * as THREE from "three";
import { OrbitControls} from '../threejs/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from '../threejs/examples/jsm/loaders/GLTFLoader.js';
import GUI from '../threejs/examples/jsm/libs/lil-gui.module.min.js';

import * as CANNON from "../cannonjs/cannon-es.js";
import CannonDebugger from "../cannonjs/cannon-es-debugger.js";

let elThreejs = document.getElementById("threejs");
let camera,scene,renderer;
// helpers to debug
let controls;
let gui;

// show and move cube
let cubeThree;
let keyboard = {};

// camera follow player
let enableFollow = true;

// cannon variables
let world;
let cannonDebugger;
let timeStep = 1 / 60;
let cubeBody, planeBody;
let slipperyMaterial, groundMaterial;
let obstacleBody;
let carCubeBody;
let carBoxBodies = [];
let carBoxMeshes = [];
let obstaclesBodies = [];
let obstaclesMeshes = [];
let ablemove = false;
init();
window.loadd = function() {
  unblur()
  const startup = document.getElementById("home");
  startup.remove();
}
function unblur(){
  const home = document.getElementById('threejs');
  home.style.animation = "blur 0.5s ease"
  setTimeout(function(){home.style.filter = "blur(0px)"}, 500);
  
  ablemove = true;
}
async function init() {

  // Scene
	scene = new THREE.Scene();

  // Camera
	camera = new THREE.PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	);
  camera.position.z = 10;
  camera.position.y = 5;


  // render
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true;
	renderer.outputEncoding = THREE.sRGBEncoding;

  const ambient = new THREE.HemisphereLight(0x8f8f8f, 0x050512);
  scene.add(ambient);

  const light = new THREE.DirectionalLight(0x8f8f8f, 0.5);
  light.position.set( 1, 10, 6);
  scene.add(light);
  


  // axesHelper
	// axesHelper = new THREE.AxesHelper( 100 );
	// scene.add( axesHelper );

  // orbitControls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.rotateSpeed = 1.0
  controls.zoomSpeed = 1.2
  controls.enablePan = false
  controls.dampingFactor = 0.2
  controls.minDistance = 10
  controls.maxDistance = 500
  controls.enabled = false

	elThreejs.appendChild(renderer.domElement);

  initCannon();
  console.log('cannon init complete')

  addBackground();
  console.log('background loaded')

  addPlaneBody();
  addPlane();
  console.log('ground loaded')

  addCubeBody();
  await addCube();
  console.log('player loaded')

  for (let i = 0; i<15;i++){
    addObstacleBody();
    addObstacle();
  }
  addCarBoxes()
  addCarBoxes()
  addCarBoxes()
  console.log('obstacles loaded')

  addContactMaterials();

  addKeysListener();
	addGUI();
  console.log('litseners and GUI loaded')
  animate()
}

function animate(){
	renderer.render(scene, camera);
  renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
  camera = new THREE.PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.2,
		1000
	);
  if (enableFollow) followPlayer();
  movePlayer();

  

  world.step(timeStep);
	cannonDebugger.update();

  cubeThree.position.copy(cubeBody.position);
  cubeThree.position.y = cubeBody.position.y - 1.3;
  cubeThree.quaternion.copy(cubeBody.quaternion);

  for (let i = 0; i < obstaclesBodies.length; i++) {
    obstaclesMeshes[i].position.copy(obstaclesBodies[i].position);
		obstaclesMeshes[i].quaternion.copy(obstaclesBodies[i].quaternion);
	}
  for (let i = 0; i < carBoxBodies.length; i++) {
    carBoxMeshes[i].position.copy(carBoxBodies[i].position);
		carBoxMeshes[i].quaternion.copy(carBoxBodies[i].quaternion);
	}

	requestAnimationFrame(animate);

}

function addCubeBody(){
  let cubeShape = new CANNON.Box(new CANNON.Vec3(1.6,0.15,1.1));
  slipperyMaterial = new CANNON.Material('slippery');
  cubeBody = new CANNON.Body({ mass: 100,material: slipperyMaterial });
  cubeBody.addShape(cubeShape, new CANNON.Vec3(-1,-1.503,0));
  const d = new CANNON.Box(new CANNON.Vec3(1,1,1))
  let wall1 = new CANNON.Box(new CANNON.Vec3(1.6,0.45,0.1));
  cubeBody.addShape(wall1, new CANNON.Vec3(-1,-0.82,-1.05));
  let wall2 = new CANNON.Box(new CANNON.Vec3(1.6,0.45,0.1));
  cubeBody.addShape(wall2, new CANNON.Vec3(-1,-0.82,1.05));
  let wall3 = new CANNON.Box(new CANNON.Vec3(0.05,0.45,1.3));
  cubeBody.addShape(wall3, new CANNON.Vec3(-2.3,-0.82,0));
  
  const polyhedronShape = new CANNON.Box(new CANNON.Vec3(1.3,0.7,1))
  cubeBody.addShape(polyhedronShape, new CANNON.Vec3(1.2, -0.9, 0));
  // change rotation
  cubeBody.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);


  cubeBody.position.set(0, 3, 0);

  cubeBody.linearDamping = 0.5;

  world.addBody(cubeBody);
}

async function addCube(){
  // let geometry = new THREE.BoxGeometry(2,2,2);
  // let material = new THREE.MeshBasicMaterial({color: 'pink'});
  // cubeThree = new THREE.Mesh(geometry, material);
  // cubeThree.position.set(0, 1, 0);
  // console.log(cubeThree, "cube");
  // scene.add(cubeThree);


  const gltfLoader = new GLTFLoader().setPath( 'src/assets/' );
	const carLoaddedd = await gltfLoader.loadAsync( 'cartest.glb' );
  
  cubeThree = carLoaddedd.scene.children[0];
  scene.add(cubeThree);
}


function addPlaneBody(){
  groundMaterial = new CANNON.Material('ground')
  const planeShape = new CANNON.Box(new CANNON.Vec3(100, 0.01, 100));
	planeBody = new CANNON.Body({ mass: 0, material: groundMaterial });
	planeBody.addShape(planeShape);
	planeBody.position.set(0, 0, 0);
	world.addBody(planeBody);
}



function addPlane(){
  const texture = new THREE.TextureLoader().load( "src/assets/ground.png" );

  let geometry =  new THREE.BoxGeometry(200, 0, 200);
  let material = new THREE.MeshBasicMaterial({map: texture});
  let planeThree = new THREE.Mesh(geometry, material);
  planeThree.position.set(0, 0, 0);
  scene.add(planeThree);
}
function getRandomNumber(min, max) {
  
}

let randomNumber = getRandomNumber(-100, 100);
function addObstacleBody(){

  for (let i = 0; i < 5; i++) {
    
    let obstacleShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1));
    obstacleBody = new CANNON.Body({ mass: 1 });
    obstacleBody.addShape(obstacleShape);
		obstacleBody.position.set(Math.floor(Math.random() * (-100 - 100)) + 100, 5,Math.floor(Math.random() * (-100 - 100)) + 100);
    
    world.addBody(obstacleBody);
    obstaclesBodies.push(obstacleBody);

  }
}

function addObstacle(){
 
  let geometry = new THREE.BoxGeometry(2,2,2);
  const texture = new THREE.TextureLoader().load( "src/assets/boxProto.png" );

  let material = new THREE.MeshBasicMaterial({ map: texture});

  let obstacle = new THREE.Mesh(geometry, material);

  for (let i = 0; i < 5; i++) {
		let obstacleMesh = obstacle.clone();
		scene.add(obstacleMesh);
		obstaclesMeshes.push(obstacleMesh);
	}
}

function addCarBoxes(){
  let rand = Math.floor(Math.random()*8)/8;
  console.log(rand)
  let carBoxShape = new CANNON.Box(new CANNON.Vec3(rand/2,rand/2,rand/2));
  carCubeBody = new CANNON.Body({mass: 0.5});
  carCubeBody.addShape(carBoxShape);
  carCubeBody.position.set(0, rand+2.5, 1)

  world.addBody(carCubeBody);
  carBoxBodies.push(carCubeBody);


  let geometry = new THREE.BoxGeometry(rand,rand,rand);
  const texture = new THREE.TextureLoader().load( "src/assets/boxProto.png" );

  let material = new THREE.MeshBasicMaterial({ map: texture});

  let box = new THREE.Mesh(geometry, material);

	let carBoxMesh = box.clone();
	scene.add(carBoxMesh);
	carBoxMeshes.push(carBoxMesh);
}

function addContactMaterials(){
  const slippery_ground = new CANNON.ContactMaterial(groundMaterial, slipperyMaterial, {
    friction: 0.00,
    restitution: 0.1, //bounciness
    contactEquationStiffness: 1e8,
    contactEquationRelaxation: 3,
  })

  // We must add the contact materials to the world
  world.addContactMaterial(slippery_ground)

}


function addKeysListener(){
  window.addEventListener('keydown', function(event){
    keyboard[event.keyCode] = true;
  } , false);
  window.addEventListener('keyup', function(event){
    keyboard[event.keyCode] = false;
  } , false);
}

function movePlayer() {
  if (ablemove){
  const strengthWS = 600;
  let addPower = 1;
  let Wpressed;
  let Spressed;
  
  if (keyboard[87] || keyboard[38]) {
    if (keyboard[16]){
      addPower = 500; 
      const bar = document.getElementById('bar'); 
      bar.style.backgroundColor = '#42f593';
      bar.style.width = '500px'
    }
    else if (!keyboard[16]){
      const bar = document.getElementById('bar');
      bar.style.width = '350px'
    }
    const forceForward = new CANNON.Vec3(strengthWS+addPower, 0, 0);
    cubeBody.applyLocalForce(forceForward); 
    Wpressed = true; 
    

    } // W key
    

  if (keyboard[83] || keyboard[40]) {
    if (keyboard[16]){
      addPower = 500; 
      const bar = document.getElementById('bar'); 
      bar.style.backgroundColor = '#42f593';
      bar.style.width = '500px'
    }
    else if (!keyboard[16]){
      const bar = document.getElementById('bar');
      bar.style.width = '350px'
    }
    const forceBack = new CANNON.Vec3(-strengthWS-addPower, 0, 0); 
    cubeBody.applyLocalForce(forceBack); 
    Spressed = true} // S key

  if (Wpressed || Spressed){
    const bar = document.getElementById('bar');
    bar.style.backgroundColor = '#42f593';
  }else{
    const bar = document.getElementById('bar'); 
    bar.style.backgroundColor = '#d14a3b'
    bar.style.width = '300px'
  }
  
  const torqueStrength = 185; // Base torque strength
  const maxAngularVelocity = 5; // Max angular velocity limit, how much the car can turn while both held down
  const angularDamping = 0.045; // Damping rate, how fast the car turn slows down

  // Handle left movement (A key)
  if (keyboard[68] || keyboard[39]) {
    if (Wpressed){
      let ts = torqueStrength;
      cubeBody.applyTorque(new CANNON.Vec3(0, -ts, 0));
      ts-=10; // Apply left torque  
    }
    if (Spressed){
      let ts = torqueStrength;
      cubeBody.applyTorque(new CANNON.Vec3(0, ts, 0));
      ts-=10; // Apply left torque  
    }
  }
  // Handle right movement (D key)
  if (keyboard[65] || keyboard[37]) {
    if (Wpressed){
      let ts = torqueStrength;
      cubeBody.applyTorque(new CANNON.Vec3(0, ts, 0));
      ts-=10; // Apply right torque
    }
    if (Spressed){
      let ts = torqueStrength;
      cubeBody.applyTorque(new CANNON.Vec3(0, -ts, 0));
      ts-=10; // Apply right torque
    }
  }

  // Damping effect when no keys are pressed
  if (!keyboard[65] && !keyboard[68] && !keyboard[37] && !keyboard[39]) {
      // Reduce angular velocity gradually
      cubeBody.angularVelocity.y *= (1 - angularDamping);
      // Clamp the angular velocity to prevent it from going too low
      if (Math.abs(cubeBody.angularVelocity.y) < 0.1) {
          cubeBody.angularVelocity.y = 0;
      }
  }

  // Clamp the angular velocity to the max limit
  cubeBody.angularVelocity.y = Math.max(-maxAngularVelocity, Math.min(maxAngularVelocity, cubeBody.angularVelocity.y));
  }
}
function followPlayer(){
  camera.position.x = cubeThree.position.x;
  camera.position.y = cubeThree.position.y + 5.3;
  camera.position.z = cubeThree.position.z + 10;
  camera.quaternion.setFromAxisAngle(new THREE.Vector3(0.5, 0, 0), Math.PI / -5);
}


function addGUI(){
  gui = new GUI();
  const options = {
		orbitsControls: false
	}

  gui.add(options, 'orbitsControls').onChange( value => {
		if (value){
			controls.enabled = true;
			enableFollow = false;
		}else{
			controls.enabled = false;
			enableFollow = true;
		}
	});
  gui.hide();


  // show and hide GUI if user press g
  window.addEventListener('keydown', function(event){
    if(event.keyCode == 71){
      if(gui._hidden){
        gui.show();
      }else{
        gui.hide();
      }
    }
  })


}

function initCannon() {
	// Setup world
	world = new CANNON.World();
	world.gravity.set(0, -9.8, 0);

	initCannonDebugger();
}

function initCannonDebugger(){
  cannonDebugger = new CannonDebugger(scene, world, {
		onInit(body, mesh) {
      mesh.visible = false;
			// Toggle visibiliy on "d" press
			document.addEventListener("keydown", (event) => {
				if (event.key === "f") {
					mesh.visible = !mesh.visible;
				}
			});
		},
	});
}

async function addBackground(){
	const gltfLoader = new GLTFLoader().setPath( 'src/assets/' );

	const mountainLoaded = await gltfLoader.loadAsync( 'duskmount.glb' );
	let mountainMesh = mountainLoaded.scene.children[0];
	mountainMesh.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 180 *90);
	mountainMesh.position.set(0, 60, -90);
	mountainMesh.scale.set(0.008,0.008,0.008);
	scene.add(mountainMesh);

	const domeLoaded = await gltfLoader.loadAsync( 'dusk.glb' );
	let domeMesh = domeLoaded.scene.children[0];
	domeMesh.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 180 *90);
	domeMesh.position.set(0, -40, 0);
	domeMesh.scale.set(0.1, 0.1, 0.1);
	scene.add(domeMesh);
  
}