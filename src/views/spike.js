import { GLOBALS } from '../globals.js';

class SpikeView {

	constructor(model){
		this.model = model;
		this.model.emitter.on('change', this.render);
	}

	render = () => {
		GLOBALS.ctx.fillStyle = 'rgba(255, 0, 0, 0.25)';
		GLOBALS.ctx.fillRect(
			this.model.state.posX - GLOBALS.camera.posX, 
			this.model.state.posY - GLOBALS.camera.posY, 
			this.model.state.width, 
			this.model.state.height
		);

		// if (this.model.hasOwnProperty('tripwire')) {

		// 	GLOBALS.ctx.fillStyle = 'rgba(255, 0, 0, 0.10)';
		// 	GLOBALS.ctx.fillRect(
		// 		this.model.tripwire.x - GLOBALS.camera.posX, 
		// 		this.model.tripwire.y - GLOBALS.camera.posY, 
		// 		this.model.tripwire.w, 
		// 		this.model.tripwire.h
		// 	);
		// }
	}
}

export default SpikeView;