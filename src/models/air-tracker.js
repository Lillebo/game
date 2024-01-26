import { GLOBALS } from '../globals.js';
import { 
	getRandomInt, 
	willCollide, 
	getSidesFromCollisions,
	getCollisionBox,
	aabb
} from '../utils.js';

import EntityModel from './entity.js';
import AirSlugModel from './air-slug.js';

import AirTrackerView from '../views/air-tracker.js';

class AirTrackerModel extends AirSlugModel {
	constructor(props){
		super(props, true);

		let moveRight = (getRandomInt(0, 10) % 2 === 0);
		let upOrDown  = (getRandomInt(0, 10) % 2 === 0);

		this.state = Object.assign({}, this.state, {
			type: 'airtracker',
			width: GLOBALS.tileSize * 2,
			height: GLOBALS.tileSize,
			moveRight: moveRight,
			moveLeft: !moveRight,
			velY: (upOrDown) ? -1 : 1,
			velX: (moveRight) ? 1 : -1,
			maxSpeed: 1
		});

		this.state.direction = (moveRight) ? 'right' : 'left' ;

		this.originalPos = {
			x: this.state.posX,
			y: this.state.posY
		};

		this.chargeMode = false;

		this.view = new AirTrackerView(this);

		this.setFieldOfView();
	}

	setFieldOfView(){

		let entityBox = getCollisionBox(this.state);
		let fieldOfViewBox = Object.assign({}, entityBox);

		fieldOfViewBox.x -= GLOBALS.tileSize * 7;
		fieldOfViewBox.w += GLOBALS.tileSize * 14;
		fieldOfViewBox.y -= GLOBALS.tileSize * 7;
		fieldOfViewBox.h += GLOBALS.tileSize * 14;

		this.fieldOfView = fieldOfViewBox;

	}

	tick(){

		this.setFieldOfView();

		let nextState = Object.assign({}, this.state);

		// Check health

		nextState = super.checkHealth(nextState);

		// Detect direction

		nextState.direction = (nextState.velX > 0) ? 'right' : 'left' ;

		// Reset stunned

		if (nextState.stunned) {
			nextState.stunned--;
		}

		// Adjust vertical speed

		if (Math.abs(nextState.velY) > nextState.maxSpeed) {
			if (nextState.velY > 0) {
				nextState.velY--;
			} else {
				nextState.velY++;
			}
		}

		nextState.posY += nextState.velY;

		// Check for harmful tile contact

		let collisions = willCollide(this, getCollisionBox(nextState));

		if (collisions.length) {

			let harmfulTileContactFound = false;

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

		// Check Y collision

		let sides = getSidesFromCollisions(getCollisionBox(nextState), collisions);

		if (sides.top) {
			nextState.posY = sides.top.state.posY + sides.top.state.height;
		}

		if (sides.bottom) {
			nextState.posY = sides.bottom.state.posY - nextState.height;
		}

		// Adjust horizontal speed
		
		if (Math.abs(nextState.velX) > nextState.maxSpeed) {
			if (nextState.velX > 0) {
				nextState.velX--;
			} else {
				nextState.velX++;
			}
		} else {
			if (nextState.moveRight) {
				nextState.velX++;
			}
			if (nextState.moveLeft) {
				nextState.velX--;
			}
		}

		nextState.posX += nextState.velX;

		// Check for harmful tile collision

		collisions = willCollide(this, getCollisionBox(nextState));

		if (collisions.length) {

			let harmfulTileContactFound = false;

			for (let collision of collisions) {
				if (collision.state.hasOwnProperty('damage')) {
					nextState = super.harmfulTileContact(nextState, collision);
					harmfulTileContactFound = true;
				}
				if (harmfulTileContactFound) {
					break;
				}
			}

		}

		sides = getSidesFromCollisions(getCollisionBox(nextState), collisions);

		if (sides.left || sides.right) {
			if (sides.left) {
				nextState.posX = sides.left.state.posX + sides.left.state.width;
			}
			if (sides.right) {
				nextState.posX = sides.right.state.posX - nextState.width;
			}
		}

		// Check if player is in view

		if (!this.chargeMode) {
			nextState = this.checkMoveDistance(nextState);
			
			nextState = this.checkIfPlayerIsInView(nextState);

		} else {
			nextState = this.followPlayer(nextState);
		}

		this.state = Object.assign({}, this.state, nextState);
		this.emitter.emit('change');

		this.state.takingDamage = false;

	}

	checkMoveDistance(nextState){
		if (Math.abs(this.originalPos.x - nextState.posX) > 20) {
			nextState.moveRight = !nextState.moveRight;
			nextState.moveLeft  = !nextState.moveLeft
			nextState.velX = 0;
		}

		if (Math.abs(this.originalPos.y - nextState.posY) > 10) {
			nextState.velY = -nextState.velY;
		}

		return nextState;
	}

	checkIfPlayerIsInView(nextState){
		if (aabb(this.fieldOfView, getCollisionBox(GLOBALS.player.state))) {
			this.chargeMode = true;
			nextState.maxSpeed = 2;
		}

		return nextState;
	}

	followPlayer(nextState){

		let xDir = ((GLOBALS.player.state.posX + GLOBALS.player.state.width/2) < 
					(nextState.posX + nextState.width/2)) ? 'left' : 'right' ;

		let yDir = ((GLOBALS.player.state.posY + GLOBALS.player.state.height/2) <
					(nextState.posY + nextState.height/2)) ? 'up' : 'down';

		nextState.moveLeft = (xDir === 'left');
		nextState.moveRight = (xDir === 'right');

		nextState.velY = (yDir === 'down') ? nextState.maxSpeed : -nextState.maxSpeed;

		return nextState;
	}
}

export default AirTrackerModel;