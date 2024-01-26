import { GLOBALS } from '../globals.js';
import { getRandomInt } from '../utils.js';

import EntityModel from '../models/entity.js';
import DropletModel from '../models/droplet.js';

import SpriteSheet from './spritesheet.js';
import walkSprites from '../gfx/sentry-jumper-walking-sprites.png';
import jumpSprite from '../gfx/sentry-jumper-jump-sprite.png';
import fallSprite from '../gfx/sentry-jumper-fall-sprite.png';

import RadialGradientAnimation from './radial-gradient-animation.js';
import CircleAnimation from './circle-animation.js';

class SentryJumperView {

	constructor(model){
		// console.log('EntityView init');

		this.model = model;
		this.model.emitter.on('change', this.render);

		this.walkSprite = new SpriteSheet(
			walkSprites, 
			this.model.state.width,
			this.model.state.height,
			this.model.state.posX - GLOBALS.camera.posX,
			this.model.state.posY - GLOBALS.camera.posY,
			this.model.state.direction
		);

		this.ready = 0;

		this.jumpSprite = new Image();
		this.jumpSprite.src = jumpSprite;
		this.jumpSprite.onload = () => {
			this.ready++;
		};

		this.fallSprite = new Image();
		this.fallSprite.src = fallSprite;
		this.fallSprite.onload = () => {
			this.ready++;
		};
	}

	showFieldOfView(){

		let color = '0,255,0';

		if (this.model.chargeMode) {
			color = '255,0,0';
		}
		
		if (this.model.hasOwnProperty('leftFieldOfView')) {

			GLOBALS.ctx.fillStyle = 'rgba('+color+', 0.10)';
			GLOBALS.ctx.fillRect(
				this.model.leftFieldOfView.x - GLOBALS.camera.posX, 
				this.model.leftFieldOfView.y - GLOBALS.camera.posY, 
				this.model.leftFieldOfView.w, 
				this.model.leftFieldOfView.h
			);
		}

		if (this.model.hasOwnProperty('rightFieldOfView')) {

			GLOBALS.ctx.fillStyle = 'rgba('+color+', 0.10)';
			GLOBALS.ctx.fillRect(
				this.model.rightFieldOfView.x - GLOBALS.camera.posX, 
				this.model.rightFieldOfView.y - GLOBALS.camera.posY, 
				this.model.rightFieldOfView.w, 
				this.model.rightFieldOfView.h
			);
		}
	}

	render = () => {

		GLOBALS.ctx.globalCompositeOperation = "source-over";

		if (!this.model.chargeMode) {
			this.walkSprite.setDirection(this.model.state.direction);
			this.walkSprite.setPosition(
				this.model.state.posX - GLOBALS.camera.posX, 
				this.model.state.posY - GLOBALS.camera.posY
			);
			this.walkSprite.render();
		} else {
			if (this.model.state.velY > 4) {
				GLOBALS.ctx.drawImage(
					this.fallSprite, 
					0,
					(this.model.state.direction === 'left') ? 0 : 70,
					40,
					70,
					this.model.state.posX - GLOBALS.camera.posX, 
					this.model.state.posY - GLOBALS.camera.posY - 10, 
					40,
					70
				);
			} else {
				GLOBALS.ctx.drawImage(
					this.jumpSprite, 
					0,
					(this.model.state.direction === 'left') ? 0 : 60,
					40,
					60,
					this.model.state.posX - GLOBALS.camera.posX, 
					this.model.state.posY - GLOBALS.camera.posY, 
					40,
					60
				);
			}
		}

		// this.showFieldOfView();

		if (this.model.state.health <= 0 && this.model.state.takingDamage) {
			new CircleAnimation({
				posX:   this.model.state.posX + this.model.state.width/2,
				posY:   this.model.state.posY + this.model.state.height/2,
				beginRadius: 20,
				endRadius: 40,
				fillColor: 'rgba(0,255,0,0.2)',
				autoPlay: true,
				maxFrames: 10
			});
		}

		if (this.model.state.takingDamage) {

			new RadialGradientAnimation({
				posX: this.model.state.posX + this.model.state.width/2,
				posY: this.model.state.posY + this.model.state.height/2,
				innerColor: 'rgba(0,255,0,0)',
				outerColor: 'rgba(0,255,0,0.2)',
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
						fillColor: 'rgba(55,159,26,1)'
					})
				);
			}

		}
	}
}

export default SentryJumperView;