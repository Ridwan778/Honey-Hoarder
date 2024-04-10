import * as THREE from 'three';
import { VectorUtil } from '../../Util/VectorUtil.js';
import { Character } from './Character.js';
import { State } from './State';

export class Bees extends Character {

	// Character Constructor
	constructor(mColor) {

		super(mColor);
        this.size = 1;

		// Create our cone geometry and material
		let coneGeo = new THREE.ConeGeometry(this.size/2, this.size, 10);
		let coneMat = new THREE.MeshStandardMaterial({color: mColor});
		
		// Create the local cone mesh (of type Object3D)
		let mesh = new THREE.Mesh(coneGeo, coneMat);
		// Increment the y position so our cone is just atop the y origin
		mesh.position.y = mesh.position.y+1;
		// Rotate our X value of the mesh so it is facing the +z axis
		mesh.rotateX(Math.PI/2);

		// Add our mesh to a Group to serve as the game object
		this.gameObject = new THREE.Group();
		this.gameObject.add(mesh);		

		// Initialize movement variables
		this.location = new THREE.Vector3(0,0,0);
		this.velocity = new THREE.Vector3(0,0,0);
		this.acceleration = new THREE.Vector3(0, 0, 0);

		this.topSpeed = 10;
		this.mass = 1;
		this.frictionMagnitude = 0;

		// NEW
		this.segment = 0;
		this.path = [];


        // State
		this.state = new InitialState();

		this.state.enterState(this);
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

    // Separate steering behaviour
	separate(characters) {
		// You will want to tune neighbourDistance
		//  to work for your application
		let desiredSeparation = 2;
		let vectorSum = new THREE.Vector3();
		let count = 0;

		// Iterate over all other characters
		for (let i = 0; i < characters.length; i++) {
			let distance = this.location.distanceTo(characters[i].location);

			if ((distance < desiredSeparation) && (distance != 0)) {
				// Get away!!!!!!
				let desiredVelocity = VectorUtil.sub(this.location, characters[i].location);
				desiredVelocity.normalize();
				vectorSum.add(desiredVelocity);
				count++;
			}
		}
		// Can't divide by 0!
		if (count == 0) {
			return new THREE.Vector3();
		}
		// averageVector is our desired velocity
		// Which is the average direction to separate
		let averageVector = VectorUtil.divideScalar(vectorSum, count);
		averageVector.setLength(this.topSpeed);

		// Again, using Reynolds formula, desired velocity - velocity
		let steer = VectorUtil.sub(averageVector, this.velocity);
		
		return steer;
	}

	// Alignment steering behvaiour
	align(characters) {
		// You will want to tune neighbourDistance 
		//  to work for your application
		let neighbourDistance = 3;

		// will be used for average velocity
		let vectorSum = new THREE.Vector3();
		let count = 0;

		// Iterate over all other characters
		for (let i = 0; i < characters.length; i++) {
			let distance = this.location.distanceTo(characters[i].location);

			if ((distance < neighbourDistance) && (distance != 0)) {
				vectorSum.add(characters[i].velocity);
				count++;
			}

		}
		// Can't divide by 0!
		if (count == 0) {
			return new THREE.Vector3();
		}

		// averageVelocity is our desired velocity
		let averageVelocity = VectorUtil.divideScalar(vectorSum, count);
		averageVelocity.setLength(this.topSpeed);
		// Again, using Reynold's formula, desired velocity - velocity
		let steer = VectorUtil.sub(averageVelocity, this.velocity);
		return steer;
	}

	// Cohesion steering behaviour
	cohesion(characters) {
		// You will want to tune neighbourDistance 
		//  to work for your application
		let neighbourDistance = 3;

		let locationSum = new THREE.Vector3();
		let count = 0;

		// Iterate all other characters
		for (let i = 0; i < characters.length; i++) {
			let distance = this.location.distanceTo(characters[i].location);

			if ((distance < neighbourDistance) && (distance != 0)) {
				locationSum.add(characters[i].location);
				count++;
			}
		}
		// Can't divide by 0!
		if (count == 0) {
			return new THREE.Vector3();
		}

		// averageLocation is the average location of
		// all characters within the neighbour distance
		let averageLocation = VectorUtil.divideScalar(locationSum, count);
		let steer = this.seek(averageLocation);
		return steer;

	}


	flow(gameMap, bear) {

		let node = gameMap.quantize(this.location);

		let steer = new THREE.Vector3();

		// if the bees are in a different tile from the player chase the 
		// node location on which the player is currently in
		if (node != gameMap.goals[0]) {

			let desired = gameMap.flowfield.get(node);
			desired.setLength(this.topSpeed);
			steer = VectorUtil.sub(desired, this.velocity);

		} 
		
		// else chase the player location
		else {

			let nodeLocation = gameMap.localize(node);
			//console.log("Bear Location", bear.location);
			steer = this.seek(bear.location);

		}
		return steer;

	}

	interactiveFlow(gameMap, bear) {
		return this.flow(gameMap, bear);
	}

    switchState(state) {
		this.state = state;
		this.state.enterState(this);
	}

	update(deltaTime, gameMap, controller, bear) {
		this.state.updateState(this, controller, gameMap, bear);
		super.update(deltaTime, gameMap);
	}

    setBeehive(beehive){
        this.beehive = beehive;
    }

    






}


export class InitialState extends State {

