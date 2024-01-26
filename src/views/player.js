import { GLOBALS } from '../globals.js';
import { getRandomInt } from '../utils.js';

import DropletModel from '../models/droplet.js';
import CircleAnimation from './circle-animation.js';
import RadialGradientAnimation from './radial-gradient-animation.js';

import SpriteSheet from './spritesheet.js';
import playerSprite from '../gfx/player-sprite.png';
import moveSprites from '../gfx/player-move-sprites.png';
import attackSprites from '../gfx/player-attack-sprites.png';
import attackAltSprites from '../gfx/player-attack-alt-sprites.png';
import attackAboveSprites from '../gfx/player-attack-above-sprites.png';
import attackBelowSprites from '../gfx/player-attack-below-sprites.png';

class PlayerView {

	constructor(model){
		this.model = model;
		this.model.emitter.on('change', this.render);

		this.moveSprite = new SpriteSheet(
			moveSprites, 
			this.model.state.width,
			this.model.state.height,
			this.model.state.posX - GLOBALS.camera.posX,
			this.model.state.posY - GLOBALS.camera.posY,
			this.model.state.direction
		);

		let attackHitbox = this.model.getAttackHitbox();

		this.attackSprite = new SpriteSheet(
			attackSprites,
			attackHitbox.w + this.model.state.width,
			this.model.state.height,
			this.model.state.posX - GLOBALS.camera.posX - attackHitbox.w,
			this.model.state.posY - GLOBALS.camera.posY,
			this.model.state.direction
		);

		this.attackAltSprite = new SpriteSheet(
			attackAltSprites,
			attackHitbox.w + this.model.state.width,
			this.model.state.height,
			this.model.state.posX - GLOBALS.camera.posX - attackHitbox.w,
			this.model.state.posY - GLOBALS.camera.posY,
			this.model.state.direction
		);

		this.currentAttackSpriteSheet = this.attackSprite;

		this.attackAboveSprite = new SpriteSheet(
			attackAboveSprites,
			this.model.state.width,
			this.model.state.height * 2.25,
			this.model.state.posX - GLOBALS.camera.posX,
			this.model.state.posY + (this.model.state.height * 1.25) - GLOBALS.camera.posY,
			this.model.state.direction
		);

		this.attackBelowSprite = new SpriteSheet(
			attackBelowSprites,
			this.model.state.width,
			this.model.state.height * 2.25,
			this.model.state.posX - GLOBALS.camera.posX,
			this.model.state.posY - GLOBALS.camera.posY,
			this.model.state.direction
		);

	}

	resetAttackSprite(){
		this.currentAttackSpriteSheet = this.attackSprite;
	}

	switchAttackSprite(){
		if (this.currentAttackSpriteSheet === this.attackSprite) {
			this.currentAttackSpriteSheet = this.attackAltSprite;
		} else {
			this.currentAttackSpriteSheet = this.attackSprite
		}
	}

	setBacklight = () => {
		let gradient1 = GLOBALS.ctx.createRadialGradient(
			this.model.state.posX - GLOBALS.camera.posX + 10, 
			this.model.state.posY - GLOBALS.camera.posY + 20, 
			200, 
			this.model.state.posX - GLOBALS.camera.posX + 10, 
			this.model.state.posY - GLOBALS.camera.posY + 20, 
			100
		);

		gradient1.addColorStop(0, 'rgba(255,255,255,0)');
		gradient1.addColorStop(1, 'rgba(255,255,255,1)');

		GLOBALS.ctx.globalCompositeOperation = "soft-light";
		GLOBALS.ctx.fillStyle = gradient1;
		GLOBALS.ctx.fillRect(
			this.model.state.posX - GLOBALS.camera.posX - 190, 
			this.model.state.posY - GLOBALS.camera.posY - 180, 
			400, 
			400
		);
	}

	fillPlayerBox() {
		GLOBALS.ctx.fillStyle = 'rgba(0,0,255,1)';
		GLOBALS.ctx.fillRect(
			this.model.state.posX - GLOBALS.camera.posX, 
			this.model.state.posY - GLOBALS.camera.posY, 
			this.model.state.width, 
			this.model.state.height
		);
	}

