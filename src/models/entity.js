import EventEmitter from 'events';

import { GLOBALS } from '../globals.js';
import { 
	willCollide, 
	getCollisionBox, 
	getSidesFromCollisions,
	aabb 
} from '../utils.js';

import EntityView from '../views/entity.js';
import SpikeModel from './spike.js';

class EntityModel {

	constructor(props, subclass){

		// console.log('EntityModel init');

		this.state = {
			posX: 				props.posX * GLOBALS.tileSize,
			posY: 				props.posY * GLOBALS.tileSize,
			velX: 				props.velX 		|| 0,
			velY: 				props.velY 		|| 0,
			width: 				props.width 	|| GLOBALS.tileSize,
			height: 			props.height	|| GLOBALS.tileSize * 2,
			defaultHeight: 		props.height    || GLOBALS.tileSize * 2,
			crouchedHeight: 	props.crouchedHeight || GLOBALS.tileSize * 1.5,
			grounded: 			props.grounded 	|| undefined,
			falling: 			props.falling 	|| undefined,
			jumping: 			props.jumping 	|| false,
			jumpLock: 			false,
			jumpTicks: 			props.jumpTicks	|| 0,
			maxJumpTicks: 		props.maxJumpTicks || 15,
			maxJumpStrength:	props.maxJump	|| 12,
			initJumpStrength: 	props.initJumpStrength || 8,
			crouching: 			props.crouching	|| false,
			moveLeft: 			props.moveLeft 	|| false,
			moveRight: 			props.moveRight || false,
			maxSpeed:   		props.maxSpeed  || 6,
			defaultMaxSpeed: 	props.maxSpeed  || 6,
			direction:  		props.direction || undefined,
			stunned: 			props.stunned   || 0,
			type: 				props.type 		|| undefined,
			friction: 			props.friction  || 1,
			weight: 			props.weight    || 1
		};
		
		this.emitter = new EventEmitter();

		if (!subclass) {
			this.view = new EntityView(this);
		}

	}

	destroy(){
		for (let i = 0; i < GLOBALS.entities.length; i++) {
			if (GLOBALS.entities[i] === this) {
				GLOBALS.entities.splice(i, 1);
			}
		}
	}

	getInertia(nextState){

		let inertia = {
			horizontal: false,
			vertical: false
		};

		if (nextState.velX > 0) {
			inertia.horizontal = 'right';
		}
		if (nextState.velX < 0) {
			inertia.horizontal = 'left';
		}
		if (nextState.velY > 0) {
			inertia.vertical = 'down';
		}
		if (nextState.velX < 0) {
			inertia.vertical = 'up';
		}

		return inertia;

	}

	horizontalMovement(nextState){

		// Move right

		if (nextState.moveRight && !nextState.moveLeft && !nextState.stunned) {

			nextState.direction = 'right';

			if (nextState.velX < nextState.maxSpeed) {

				// Increase velocity if X axis velocity is below maxSpeed

				nextState.velX += nextState.friction;

			} else if (nextState.velX > nextState.maxSpeed) {

				// Reduce velocity if velocity is already above nextState.maxSpeed

				nextState.velX -= nextState.friction;

			}

		} else {
			if (nextState.velX > 0) {
				nextState.velX -= nextState.friction;
			}
		}

		// Move left

		if (nextState.moveLeft && !nextState.moveRight && !nextState.stunned) {

			nextState.direction = 'left';

			if (nextState.velX > -nextState.maxSpeed) {

				// Increase velocity if X axis velocity is below maxSpeed

				nextState.velX -= nextState.friction;

			} else if (nextState.velX < -nextState.maxSpeed) {

				nextState.velX += nextState.friction;

			}

		} else {
			if (nextState.velX < 0) {
				nextState.velX += nextState.friction;
			}
		}

		// Nullify small floats

		if (!nextState.moveLeft && !nextState.moveRight) {
			if (nextState.velX < 1 && nextState.velX > 0) {
				nextState.velX = 0;
			}
		}

		// Set X position

		nextState.posX += parseInt(nextState.velX);

		// Check for X collision

		let collisions = willCollide(this, getCollisionBox(nextState));

		if (collisions.length) {

			let harmfulTileContactFound = false;

			if (nextState.hasOwnProperty('health')) {
				for (let collision of collisions) {
					if (collision.state.hasOwnProperty('damage')) {
						nextState = this.harmfulTileContact(nextState, collision);
						harmfulTileContactFound = true;
					}
					if (harmfulTileContactFound) {
						break;
					}
				}
			}

		}

		let sides = getSidesFromCollisions(getCollisionBox(nextState), collisions);

		if (sides.left) {
			nextState.posX = sides.left.state.posX + sides.left.state.width;
		}

		if (sides.right) {
			nextState.posX = sides.right.state.posX - nextState.width;
		}

		return nextState;
	}

