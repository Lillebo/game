import TileModel from './tile.js';
import SpikeView from '../views/spike.js';

class SpikeModel extends TileModel {
	constructor(props){
		super(props);

		this.state = Object.assign({}, this.state, {
			damage: 999
		});

		this.view = new SpikeView(this);
	}

	tick(){
		super.tick();
	}
}

export default SpikeModel;