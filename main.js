import './style.css'
import * as THREE from './node_modules/three.module.js'

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderrer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

renderrer.setPixelRatio(window.devicePixelRatio);
renderrer.setSize(window.innerWidth, window.innerHeight);

renderrer.render(scene, camera);

const geometry = new THREE.TorusGeometry(10, 1.5, 16, 100);
const material = new THREE.MeshStandardMaterial({color: 0x487db5});
const torus = new THREE.Mesh(geometry, material);

scene.add(torus)



const logotexture = new THREE.TextureLoader().load('/image/squair403x403.jpg');
const logo = new THREE.Mesh(
  new THREE.BoxGeometry(3,3,3),
  new THREE.MeshBasicMaterial({map: logotexture})
);


scene.add(logo);


const pointLight = new THREE.PointLight(0xcfcfcf, 100);
pointLight.position.set(0,0,0)
const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(ambientLight, pointLight)

// const lightHelper = new THREE.PointLightHelper(pointLight)
// const gridHelper = new THREE.GridHelper(200, 50);
// scene.add(lightHelper, gridHelper)


function stars(){
 const geometry = new THREE.SphereGeometry(0.25, 24, 24);
 const material = new THREE.MeshStandardMaterial({color: 0xc7e8f2});
 const star = new THREE.Mesh(geometry,material);

 const[x,y,z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));
 star.position.set(x,y,z);
 scene.add(star);
}

Array(200).fill().forEach(stars)


const spaceTexture = new THREE.TextureLoader().load('/image/space_pic.jpg');
scene.background = spaceTexture;


function animate(){
  requestAnimationFrame(animate)

  torus.rotation.x += 0.005;
  torus.rotation.y += 0.005;
  torus.rotation.z += 0.005;
  
  // controls.update();
  
  renderrer.render(scene, camera);
}

function moveCamera(){
  const t = document.body.getBoundingClientRect().top;
  logo.rotation.x += 0.06;
  logo.rotation.y += 0.06;
  logo.rotation.z += 0.06;

  camera.position.z = t*-0.01;
  camera.position.x = t*-0.0002;
  camera.position.y = t*-0.0002;
}
document.body.onscroll = moveCamera
animate()
