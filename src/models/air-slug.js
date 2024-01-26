import { GLOBALS } from '../globals.js';
import { 
	getRandomInt, 
	willCollide, 
	getSidesFromCollisions,
	getCollisionBox 
} from '../utils.js';
import EntityModel from './entity.js';
import MobModel from './mob.js';
import AirSlugView from '../views/air-slug.js';
import SlugAudioController from '../sfx/slug.js';

class AirSlugModel extends MobModel {
	constructor(props, subclass){
		super(props, true);

		let moveRight = (getRandomInt(0, 10) % 2 === 0);
		let upOrDown  = (getRandomInt(0, 10) % 2 === 0);

		this.state = Object.assign({}, this.state, {
			type: 'airslug',
			width: GLOBALS.tileSize * 2,
			height: GLOBALS.tileSize * 2,
			moveRight: moveRight,
			moveLeft: !moveRight,
			velY: (upOrDown) ? -2 : 2,
			velX: (moveRight) ? 2 : -2,
			maxSpeed: 2,
			health: 2,
			dropCoins: 2,
			weight: 0
		});

		this.state.direction = (moveRight) ? 'right' : 'left' ;

		if (!subclass) {
			this.view = new AirSlugView(this);
		}

		this.audio = new SlugAudioController(this);
	}

	tick() {

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

		if (sides.top || sides.bottom) {
			nextState.velY = -nextState.velY;
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
			nextState.moveRight = !nextState.moveRight;
			nextState.moveLeft  = !nextState.moveLeft
			nextState.velX = 0;

			if (sides.left) {
				nextState.posX = sides.left.state.posX + sides.left.state.width;
			}
			if (sides.right) {
				nextState.posX = sides.right.state.posX - nextState.width;
			}
		}

		this.state = Object.assign({}, this.state, nextState);
		this.emitter.emit('change');

		this.state.takingDamage = false;
	}
}

export default AirSlugModel;