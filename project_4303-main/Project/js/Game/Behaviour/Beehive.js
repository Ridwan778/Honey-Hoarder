import { Character } from './Character.js';
import * as THREE from 'three';

export class Beehive extends Character {

	constructor(mcolour) {
		super(mcolour);
        this.topSpeed = 0; // the beehive should never move(only relocate) so topspeed 0

        this.size = 3;

		// Create our cone geometry and material
		let coneGeo = new THREE.BoxGeometry(this.size, this.size, this.size);
		let coneMat = new THREE.MeshStandardMaterial({color: mcolour});
		
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

		this.topSpeed = 0;  // the beehive should never move(only relocate) so topspeed 0
		this.mass = 1;
		this.frictionMagnitude = 0;

        this.count = 0;

		this.isPickedUp = false;

	}

}