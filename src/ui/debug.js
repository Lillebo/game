import { GLOBALS } from '../globals.js';
import Handlebars from 'handlebars';
import DebugPlayerTemplate from './templates/debug-player.handlebars';
import DebugCameraTemplate from './templates/debug-camera.handlebars';

class DebugUI {
	
	constructor(player){
		this.player = player;
		this.player.emitter.on('change', this.render);
		
		this.element = document.createElement('div');
		this.element.id = 'debug';

		this.hide = true;

		addEventListener('keyup', this.keyup);
	}

	toggle = () => {
		this.hide = !this.hide;
		this.render();
	}

	keyup = (e) => {
		if (e.keyCode === 220) {
			this.toggle();
		}
	}

	render = () => {

		let playerStateCopy = Object.assign({}, this.player.state, {
			posX: Math.ceil(this.player.state.posX),
			posY: Math.ceil(this.player.state.posY),
			velX: Math.ceil(this.player.state.velX),
			velY: Math.ceil(this.player.state.velY)
		});

		let cameraStateCopy = Object.assign({}, {
			posX: GLOBALS.camera.posX,
			posY: GLOBALS.camera.posY,
			maxX: GLOBALS.camera.maxX,
			maxY: GLOBALS.camera.maxY
		});
		
		let playerHTML = '<h3>Player</h3>' + DebugPlayerTemplate(playerStateCopy);
		let cameraHTML = '<h3>Camera</h3>' + DebugCameraTemplate(cameraStateCopy);

		this.element.innerHTML = playerHTML + cameraHTML;

		let display = (this.hide) ? 'none' : 'block' ;
		this.element.style = 'display:' + display;

		document.getElementsByTagName('body')[0].appendChild(this.element);

	}

}

export default DebugUI;