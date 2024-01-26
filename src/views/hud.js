import { GLOBALS } from '../globals.js';

import rotateSprites from '../gfx/coin-rotate-sprites.png';

class Hud {
	constructor(playerModel){
		this.playerModel = playerModel;
		// this.playerModel.emitter.on('change', this.render);

		this.coinSprite = new Image();
		this.coinSprite.src = rotateSprites;

		this.ready = false;

		this.coinSprite.onload = () => {
			this.ready = true;
		};
	}

	render = () => {

		if (!this.ready) {
			return;
		}

		// Player health hud

		for (let x = 0; x < this.playerModel.state.maxHealth; x++) {

			GLOBALS.ctx.beginPath();
			GLOBALS.ctx.arc(
				40 + (x * 20),
				40,
				5,
				0,
				2 * Math.PI
			);

			if (this.playerModel.state.health < (x + 1)) {
				GLOBALS.ctx.fillStyle = 'rgba(50,50,50,1)';
			} else {
				GLOBALS.ctx.fillStyle = 'rgba(255,255,255,1)';
			}

			GLOBALS.ctx.fill();

		}

		// Player money
		GLOBALS.ctx.fillStyle = 'rgba(255,255,255,0.4)';
		GLOBALS.ctx.fillText(this.playerModel.state.money, 50, 70);

		GLOBALS.ctx.drawImage(
			this.coinSprite, 
			0,
			0,
			10,
			10,
			35, 
			60,
			10,
			10
		);
	}
}

export default Hud;