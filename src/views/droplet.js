import { GLOBALS } from '../globals.js';

class DropletView {
	constructor(model){
		this.model = model;
		this.model.emitter.on('change', this.render);
	}

	render = () => {
		let radius = this.model.state.width/2;

		GLOBALS.ctx.beginPath();
		GLOBALS.ctx.arc(
			this.model.state.posX - GLOBALS.camera.posX,
			this.model.state.posY - GLOBALS.camera.posY,
			radius,
			0,
			2 * Math.PI
		);
		GLOBALS.ctx.fillStyle = this.model.state.fillColor;
		GLOBALS.ctx.fill();
	}
}

export default DropletView;