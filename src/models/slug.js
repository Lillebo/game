import { GLOBALS } from '../globals.js';
import { getRandomInt } from '../utils.js';
import MobModel from './mob.js';
import SlugView from '../views/slug.js';
import SlugAudioController from '../sfx/slug.js';

class SlugModel extends MobModel {
	constructor(props){
		super(props, true);

		let moveRight = (getRandomInt(0, 10) % 2 === 0);

		this.state = Object.assign({}, this.state, {
			type: 'slug',
			width: GLOBALS.tileSize * 2,
			height: GLOBALS.tileSize,
			moveRight: moveRight,
			moveLeft: !moveRight,
			direction: 'right',
			health: 2,
			dropCoins: 2
		});

		this.view = new SlugView(this);
		this.audio = new SlugAudioController(this);
	}
}

export default SlugModel;