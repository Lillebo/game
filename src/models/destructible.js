import { GLOBALS } from '../globals.js';

import EntityModel from './entity.js';

class DestructibleModel extends EntityModel {

	constructor(props, subclass){
		super(props, subclass);

		this.state = Object.assign({}, this.state, {
			health: props.health || 1,
			destroyed: false
		});
	}

	checkHealth(nextState){
		if (nextState.health <= 0) {
			console.log('Destructible destroyed');
			nextState.destroyed = true;
		}

		return nextState;
	}

	tick(){
		let nextState = Object.assign({}, this.state);

		if (!nextState.destroyed) {
			nextState = this.checkHealth(nextState);
		}

		this.state = Object.assign({}, nextState);
		this.emitter.emit('change');

		this.state.takingDamage = false;
	}
}

export default DestructibleModel;