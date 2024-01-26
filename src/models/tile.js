import EventEmitter from 'events';
import { GLOBALS } from '../globals.js';

import TileView from '../views/tile.js';

class TileModel {
	constructor(props, subclass){
		this.state = {
			posX: 	props.posX * GLOBALS.tileSize,
			posY: 	props.posY * GLOBALS.tileSize,
			width: 	GLOBALS.tileSize,
			height: GLOBALS.tileSize,
			type: props.type || undefined
		};

		this.emitter = new EventEmitter();

		if (!subclass) {
			this.view = new TileView(this);
		}
		
		this.emitter.emit('change');
	}

	tick() {
		this.emitter.emit('change');
	}
}

export default TileModel;