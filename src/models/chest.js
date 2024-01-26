import { GLOBALS } from '../globals.js';
import { getRandomInt } from '../utils.js';

import DestructibleModel from './destructible.js';
import CoinModel from './coin.js';

import ChestView from '../views/chest.js';
import ChestAudioController from '../sfx/chest.js';

class ChestModel extends DestructibleModel {
	constructor(props){
		super(props, true);

		this.state = Object.assign({}, this.state, {
			width: GLOBALS.tileSize * 4,
			height: GLOBALS.tileSize * 3,
			dropCoins: props.dropCoins || 25,
			collides: true
		});

		this.view = new ChestView(this);
		this.audio = new ChestAudioController(this);
		
		this.dropped = false;
	}

	dropCoins = () => {

		let posX = (this.state.posX + (this.state.width/2))/GLOBALS.tileSize;
		for (let x = 0; x < this.state.dropCoins; x++) {
			GLOBALS.entities.push(
				new CoinModel({
					posX: posX,
					posY: (this.state.posY / GLOBALS.tileSize) - 1,
					velX: getRandomInt(-6, 6),
					velY: getRandomInt(0, -12)
				})
			);
		}
		this.dropped = true;
	}

	tick(){
		if (this.state.destroyed && !this.dropped) {
			
			this.state.height = GLOBALS.tileSize * 2;
			this.state.posY += GLOBALS.tileSize;

			this.dropCoins();
		}

		super.tick();
	}
}

export default ChestModel;