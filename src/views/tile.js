import { GLOBALS } from '../globals.js';

class TileView {

	constructor(model){
		this.model = model;
		this.model.emitter.on('change', this.render);
	}

	render = () => {
		if (this.model.state.type !== 'exit') {
			GLOBALS.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
			GLOBALS.ctx.fillRect(
				this.model.state.posX - GLOBALS.camera.posX, 
				this.model.state.posY - GLOBALS.camera.posY, 
				this.model.state.width, 
				this.model.state.height
			);
		}
	}
}

export default TileView;