	fillAttackHitbox(){
		let attackHitbox = this.model.getAttackHitbox();

		GLOBALS.ctx.fillStyle = 'rgba(255,0,0,1)';
		GLOBALS.ctx.fillRect(
			attackHitbox.x - GLOBALS.camera.posX, 
			attackHitbox.y - GLOBALS.camera.posY, 
			attackHitbox.w, 
			attackHitbox.h
		);
	}

	takingDamageEffect(){
		new RadialGradientAnimation({
			posX: this.model.state.posX + this.model.state.width/2,
			posY: this.model.state.posY + this.model.state.height/2,
			innerColor: 'rgba(255,0,0,0)',
			outerColor: 'rgba(255,0,0,0.2)',
			beginRadius: 50,
			endRadius: 	100,
			endOpacity: 0.5,
			autoPlay: true,
			maxFrames: 5
		});

		for (let x = 0; x < 5; x++) {
			
			let radius = getRandomInt(4, 6);

			GLOBALS.entities.push(
				new DropletModel({
					posX: (this.model.state.posX / GLOBALS.tileSize),
					posY: (this.model.state.posY / GLOBALS.tileSize),
					velX: getRandomInt(-10, 10),
					velY: getRandomInt(-5, -15),
					width: radius,
					height: radius,
					fillColor: 'rgba(255,0,0,1)'
				})
			);
		}
	}

	render = () => {

		// if (this.model.state.dead) {
		// 	return;
		// }

		// Player backlight

		// this.setBacklight();

		// Player sprite

		GLOBALS.ctx.globalCompositeOperation = "source-over";

		if (this.tookDamageTicks > 0) {
			this.tookDamageTicks--;
		}

		if (this.model.state.takingDamage) {
			this.tookDamageTicks = 30;
		}

		// Taking damage effect

		if (this.model.state.takingDamage) {
			this.takingDamageEffect();
		}

		// Death effect

		if (this.model.state.health <= 0) {
			new CircleAnimation({
				posX:   this.model.state.posX + this.model.state.width/2,
				posY:   this.model.state.posY + this.model.state.height/2,
				beginRadius: 20,
				endRadius: 40,
				fillColor: 'rgba(255,0,0,0.2)',
				autoPlay: true,
				maxFrames: 10
			});

			this.takingDamageEffect();
		}

		// this.fillPlayerBox();

		if (this.model.state.attackTicks > 0 && 
			this.model.state.attackTicks <= this.currentAttackSpriteSheet.maxFrames) {

			// this.fillAttackHitbox();

			let attackHitbox = this.model.getAttackHitbox();
			
			if (this.model.state.lookUp) {
				
				this.attackAboveSprite.setDirection(this.model.state.direction);
				this.attackAboveSprite.setPosition(
					this.model.state.posX - GLOBALS.camera.posX,
					this.model.state.posY - (this.model.state.height * 1.25) - GLOBALS.camera.posY
				);
				this.attackAboveSprite.render();

			} else if (this.model.state.lookDown && !this.model.state.grounded) {

				this.attackBelowSprite.setDirection(this.model.state.direction);
				this.attackBelowSprite.setPosition(
					this.model.state.posX - GLOBALS.camera.posX,
					this.model.state.posY - GLOBALS.camera.posY
				);
				this.attackBelowSprite.render();

			} else {

				this.currentAttackSpriteSheet.setDirection(this.model.state.direction);

				let x = this.model.state.posX - GLOBALS.camera.posX;

				if (this.model.state.direction === 'left') {
					x -= attackHitbox.w;
				}

				this.currentAttackSpriteSheet.setPosition(
					x,
					this.model.state.posY - GLOBALS.camera.posY
				);
				this.currentAttackSpriteSheet.render();

				if (this.model.state.attackTicks === this.currentAttackSpriteSheet.maxFrames) {
					this.switchAttackSprite();
				}

			}

		} else {
			this.moveSprite.setDirection(this.model.state.direction);
			this.moveSprite.setPosition(
				this.model.state.posX - GLOBALS.camera.posX, 
				this.model.state.posY - GLOBALS.camera.posY
			);
			this.moveSprite.render();
		}
	}
}

export default PlayerView;