	enterState(bee) {
		bee.topSpeed = 0; // unless the bear comes to collect the honey the bees don't moce from the beehive
	}

	updateState(bee, controller, gameMap, bear) {

		//since beehive and bees have same location checking if a bear came near the bees 
		//is the same as checking if the bear came near a beehive
		if ( (Math.abs(bee.location.x - bear.location.x) < gameMap.tileSize/4) 
        && (Math.abs(bee.location.z - bear.location.z) < gameMap.tileSize/4) ) {

			setTimeout(() => {

				// we increase the health by 15 only once 
				if(bee.beehive.isPickedUp == false){
					bee.beehive.isPickedUp = true;
					bear.health += 15;
					console.log("Picked Food, Current Health: ", bear.health);

				}
		
                bee.switchState(new ChasingState());
            }, 1000);
		}
	}

}

export class ChasingState extends State {

	enterState(bee) {
		bee.topSpeed = 10; //same as the bear but flocking movement will actually slow it down
	}

	updateState(bee, controller, gameMap, bear) {

		//chase the bear using the flowfield vectors
        let steer = bee.interactiveFlow(gameMap, bear);
		steer.multiplyScalar(4);
		bee.applyForce(steer);

		//if the bees manage to sting the bear
		if ( (Math.abs(bee.location.x - bear.location.x) < gameMap.tileSize/4) 
        && (Math.abs(bee.location.z - bear.location.z) < gameMap.tileSize/4) ) {
            bear.health -= 5;
            console.log("Stung Bear, Current Health: ", bear.health);
			bee.switchState(new TransitionState());
            return;
		}

        let beeTile = gameMap.quantize(bee.location);

		// if the bear manage to outrun the bees
        if (gameMap.heatmap.get(beeTile) > gameMap.tileSize*3){
            bee.switchState(new TransitionState());
            return;
        }
	}

}

export class TransitionState extends State {

	enterState(bee) {

	}

	updateState(bee, controller, gameMap, bear) {

		// we relocate the beehive when the bear is stung by a bee or when it manages to outrun one of them
		// we do this once for every 5 bees that enter transitionState()
		if (bee.beehive.count == 0){
			if (bee.beehive.isPickedUp == true) bee.beehive.isPickedUp = false; // we restore the food in the beehive
			let node = gameMap.getNodeFromHalton();
			bee.beehive.location = gameMap.localize(node); // relocate the beehive to the next location in halton sequence
			bee.beehive.count = 0;
		}
        
        let newLocation = bee.beehive.location.clone();
        bee.location = newLocation; // relocate the bees to the new beehive location
       
        bee.topSpeed = 0;
        
        bee.beehive.count++;
        if (bee.beehive.count == 5) bee.beehive.count = 0;

		bee.switchState(new InitialState());
	}

}

