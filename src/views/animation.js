import { GLOBALS } from '../globals.js';

class Animation {
	constructor(props){

		this.state = {
			posX: 			props.posX,
			posY: 			props.posY,
			width: 			props.width 		|| undefined,
			height: 		props.height 		|| undefined,
			currentFrame: 	props.currentFrame 	|| 0,
			maxFrames: 		props.maxFrames 	|| undefined,
			loop: 			props.loop 			|| false,
			autoplay: 		props.autoplay		|| false,
			play: 			props.autoplay 		|| false
		};

		if (this.state.autoplay) {
			this.play();
		}
	}

	play = () => {
		this.state = Object.assign(this.state, {
			play: true
		});
	}

	tick() {
		if (this.play) {
			if (this.state.currentFrame < this.state.maxFrames) {
				this.state.currentFrame++;
			} else {
				if (!this.state.loop) {
					this.destroy();
				}
			}
		}
	}

	destroy = () => {
		for (let x = 0; x < GLOBALS.animations.length; x++) {
			if (GLOBALS.animations[x] === this) {
				GLOBALS.animations.splice(x, 1);
			}
		}
	}
}

export default Animation;