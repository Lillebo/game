import { 
	getCollisionBox, 
	willCollide
} from '../utils.js';

import EntityModel from './entity.js';
import DropletView from '../views/droplet.js';

class DropletModel extends EntityModel {

	constructor(props){
		super(props, true);

		this.state = Object.assign(this.state, {
			friction: 0.1,
			fillColor: props.fillColor
		});

		this.view = new DropletView(this);
	}

	tick = () => {
		super.tick();

		let box = getCollisionBox(this.state);
			box.x -= 1;
			box.y -= 1;
			box.w += 2;
			box.h += 2;

		let collisions = willCollide(this, box);
		if (collisions.length) {
			this.destroy();
		}
	}

}

export default DropletModel;