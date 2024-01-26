import { GLOBALS } from '../globals.js';
import { 
	getCollisionBox, 
	willCollideWithEntities
} from '../utils.js';

import SentryModel from './sentry.js';
import SentryJumperView from '../views/sentry-jumper.js';

class SentryJumperModel extends SentryModel {

	constructor(props){
		super(props, true);

		this.state = Object.assign({}, this.state, {
			type: 'sentry',
			maxJumpTicks: 		10, // 15
			maxJumpStrength:	8, // 12
			initJumpStrength: 	8 // 8
		});

		this.view = new SentryJumperView(this);

	}

	followPlayer(nextState) {
		let direction = ((GLOBALS.player.state.posX + GLOBALS.player.state.width/2) < 
						(nextState.posX + nextState.width/2)) ? 'left' : 'right' ;

		if (nextState.grounded) {
			nextState.jumping = true;
		}

		if (nextState.stunned) {
			nextState.jumping = false;
		}

		if (nextState.jumping) {
			nextState.moveLeft = (direction === 'left');
			nextState.moveRight = (direction === 'right');
		} else {
			nextState.velX = 0;
		}

		return nextState;
	}

	tick(){
		// super.tick();

		let nextState = Object.assign({}, this.state);

		// Reduce stunned ticker

		nextState = super.reduceStunned(nextState);

		// Check horizontal movement
		
		nextState = super.horizontalMovement(nextState);

		// Check vertical movement, if entity has weight

		if (nextState.weight) {
			nextState = super.verticalMovement(nextState);
		}

		// If mob health == 0, die

		nextState = super.checkHealth(nextState);

		// If mob is grounded, prevent falling off edges

		nextState = super.predictTileEdge(nextState);

		// Build and adjust field of view

		super.setFieldOfView(nextState);

		// If sentry != stunned, try to detect player

		if (!nextState.stunned) {
			nextState = super.checkIfPlayerIsInView(nextState);
		} else {
			nextState.jumping = false;
		}

		// If player in view, follow

		if (this.chargeMode && !nextState.stunned) {
			nextState = this.followPlayer(nextState);
		} else {
			// nextState = this.stopAndThinkAboutDirection(nextState);
			nextState.jumping = false;
		}

		// Check for entity collision
		
		let collisions = willCollideWithEntities(this, getCollisionBox(nextState));
		if (collisions.length) {
			for (let collision of collisions) {
				nextState = super.entityCollision(collision, nextState);
			}
		}

		this.state = Object.assign({}, this.state, nextState);

		this.emitter.emit('change');

		// Unset taking damage after 'change' emit

		this.state.takingDamage = false;
	}
}

export default SentryJumperModel;