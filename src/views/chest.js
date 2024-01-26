import { GLOBALS } from '../globals.js';
import { getRandomInt } from '../utils.js';

import DropletModel from '../models/droplet.js';
import SpriteSheet from './spritesheet.js';

import closedSprite from '../gfx/chest-closed-sprite.png';
import openingSprites from '../gfx/chest-opening-sprites.png';

import RadialGradientAnimation from './radial-gradient-animation.js';
import CircleAnimation from './circle-animation.js';

class ChestView {

	constructor(model){

		// console.log('EntityView init');

		this.model = model;
		this.model.emitter.on('change', this.render);

		this.closedSprite = new Image();
		this.closedSprite.src = closedSprite;

		this.openingSprite = new SpriteSheet(
			openingSprites, 
			86,
			80,
			this.model.state.posX - GLOBALS.camera.posX - 4,
			this.model.state.posY - GLOBALS.tileSize - GLOBALS.camera.posY - 19,
			'left',
			false
		);
	}

	render = () => {
		if (!this.model.state.destroyed) {
			GLOBALS.ctx.drawImage(
				this.closedSprite, 
				0,
				0,
				82,
				61,
				this.model.state.posX - GLOBALS.camera.posX, 
				this.model.state.posY - GLOBALS.camera.posY,
				82,
				61
			);
		} else {
			this.openingSprite.setPosition(
				this.model.state.posX - GLOBALS.camera.posX - 4,
				this.model.state.posY - GLOBALS.tileSize - GLOBALS.camera.posY - 19,
			);
			this.openingSprite.render();
		}

		let effectColor = '216, 199, 30';

		effectColor = '180,180,180';

		if (this.model.state.health <= 0 && this.model.state.takingDamage) {
			new CircleAnimation({
				posX:   this.model.state.posX + this.model.state.width/2,
				posY:   this.model.state.posY + this.model.state.height/2,
				beginRadius: 20,
				endRadius: 60,
				fillColor: 'rgba('+effectColor+',0.2)',
				autoPlay: true,
				maxFrames: 10
			});
		}

		if (this.model.state.takingDamage) {

			new RadialGradientAnimation({
				posX: this.model.state.posX + this.model.state.width/2,
				posY: this.model.state.posY + this.model.state.height/2,
				innerColor: 'rgba('+effectColor+',0)',
				outerColor: 'rgba('+effectColor+',0.2)',
				beginRadius: 50,
				endRadius: 	100,
				endOpacity: 0.5,
				autoPlay: true,
				maxFrames: 5
			});

			for (let x = 0; x < 5; x++) {
				
				let radius = getRandomInt(2, 4);

				effectColor = '73,49,39';

				GLOBALS.entities.push(
					new DropletModel({
						posX: (this.model.state.posX / GLOBALS.tileSize),
						posY: (this.model.state.posY / GLOBALS.tileSize),
						velX: getRandomInt(-10, 10),
						velY: getRandomInt(-5, -15),
						width: radius,
						height: radius,
						fillColor: 'rgba('+effectColor+',1)'
					})
				);
			}

		}

	}
}

export default ChestView;