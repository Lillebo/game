import { GLOBALS } from '../globals.js';
import { 
	getCollisionBox, 
	willCollide,
	willCollideWithEntities, 
	hasAdjacent,
	getSidesFromAdjacent,
	getRandomInt
} from '../utils.js';

import EntityModel from './entity.js';
import MobModel from './mob.js';
import CoinModel from './coin.js';
import PlayerView from '../views/player.js';
import FallSpikeModel from './fallspike.js';
import DestructibleModel from './destructible.js';

import PlayerAudioController from '../sfx/player.js';
import GamepadManager from '../gamepad.js';

class PlayerModel extends EntityModel {

	constructor(props){
		super(props, true);
		
		this.state = Object.assign({}, this.state, {
			type: 'player',
			width: GLOBALS.tileSize + GLOBALS.tileSize/2,
			height: GLOBALS.tileSize * 2,
			lookUp: false,
			lookDown: false,
			takingDamage: false,
			attackSpeed: 20,
			attackTicks: 0,
			crouchSpeed: 3,
			attackStrength: 1,
			wallSlide: false,
			health: 5,
			maxHealth: 5,
			money: 0,
			lastTookDamageAt: 0,
			dashing: false,
			dead: false,
			abilities: ['walljump', 'dash'],
			tileNoCollide: ['exit']
		});

		this.view = new PlayerView(this);
		this.audio = new PlayerAudioController(this);

		this.wallSlideOnTicks = 0;
		this.wallSlideOffTicks = 0;

		this.dashLock = false;
		this.dashDurationTicks = 0;
		this.dashRechargeTicks = 0;

		this.lookTimer = 0;
		this.initialCameraX = undefined;
		this.initialCameraY = undefined;

		// Input locks

		this.inputLocks = {
			jumping: false,
			attacking: false
		};

		// Keyboard

		this.keys = {
			37:  false, // Left arrow
			39:  false, // Right arrow
			40:  false, // Down arrow
			38:  false, // Up arrow
			32:  false, // Space
			88:  false  // X
		};

		addEventListener('keydown', this.keydown);
		addEventListener('keyup', 	this.keyup);

		// Gamepad

		this.gamepad = new GamepadManager();
	}

	checkGamepadStatus = () => {

		if (this.state.dead) return;

		let buttons = [];
		let axes = [];

		if (this.gamepad.connected) {
			buttons = this.gamepad.getButtons();
			axes    = this.gamepad.getAxes();
		}

		if (buttons[0] || this.keys[32]) {
			if (!this.inputLocks.jumping) {
				this.state.jumping = true;
			}
		} else {
			this.inputLocks.jumping = false;
			this.state.jumping = false;
		}

		if (buttons[2] || this.keys[88]) {
			if (!this.inputLocks.attacking) {
				this.state.attacking = true;
			}
		} else {
			// this.inputLocks.jumping = false;
			this.state.attacking = false;
		}

		// this.state.jumping 	 = buttons[0] || this.keys[32];
		// this.state.attacking = buttons[2] || this.keys[88];
		this.state.dashing   = buttons[5] || this.keys[68];
		this.state.moveLeft  = (axes[0] < -0.5)  || buttons[14] || this.keys[37];
		this.state.moveRight = (axes[0] >  0.5)  || buttons[15] || this.keys[39];
		this.state.lookUp    = (axes[1] < -0.75) || buttons[12] || this.keys[38];
		this.state.lookDown  = (axes[1] >  0.75) || buttons[13] || this.keys[40];
		
	}

	keydown = (e) => {

		if (this.state.dead) return;

		// console.log(e.keyCode);

		if (this.keys.hasOwnProperty(e.keyCode)) {
			this.keys[e.keyCode] = true;
			// console.log(this.keys[e.keyCode]);
		}
	}

	keyup = (e) => {

		if (this.state.dead) return;

		if (this.keys.hasOwnProperty(e.keyCode)) {
			this.keys[e.keyCode] = false;
		}
	}

	wallSlide(nextState, prevState){

		// Modify collision box so that head contact doesn't count

		let modifiedBox = getCollisionBox(nextState);
			modifiedBox.h = modifiedBox.h/2;
			modifiedBox.y = modifiedBox.y + modifiedBox.h;

		let sides = getSidesFromAdjacent(this, modifiedBox);
	
		if (!nextState.grounded && !sides.bottom && (sides.left || sides.right) && nextState.velY > 0) {

			// Engage wallSlide only if player is moving towards wall

			if ((nextState.moveLeft && sides.left) || (nextState.moveRight && sides.right)) {

				this.wallSlideOnTicks++;

				nextState.wallSlide = true;

				if (nextState.velY > GLOBALS.terminalVelocity/4) {
					nextState.velY = GLOBALS.terminalVelocity/4;
				}
			}

		} else {
			nextState.wallSlide = false;
			this.wallSlideOnTicks = 0;
			this.wallSlideOffTicks = 0;
		}

		return nextState;
	}