	reduceStunned(nextState){
		if (nextState.stunned && nextState.grounded) {
			nextState.stunned--;
		}

		return nextState;
	}

	tick(delta) {

		// Copy state

		let nextState = Object.assign({}, this.state);

		// Reduce stunned ticker

		nextState = this.reduceStunned(nextState);

		// Check horizontal movement
		
		nextState = this.horizontalMovement(nextState);

		// Check vertical movement, if entity has weight

		if (nextState.weight) {
			nextState = this.verticalMovement(nextState);
		}

		// Set new state

		this.state = Object.assign(this.state, nextState);

		this.emitter.emit('change');
	}

	harmfulTileContact(nextState, collision){

		let sides = getSidesFromCollisions(getCollisionBox(nextState), [collision]);

		if (sides.left || sides.right || sides.bottom || sides.top) {
			nextState.takingDamage = true;
		}

		if (sides.left) {
			nextState.health -= sides.left.state.damage;
			return nextState;
		}

		if (sides.right) {
			nextState.health -= sides.right.state.damage;
			return nextState;
		}

		if (sides.top) {
			nextState.health -= sides.top.state.damage;
			return nextState;
		}

		if (sides.bottom) {
			nextState.health -= sides.bottom.state.damage;
			return nextState;
		}

	}

	verticalMovement(nextState){

		// Detect falling

		let box = getCollisionBox(nextState);
			box.h++;

		let collisions = willCollide(this, box);
		let sides = getSidesFromCollisions(box, collisions);

		if (nextState.hasOwnProperty('health')) {
			if (sides.bottom instanceof SpikeModel || sides.top instanceof SpikeModel) {
				let collision = (sides.bottom instanceof SpikeModel) ? sides.bottom : sides.top;
				nextState = this.harmfulTileContact(nextState, collision);
			}
		}

		nextState.falling  = !sides.bottom;
		nextState.grounded =  sides.bottom;

		// Handle falling

		if (nextState.falling) {
			if (nextState.velY < GLOBALS.terminalVelocity) {
				nextState.velY += GLOBALS.gravity;
			}
			if (nextState.velY >= 0) {
				nextState.jumpLock = true;
			}
		}

		// Jumping

		if (nextState.jumping && !nextState.jumpLock) {

			if (nextState.jumpTicks < nextState.maxJumpTicks) {
				nextState.jumpTicks++;

				if (nextState.velY === 0) {
					
					nextState.velY = -nextState.initJumpStrength;

				} else if (nextState.velY > -nextState.maxJumpStrength) {

					nextState.velY--;

				}

				nextState.grounded = false;
				nextState.falling = true;
			}
		}

		if (!nextState.jumping && !nextState.grounded) {
			nextState.jumpLock = true;
		}

		// Reset jumpTick if landed

		if (nextState.grounded && nextState.velY >= 0) {
			nextState.jumpTicks = 0;
			nextState.jumpLock = false;
		}

		// Set Y position

		nextState.posY += nextState.velY;

		// Check for Y collision

		collisions = willCollide(this, getCollisionBox(nextState));
		if (collisions.length) {

			let harmfulTileContactFound = false;

			if (nextState.hasOwnProperty('health')) {
				for (let collision of collisions) {
					if (collision.state.hasOwnProperty('damage')) {
						nextState = this.harmfulTileContact(nextState, collision);
						harmfulTileContactFound = true;
					}
					if (harmfulTileContactFound) {
						break;
					}
				}
			}

			let sides = getSidesFromCollisions(getCollisionBox(nextState), collisions);

			if (sides.bottom) {

				nextState.posY = sides.bottom.state.posY - nextState.height;
				nextState.falling = false;
				nextState.grounded = true;

			} else {

				nextState.posY = sides.top.state.posY + sides.top.state.height;
				nextState.falling = true;
				nextState.jumpLock = true;
				
			}

			nextState.velY = 0;
		}

		return nextState;
	}
}

export default EntityModel;