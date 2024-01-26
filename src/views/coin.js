import { GLOBALS } from '../globals.js';
import SpriteSheet from './spritesheet.js';

import rotateSprites from '../gfx/coin-rotate-sprites.png';
import test from '../gfx/test.png';

class CoinView {

	constructor(model){
		this.model = model;
		this.model.emitter.on('change', this.render);

		// console.log('CoinView init');

		this.rotateSprite = new SpriteSheet(
			rotateSprites, 
			this.model.state.width,
			this.model.state.height,
			this.model.state.posX - GLOBALS.camera.posX,
			this.model.state.posY - GLOBALS.camera.posY,
			this.model.state.direction
		);
		this.rotateSprite.render();
	}

	render = () => {

		this.rotateSprite.setDirection(this.model.state.direction);
		this.rotateSprite.setPosition(
			this.model.state.posX - GLOBALS.camera.posX, 
			this.model.state.posY - GLOBALS.camera.posY
		);
		this.rotateSprite.render();
	}
}

export default CoinView;