	wallJump(nextState){

		if (nextState.jumping && nextState.wallSlide) {

			if (this.wallSlideOnTicks > 10) {
				nextState.velY = -(nextState.maxJumpStrength * 1.5);

				if (nextState.direction === 'left') {
					nextState.direction = 'right';
					nextState.velX = nextState.maxSpeed * 1.5;
				} else {
					nextState.direction = 'left';
					nextState.velX = -nextState.maxSpeed * 1.5;
				}
			}

		}

		return nextState;
		
	}

	dash(nextState) {

		let maxDuration = 12;
		let minRecharge = 10;

		// If conditions are right, init new dash

		if (nextState.dashing && this.dashDurationTicks === 0 && this.dashRechargeTicks === 0) {

			if (nextState.direction === 'left') {
				nextState.velX = -16;
			} else {
				nextState.velX = 16;
			}

			this.dashDurationTicks++;
		}

		// If dash underway, tick duration, maintain dash state

		if (this.dashDurationTicks > 0 && this.dashRechargeTicks === 0) {
			nextState.weight = 0;
			nextState.velY = 0;
			this.dashDurationTicks++;
		}

		// If dash duration maxed, stop dashing, start recharge ticks

		if (this.dashDurationTicks === maxDuration) {
			nextState.weight = 1;
			this.dashRechargeTicks++;
		}

		// If recharge complete, and grounded, allow new dash

		if (this.dashRechargeTicks >= minRecharge && nextState.grounded) {
			this.dashRechargeTicks = 0;
			this.dashDurationTicks = 0;
		}

		// console.log(this.dashDurationTicks, this.dashRechargeTicks);

		return nextState;
	}

	respawn(){
		this.state = Object.assign({}, this.state, {
			health: 5,
			money: 0,
			dead: false,
			takingDamage: false
		});
	}

	die(){
		this.dropCoins();
		this.state = Object.assign({}, this.state, {
			moveLeft: false,
			moveRight: false,
			velX: 0,
			velY: 0,
			grounded: undefined,
			falling: undefined,
			direction: undefined,
			jumping: false,
			attacking: false,
			lookUp: false,
			lookDown: false,
			attackTicks: 0,
			attackStrength: 1,
			wallSlide: false,
			health: 0,
			maxHealth: 5,
			money: 0,
			dashing: false,
			dead: true,
			lastDeath: window.performance.now()
		});
		this.emitter.emit('change');
		console.log('Player killed');
	}

	dropCoins() {
		for (let x = 0; x < this.state.money; x++) {
			GLOBALS.entities.push(
				new CoinModel({
					posX: (this.state.posX / GLOBALS.tileSize),
					posY: (this.state.posY / GLOBALS.tileSize),
					velX: getRandomInt(-6, 6),
					velY: getRandomInt(-5, -10)
				})
			);
		}
	}

	look(){

		let chargeTime = 30;
		let lookDistance = this.lookTimer - chargeTime;
		let lookDistanceMax = 100;

		if ((this.state.lookUp || this.state.lookDown) && this.state.velY === 0 && this.state.velX === 0) {

			this.lookTimer++;

			if (this.lookTimer > chargeTime) {

				let modifier = (lookDistance < lookDistanceMax) ? lookDistance : lookDistanceMax;

				if (this.state.lookUp) {
					GLOBALS.camera.posY = this.initialCameraY - modifier;
				} else if (this.state.lookDown) {
					GLOBALS.camera.posY = this.initialCameraY + modifier;
				}
			}

		} else {
			this.lookTimer = 0;
			this.initialCameraX = GLOBALS.camera.posX;
			this.initialCameraY = GLOBALS.camera.posY;
		}
	}

