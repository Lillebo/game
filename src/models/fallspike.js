import { GLOBALS } from '../globals.js';
import { 
	getCollisionBox, 
	willCollide, 
	aabb
} from '../utils.js';

import EntityModel from './entity.js';
import PlayerModel from './player.js';
import SpikeView from '../views/spike.js';

class FallSpikeModel extends EntityModel {
	
	constructor(props){
		super(props, true);

		this.state = Object.assign({}, this.state, {
			height: GLOBALS.tileSize,
			weight:0
		});

		this.tripwire = undefined;

		this.view = new SpikeView(this);

		console.log('FallSpikeModel init');
	}

	makeTripWireBox(){
		
		let tripwireState = Object.assign({}, this.state, {
			posY: this.state.posY + this.state.height
		});

		let box = getCollisionBox(tripwireState);
		let maxLoops = 20;

		let collisions = willCollide(this, box);

		while (!collisions.length && maxLoops > 0) {
			box.h += GLOBALS.tileSize;
			collisions = willCollide(this, box);
			maxLoops--;
		}

		box.h -= GLOBALS.tileSize;

		return box;
	}

	tick(){
		if (!this.tripwire) {
			this.tripwire = this.makeTripWireBox();
		}

		// Check if tripwire collides with player

		let playerBox = getCollisionBox(GLOBALS.player.state);
		if (aabb(this.tripwire, playerBox)) {
			this.state.weight = 1;
		}

		super.tick();
	}
}

export default FallSpikeModel;