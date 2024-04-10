import * as THREE from 'three';
import { VectorUtil } from '../../Util/VectorUtil.js';
import { Character } from './Character.js';

export class NPC extends Character {

	// Character Constructor
	constructor(mColor) {

		super(mColor);

		// NEW
		this.segment = 0;
		this.path = [];
	}


	// Seek steering behaviour
	seek(target) {
		let desired = new THREE.Vector3();
		desired.subVectors(target, this.location);
		desired.setLength(this.topSpeed);

		let steer = new THREE.Vector3();
		steer.subVectors(desired, this.velocity);

	
		return steer;
	}

	// Arrive steering behaviour
	arrive(target, radius) {
		let desired = VectorUtil.sub(target, this.location);

		let distance = desired.length();


		if (distance < radius) {
			let speed = (distance/radius) * this.topSpeed;
			desired.setLength(speed);
			
		} else {
			desired.setLength(this.topSpeed);
		} 

		let steer = VectorUtil.sub(desired, this.velocity);

		return steer;
	}


	flow(gameMap) {

		let node = gameMap.quantize(this.location);

		let steer = new THREE.Vector3();

		if (node != gameMap.goal) {

			let desired = gameMap.flowfield.get(node);
			desired.setLength(this.topSpeed);
			steer = VectorUtil.sub(desired, this.velocity);

		} else {

			let nodeLocation = gameMap.localize(node);
			steer = this.arrive(nodeLocation, gameMap.tileSize/2);

		}
		return steer;

	}

	interactiveFlow(gameMap, player) {
		// let playerNode = gameMap.quantize(player.location);

		// if (!gameMap.goals.includes(playerNode)) {
		// 	gameMap.setupSingleGoalFlowField(playerNode);
		// }

		return this.flow(gameMap);
	}







}