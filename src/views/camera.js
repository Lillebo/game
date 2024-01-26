import { GLOBALS } from '../globals.js';

class Camera {

	constructor(map){
		console.log('Camera init');

		this.width = 800;
		this.height = this.width * 9/16;

		this.setBounds(map);
	}
	
	setBounds(map){
		this.maxX = map.tiles[0].length * GLOBALS.tileSize - this.width;
		this.maxY = map.tiles.length * GLOBALS.tileSize - this.height;
	}

	register(model){
		this.model = model;
		
		console.log('Camera registered to ', this.model);

		this.update();

		this.model.emitter.on('change', () => {

			this.posX = (this.model.state.posX) - this.width/2;
			this.posY = (this.model.state.posY) - this.height/2;

			this.posX = Math.max(0, Math.min(this.posX, this.maxX));
			this.posY = Math.max(0, Math.min(this.posY, this.maxY));
		});
	}

	update(){

		if (this.model) {

			this.posX = (this.model.state.posX) - this.width/2;
			this.posY = (this.model.state.posY) - this.height/2;

			this.posX = Math.max(0, Math.min(this.posX, this.maxX));
			this.posY = Math.max(0, Math.min(this.posY, this.maxY));
		}

	}
}

export default Camera;