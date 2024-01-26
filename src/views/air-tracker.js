import { GLOBALS } from '../globals.js';
import { getRandomInt } from '../utils.js';

import DropletModel from '../models/droplet.js';

import SpriteSheet from './spritesheet.js';
import flySprites from '../gfx/bat-flying-sprites.png';
import chargeSprites from '../gfx/bat-flying-charge-sprites.png';

import RadialGradientAnimation from './radial-gradient-animation.js';
import CircleAnimation from './circle-animation.js';

class AirTrackerView {

	constructor(model){

		// console.log('AirTrackerView init');

		this.model = model;
		this.model.emitter.on('change', this.render);

		let xOffset = (this.model.state.direction === 'right') ? 15 : 13;

		this.flySprite = new SpriteSheet(
			flySprites, 
			68,
			40,
			this.model.state.posX - GLOBALS.camera.posX - xOffset,
			this.model.state.posY - GLOBALS.camera.posY - 10,
			this.model.state.direction
		);

		this.chargeSprite = new SpriteSheet(
			chargeSprites, 
			68,
			40,
			this.model.state.posX - GLOBALS.camera.posX - xOffset,
			this.model.state.posY - GLOBALS.camera.posY - 10,
			this.model.state.direction
		);
	}

	showFieldOfView(){

		let color = '0,255,0';

		if (this.model.chargeMode) {
			color = '255,0,0';
		}

		if (this.model.hasOwnProperty('fieldOfView')) {
			GLOBALS.ctx.fillStyle = 'rgba('+color+', 0.15)';

			GLOBALS.ctx.fillRect(
				this.model.fieldOfView.x - GLOBALS.camera.posX, 
				this.model.fieldOfView.y - GLOBALS.camera.posY, 
				this.model.fieldOfView.w, 
				this.model.fieldOfView.h
			);
		}
	}

	render = () => {

		let xOffset = (this.model.state.direction === 'right') ? 15 : 13;

		if (this.model.chargeMode) {
			this.chargeSprite.setDirection(this.model.state.direction);
			this.chargeSprite.setPosition(
				this.model.state.posX - GLOBALS.camera.posX - xOffset,
				this.model.state.posY - GLOBALS.camera.posY - 10,
			);
			this.chargeSprite.render();
		} else {
			this.flySprite.setDirection(this.model.state.direction);
			this.flySprite.setPosition(
				this.model.state.posX - GLOBALS.camera.posX - xOffset,
				this.model.state.posY - GLOBALS.camera.posY - 10,
			);
			this.flySprite.render();
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

export default AirTrackerView;