	tick(delta) {

		if (this.state.dead) {
			return;
		}

		let prevState = Object.assign({}, this.state);

		this.checkGamepadStatus();

		let nextState = Object.assign({}, this.state);

		// Reduce stunned ticker

		nextState = super.reduceStunned(nextState);

		// Check horizontal movement
		
		nextState = super.horizontalMovement(nextState);

		// Check vertical movement, if entity has weight

		if (nextState.weight) {
			nextState = super.verticalMovement(nextState);
		}
		
		// Check health

		if (nextState.health <= 0) {
			this.die();
			return;
		}

		// Check fps

		let now = window.performance.now();
		if (now - nextState.lastTookDamageAt > 500) {
			if (GLOBALS.fps < 60) {
				GLOBALS.fps++;
			}
		} else {
			GLOBALS.fps = 20;
		}

		// Set input locks

		if (prevState.jumpLock && !nextState.wallSlide && !nextState.grounded) {
			this.inputLocks.jumping = true;
			nextState.jumping = false;
		}

		// Looking

		this.look();

		// Wall jump & wall slide

		if (nextState.abilities.indexOf('walljump') !== -1) {

			// Wall slide

			nextState = this.wallSlide(nextState, prevState);

			// Wall jump

			nextState = this.wallJump(nextState);
		}

		// Dash

		if (nextState.abilities.indexOf('dash') !== -1) {
			nextState = this.dash(nextState);
		}

		// Limit maxSpeed when crouched

		if (nextState.crouching) {
			nextState.maxSpeed = nextState.crouchSpeed;
		} else {
			nextState.maxSpeed = nextState.defaultMaxSpeed;
		}

		// Buffer attackTicks

		if (nextState.attackTicks > 0) {
			if (nextState.attackTicks < nextState.attackSpeed) {
				nextState.attackTicks++;
			} else {
				nextState.attackTicks = 0;
				nextState.attacking = false;
			}
		}

		// Attacking

		if (nextState.attacking) {

			if (nextState.attackTicks < 5) {

				// Do the attack
				nextState = this.attack(nextState);

				if (nextState.attackTicks === 0) {
					nextState.attackTicks++;
				}

			}
		}

		// Check for entity collision
		
		let collisions = willCollideWithEntities(this, getCollisionBox(nextState));
		if (collisions.length) {
			for (let collision of collisions) {
				nextState = this.entityCollision(collision, nextState);
			}
		}

		this.state = Object.assign({}, this.state, nextState);
		
		this.emitter.emit('change');

		this.state.takingDamage = false;
	}

	entityCollision(entity, nextState){

		// Collision with hostiles

		if (entity instanceof MobModel || (entity instanceof FallSpikeModel && !entity.state.grounded)) {
			
			let now = window.performance.now();
			if (now - nextState.lastTookDamageAt > 1000) {

				// Abort if player is currently taking damage

				if (nextState.takingDamage) {
					return nextState;
				}

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

		// Collision with consumables

		if (entity instanceof CoinModel) {
			nextState.money += entity.state.value;
			entity.destroy();
		}

		return nextState;
	}

	getAttackHitbox(){

		let range = this.state.width * 2;
		let posX;
		let posY = this.state.posY;
		let width = range;
		let height = this.state.height;
		
		if (this.state.direction === 'left') {
			posX = this.state.posX - range;
		}

		if (this.state.direction === 'right') {
			posX = this.state.posX + this.state.width;
		}

		if (this.state.lookUp) {
			posX = this.state.posX;
			posY = this.state.posY - range;
			height = range;
			width = this.state.width;
		}

		if (this.state.lookDown && !this.state.grounded) {
			posX = this.state.posX;
			posY = this.state.posY + range;
			height = range;
			width = this.state.width;
		}

		return {
			x: posX,
			y: posY,
			w: width,
			h: height
		};
	}

	attack(nextState){
		
		let attackHitBox = this.getAttackHitbox();

		let collisions = willCollideWithEntities({}, attackHitBox);
		if (collisions) {
			for (let collision of collisions) {
				if (collision instanceof MobModel) {
					nextState = this.attackMob(nextState, collision);
				}
				if (collision instanceof DestructibleModel) {
					nextState = this.attackDestructible(nextState, collision);
				}
			}
		}

		return nextState;
	}

	attackDestructible(nextState, destructible){

		if (destructible.state.destroyed) {
			return nextState;
		}
		
		console.log('attacking destructible', destructible.state.health);

		destructible.state = Object.assign({}, destructible.state, {
			health: destructible.state.health - 1,
			takingDamage: true
		});

		console.log(destructible.state.health);

		if (nextState.lookUp) {
			if (!nextState.grounded) {
				nextState.velY = 5;
			}
		} else if (nextState.lookDown) {
			nextState.velY = -10;
		} else if (destructible.state.posX < nextState.posX) {
			nextState.velX = 6;
		} else {
			nextState.velX = -6;
		}

		return nextState;

	}

	attackMob(nextState, mob){

		if (mob.state.stunned) {
			return nextState;
		}

		let newMobState = {
			velY: -5,
			grounded: false,
			stunned: 10,
			takingDamage: true,
			health: mob.state.health - 1
		};

		if (nextState.lookUp) {

			if (!nextState.grounded) {
				nextState.velY = 5;
			}
			
			newMobState.velY = -10;

		} else if (nextState.lookDown) {

			nextState.velY = -10;

			if (!mob.state.grounded) {
				newMobState.velY = 10;
			}

		} else if (mob.state.posX < nextState.posX) {

			newMobState.velX = -15;
			nextState.velX = 8;

		} else {

			newMobState.velX = 15;
			nextState.velX = -8;
		}

		newMobState = Object.assign({}, mob.state, newMobState);
		mob.state = newMobState;

		return nextState;
	}

}

export default PlayerModel;