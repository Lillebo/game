import { GLOBALS } from '../globals.js';
import { 
	getRandomInt, 
	getCollisionBox, 
	aabb, 
	hasAdjacent, 
	willCollide, 
	willCollideWithEntities 
} from '../utils.js';

import MobModel from './mob.js';
import SentryView from '../views/sentry.js';

import SlugAudioController from '../sfx/slug.js';

class SentryModel extends MobModel {

	constructor(props, subclass){
		super(props, true);

		let moveRight = (getRandomInt(0, 10) % 2 === 0);

		this.state = Object.assign({}, this.state, {
			type: 'sentry',
			width: GLOBALS.tileSize * 2,
			height: GLOBALS.tileSize * 3,
			moveRight: moveRight,
			moveLeft: !moveRight,
			health: 3,
			dropCoins: 3
		});

		this.directionTick = 0;
		this.thinkingTick = 0;
		this.chargeMode = false;
		this.chargeModeCoolDownTick = 0;

		if (!subclass) {
			this.view = new SentryView(this);
		}

		this.audio = new SlugAudioController(this);

	}

	stopAndThinkAboutDirection(nextState){

		let maxWalkDuration = 60;
		let maxThinkDuration = 120;

		if (this.thinkingTick === 0) {
			this.directionTick++;
		}

		if (this.directionTick > maxWalkDuration && this.thinkingTick === 0) {
			
			// 33% chance of stopping after {maxWalkDuration} ticks

			let shouldStopAndThink = (getRandomInt(0,2) === 1);
			if (shouldStopAndThink) {

				this.thinkingTick++;

				// nextState.stunned = maxThinkDuration;
				nextState.moveRight = false;
				nextState.moveLeft = false;

			}
			
			this.directionTick = 0;
		}

		if (this.thinkingTick >= 1) {
			this.thinkingTick++;
		}

		if (this.thinkingTick > maxThinkDuration) {
			
			let moveRight = (getRandomInt(0, 10) % 2 === 0);
			if (moveRight) {
				nextState.moveRight = true;
			} else {
				nextState.moveLeft = true;
			}
			nextState.velX = 0;

			this.thinkingTick = 0;
			this.directionTick = 0;
		}

		if (nextState.posY < 400) {
			// console.log(this.directionTick, this.thinkingTick, 'moveRight', nextState.moveRight, 'moveLeft', nextState.moveLeft);
		}

		return nextState;
	}

	setFieldOfView(nextState){
		let entityBox = getCollisionBox(nextState);
		let maxLoops = 10;
		
		// Build left field

		let leftFieldOfViewBox = Object.assign({}, entityBox);
			leftFieldOfViewBox.w = GLOBALS.tileSize;
			leftFieldOfViewBox.x -= GLOBALS.tileSize;

		let collisions = willCollide(this, leftFieldOfViewBox);

		while (!collisions.length && maxLoops > 0) {
			leftFieldOfViewBox.x -= GLOBALS.tileSize;
			leftFieldOfViewBox.w += GLOBALS.tileSize;

			collisions = willCollide(this, leftFieldOfViewBox);
			maxLoops--;
		}

		leftFieldOfViewBox.x += GLOBALS.tileSize;
		leftFieldOfViewBox.w -= GLOBALS.tileSize;

		this.leftFieldOfView = leftFieldOfViewBox;

		// Build right field

		let rightFieldOfViewBox = Object.assign({}, entityBox);
			rightFieldOfViewBox.w = GLOBALS.tileSize;
			rightFieldOfViewBox.x += entityBox.w;

		collisions = willCollide(this, rightFieldOfViewBox);
		maxLoops = 10;

		while (!collisions.length && maxLoops > 0) {
			rightFieldOfViewBox.w += GLOBALS.tileSize;

			collisions = willCollide(this, rightFieldOfViewBox);
			maxLoops--;
		}

		rightFieldOfViewBox.w -= GLOBALS.tileSize;

		this.rightFieldOfView = rightFieldOfViewBox;
	}

	checkIfPlayerIsInView(nextState){

		// let chargeModeCoolDown = 10;

		if (aabb(this.leftFieldOfView, getCollisionBox(GLOBALS.player.state)) || aabb(this.rightFieldOfView, getCollisionBox(GLOBALS.player.state))) {
			
			nextState = this.followPlayer(nextState);

			nextState.maxSpeed = 2;

			this.chargeMode = true;
			this.chargeModeCoolDownTick = 30;
			this.thinkingTick = 0;
			this.directionTick = 0;

		} else if (this.chargeModeCoolDownTick > 0) {
			this.chargeModeCoolDownTick--;

			if (this.chargeModeCoolDownTick === 0) {
				let moveRight = (getRandomInt(0, 10) % 2 === 0);

				nextState.moveLeft = !moveRight;
				nextState.moveRight = moveRight;
				nextState.maxSpeed = 1;

				this.chargeMode = false;
			}
		}

		return nextState;
	}

	followPlayer(nextState) {
		let direction = ((GLOBALS.player.state.posX + GLOBALS.player.state.width/2) < 
						(nextState.posX + nextState.width/2)) ? 'left' : 'right' ;
		
		// Predict edge

		let predictionBox = getCollisionBox(nextState);
		if (direction === 'left') {
			predictionBox.x -= nextState.width;
		} else {
			predictionBox.x += nextState.width;
		}

		// If predictionBox has adjacent objects, follow player

		if (hasAdjacent(this, predictionBox).length) {
			nextState.moveLeft = (direction === 'left');
			nextState.moveRight = (direction === 'right');
		} else {
			nextState.moveLeft = false;
			nextState.moveRight = false;
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

		this.setFieldOfView(nextState);

		// If sentry != stunned, try to detect player

		if (!nextState.stunned) {
			nextState = this.checkIfPlayerIsInView(nextState);
		}

		// If player in view, follow

		if (this.chargeMode && !nextState.stunned) {
			nextState = this.followPlayer(nextState);
		} else {
			// nextState = this.stopAndThinkAboutDirection(nextState);
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

export default SentryModel;