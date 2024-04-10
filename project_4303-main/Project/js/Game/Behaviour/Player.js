import { Character } from './Character.js';
import { State } from './State';

export class Player extends Character {

	constructor(colour) {
		super(colour);
		this.frictionMagnitude = 20;
		this.topSpeed = 10;

		// State
		this.state = new IdleState();

		this.state.enterState(this);

		this.health = 50;
	}

	switchState(state) {
		this.state = state;
		this.state.enterState(this);
	}

	update(deltaTime, gameMap, controller) {
		this.state.updateState(this, controller, gameMap);
		super.update(deltaTime, gameMap);
	}


}

export class IdleState extends State {

	enterState(player) {
		// the player is not moving so velocity vector is 0
		player.velocity.x = 0;
		player.velocity.z = 0;
	}

	updateState(player, controller, gameMap) {
		if (controller.moving()) {
			player.switchState(new MovingState());
		}
	}

}



export class MovingState extends State {

	enterState(player) {
	}

	updateState(player, controller, gameMap) {

		if (!controller.moving()) {
			player.switchState(new IdleState());
		} else {

			// update the flowVectors
			let playerNode = gameMap.quantize(player.location);

			// if the player moves to a different tile update the vectors for all tiles
			if (!gameMap.goals.includes(playerNode)) {
				gameMap.setupSingleGoalFlowField(playerNode);
			}

			let force = controller.direction();
			force.setLength(50);
			player.applyForce(force);
		
		}	
	}
  
}
