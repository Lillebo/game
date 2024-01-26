import { GLOBALS } from '../globals.js';
import { 
	getRandomInt, 
	getCollisionBox, 
	willCollide, 
	willCollideWithEntities, 
	hasAdjacent, 
	hasAdjacentHorizontally
} from '../utils.js';

import EventEmitter from 'events';
import EntityModel from './entity.js';
import CoinModel from './coin.js';
import FallSpikeModel from './fallspike.js';

class MobModel extends EntityModel {

	constructor(props, subclass){
		super(props, subclass);

		this.state = Object.assign({}, this.state, {
			type: 'mob',
			maxSpeed: 1,
			takingDamage: false,
			lastTookDamageAt: 0,
			dropCoins: props.dropCoins || 0
		});
	}

	switchDirection(state){
		return Object.assign({}, state, {
			velX: 0,
			moveRight: !state.moveRight,
			moveLeft: !state.moveLeft
		});
	}

	dropCoins = () => {
		for (let x = 0; x < this.state.dropCoins; x++) {

			GLOBALS.entities.push(
				new CoinModel({
					posX: (this.state.posX / GLOBALS.tileSize),
					posY: (this.state.posY / GLOBALS.tileSize),
					velX: getRandomInt(-5, 5),
					velY: getRandomInt(-5, -10)
				})
			);
		}
	}

	checkHealth(nextState){
		if (nextState.health <= 0) {
			this.dropCoins();
			
			nextState.weight = 1;
			nextState.moveLeft = false;
			nextState.moveRight = false;

			this.destroy();
		}

		return nextState;
	}

	predictTileEdge(nextState){
		if (!nextState.stunned && nextState.grounded) {

			// Predict edges
			
			let predictionBox = getCollisionBox(nextState);

			if (nextState.direction === 'left') {
				predictionBox.x -= nextState.width;
			} else {
				predictionBox.x += nextState.width;
			}

			// If predictionBox has no adjacent tiles, switch direction

			if (!hasAdjacent(this, predictionBox).length) {
				nextState = this.switchDirection(nextState);
			}

			// Check for wall contact

			let box = getCollisionBox(nextState);
			if (hasAdjacentHorizontally(this, box).length) {
				nextState = this.switchDirection(nextState);
			}
		}

		return nextState;
	}

	tick(delta){

		let lastPosX = this.state.posX;
		let lastPosY = this.state.posY;
		let lastGrounded = this.state.grounded;

		// super.tick(delta);

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

		nextState = this.checkHealth(nextState);

		// If mob is grounded, prevent falling off edges

		nextState = this.predictTileEdge(nextState);

		// Check for entity collision
		
		let collisions = willCollideWithEntities(this, getCollisionBox(nextState));
		if (collisions.length) {
			for (let collision of collisions) {
				nextState = this.entityCollision(collision, nextState);
			}
		}

		// Set new state

		this.state = Object.assign({}, this.state, nextState);

		this.emitter.emit('change');

		// Unset taking damage after 'change' emit

		this.state.takingDamage = false;
	}

	entityCollision(entity, nextState){

		// Collision with fall spikes

		if (entity instanceof FallSpikeModel && !entity.state.grounded) {

			let now = window.performance.now();
			if (now - nextState.lastTookDamageAt > 1000) {
			
				nextState.velY = -5;
				nextState.grounded = false;
				nextState.takingDamage = true;
				nextState.health--;
				nextState.lastTookDamageAt = window.performance.now();

				if (entity.state.posX < nextState.posX) {
					nextState.velX = 10;
				} else {
					nextState.velX = -10;
				}
			}
		}

		return nextState;
	}

}

export default MobModel;