import * as THREE from 'three';

export class Controller {
	// Controller Constructor
	constructor(doc) {
		this.doc = doc;
		this.left = false;
		this.right = false;
		this.forward = false;
		this.backward = false;

		this.doc.addEventListener('keydown', this);
		this.doc.addEventListener('keyup', this);
	}

	handleEvent(event) {
		if (event.type == 'keydown') {
			switch (event.code) {
				case("ArrowUp"): 
					this.forward = true;
					break;
				case("ArrowDown"):
					this.backward = true;
					break;
				case("ArrowLeft"):
					this.left = true;
					break;
				case("ArrowRight"):
					this.right = true;
					break;
			}
	
		}
		else if (event.type == 'keyup') {
			switch (event.code) {
				case("ArrowUp"): 
					this.forward = false;
					break;
				case("ArrowDown"):
					this.backward = false;
					break;
				case("ArrowLeft"):
					this.left = false;
					break;
				case("ArrowRight"):
					this.right = false;
					break;
			}
		}
	}
	
	destroy() {
		this.doc.removeEventListener('keydown', this);
		this.doc.removeEventListener('keyup', this);
	}

	moving() {
		if (this.left || this.right || this.forward || this.backward)
			return true;
		return false;
	}


	direction() {
		let direction = new THREE.Vector3();

		if (this.left) {
			direction.x = -1;
		}
		if (this.right) {
			direction.x = 1;
		}

		if (this.forward) {
			direction.z = -1;
		}
		if (this.backward) {
			direction.z = 1;
		}

		return direction;
	}


}
