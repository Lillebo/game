import { GLOBALS } from '../globals.js';
import { getCollisionBox, willCollideWithTiles } from '../utils.js';

import EntityModel from './entity.js';
import CoinView from '../views/coin.js';

class CoinModel extends EntityModel {

	constructor(props){
		super(props, true);

		console.log('Coin init');

		this.state = Object.assign(this.state, {
			width: GLOBALS.tileSize/2,
			height: GLOBALS.tileSize/2,
			friction: 0.1,
			value: 1
		});

		this.view = new CoinView(this);

		this.createdTime = window.performance.now();
	}

	tick = () => {
		super.tick();

		// Expire after 10 seconds

		let now = window.performance.now();
		if (now - this.createdTime > 10000) {
			this.destroy();
		}
	}

}

export default CoinModel;