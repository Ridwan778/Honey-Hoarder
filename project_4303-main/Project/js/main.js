import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GameMap } from './Game/World/GameMap.js';
import { Character } from './Game/Behaviour/Character.js';
import { NPC } from './Game/Behaviour/NPC.js';
import { Player } from './Game/Behaviour/Player.js';
import { Controller} from './Game/Behaviour/Controller.js';
import { TileNode } from './Game/World/TileNode.js';
import { Resources } from './Util/Resources.js';
import { Bees } from './Game/Behaviour/Bees.js';
import { Beehive } from './Game/Behaviour/Beehive.js';
import { HealthBar } from './Game/World/HealthBar.js';

// Create Scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

const orbitControls = new OrbitControls(camera, renderer.domElement);

// Create clock
const clock = new THREE.Clock();
const clock2 = new THREE.Clock();

// Controller for player
const controller = new Controller(document);

// GameMap
let gameMap;

//health Bar
let healthBar;

// Bear
let bear;


//Bees
let bees = [];

//Beehives
let beehiveArr = [];

let files = [{name: 'beehive', url:'/models/oh_beehive_yourselves.glb'},
			{name: 'bee', url:'/models/bee_minecraft.glb'},
		{name: 'bear', url: '/models/bear_head2.glb'}];
			
const resources = new Resources(files);
await resources.loadAll();


// Setup our scene
function setup() {

	scene.background = new THREE.Color(0xffffff);
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	camera.position.y = 65;
	camera.lookAt(0,0,0);

	//Create Light
	let directionalLight = new THREE.DirectionalLight(0xffffff, 2);
	directionalLight.position.set(0, 5, 5);
	scene.add(directionalLight);

	// initialize our gameMap
	gameMap = new GameMap();
	gameMap.init(scene);
	scene.add(gameMap.gameObject);

	healthBar = new HealthBar(100, 100);
	scene.add(healthBar.group);


	// Create Player
	bear = new Player(new THREE.Color(0xff0000));
	bear.setModel(resources.get("bear"));

	for(let j = 0; j<3; j++){

		//create a new beehive, setting the model and adding it to the scene
		let beehive = new Beehive(new THREE.Color(0xffffff) );
		beehive.setModel(resources.get("beehive"));
		scene.add( beehive.gameObject );

		//get the next number from the halton sequence and find the position vector for that tile
		let startBees = gameMap.getNodeFromHalton();
		beehive.location  = gameMap.localize(startBees);

		// Add bees
		for (var i = 0; i < 5; i++) {
			let b = new Bees(new THREE.Color(0xffffff));
			b.setModel(resources.get("bee"));
			let initialLocation = gameMap.localize(startBees);
			b.location = initialLocation; // since bees and beehive location is the same
			b.setBeehive(beehive);
			b.update(clock.getDelta(), gameMap, controller, bear);
			bees.push(b);

			scene.add(b.gameObject);	
		}

		beehiveArr.push(beehive);
	}
	

	
	// Add the character to the scene
	scene.add(bear.gameObject);

	// Get a random starting place for the enemy
	let startBear = gameMap.graph.getRandomEmptyTile();

	// this is where we start the player
	bear.location = gameMap.localize(startBear);
	
	gameMap.setupSingleGoalFlowField(startBear);

	//First call to animate
	clock2.autoStart = false;
	clock2.start();
	animate();
}


// animate
function animate() {

	healthBar.updateHealthBar(bear.health, 100); 

	if (bear.health <= 0) {

		// update the health bar to show 0 health
		healthBar.updateHealthBar(0, 100);
		console.log("Game Over. Bear health has reached 0");
		return document.getElementById('gameOverPopup').style.display = 'block';
		
	}

	if(bear.health >= 100) {
		console.log("Congratulations! The Bear has stored enough food for its hibernation phase");
		return document.getElementById('congrats').style.display = 'block';
	}

	requestAnimationFrame(animate);
	renderer.render(scene, camera);
	
	let deltaTime = clock.getDelta();

	bear.update(deltaTime, gameMap, controller);

	for (var i = 0; i < bees.length; i++) {

		// Flocking!
		
		// Separate
		let separate = bees[i].separate(bees);
		separate.multiplyScalar(2);
		bees[i].applyForce(separate);

		// Alignment
		let alignment = bees[i].align(bees);
		alignment.multiplyScalar(2);
		bees[i].applyForce(alignment);

		// Cohesion
		let cohesion = bees[i].cohesion(bees);
		cohesion.multiplyScalar(1);
		bees[i].applyForce(cohesion);

		//update states and behaviour for the bees
		bees[i].update(deltaTime, gameMap, controller, bear);

	}

	for (let beehives of beehiveArr){
		beehives.update(deltaTime, gameMap);
	}

	// -10 health penalty every 15 seconds
	if(clock2.getElapsedTime() >= 15){
		bear.health -= 10;
		clock2.start();
		console.log("15 seconds passed: bear loses 10 health", bear.health);
	}

	orbitControls.update();
}

setup();
