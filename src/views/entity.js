import { GLOBALS } from '../globals.js';

class EntityView {

	constructor(model){

		// console.log('EntityView init');

		this.model = model;
		this.model.emitter.on('change', this.render);
	}

	render = () => {
		GLOBALS.ctx.fillStyle = 'rgba(255, 0, 0, 1)';

		GLOBALS.ctx.fillRect(
			this.model.state.posX - GLOBALS.camera.posX, 
			this.model.state.posY - GLOBALS.camera.posY, 
			this.model.state.width, 
			this.model.state.height
		);
	}
}

export default EntityView;