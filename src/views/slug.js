import { GLOBALS } from '../globals.js';
import { getRandomInt } from '../utils.js';

import EntityModel from '../models/entity.js';
import DropletModel from '../models/droplet.js';

import SpriteSheet from './spritesheet.js';
import moveSprites from '../gfx/slug-move-sprites.png';

import RadialGradientAnimation from './radial-gradient-animation.js';
import CircleAnimation from './circle-animation.js';

class SlugView {

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

	}

	render = () => {

		GLOBALS.ctx.globalCompositeOperation = "source-over";

		this.moveSprite.setDirection(this.model.state.direction);
		this.moveSprite.setPosition(
			this.model.state.posX - GLOBALS.camera.posX, 
			this.model.state.posY - GLOBALS.camera.posY
		);
		this.moveSprite.render();

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

export default SlugView;