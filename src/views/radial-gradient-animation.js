import { GLOBALS } from '../globals.js';
import Animation from './animation.js';

class RadialGradientAnimation extends Animation {
	constructor(props){

		super(props);

		this.biggestRadius = (props.endRadius > props.beginRadius) ? props.endRadius : props.beginRadius ;

		this.state = Object.assign({}, this.state, {
			width: 			this.biggestRadius * 2,
			height: 		this.biggestRadius * 2,
			innerColor: 	props.innerColor,
			outerColor: 	props.outerColor,
			beginRadius: 	props.beginRadius,
			endRadius: 		props.endRadius,
			endOpacity: 	props.endOpacity
		});

		GLOBALS.animations.push(this);

	}

	tick = () => {
		super.tick();
		this.render();
	}

	render = () => {

		let radius = this.state.beginRadius + (((this.state.endRadius - this.state.beginRadius) / this.state.maxFrames) * this.state.currentFrame);

		let gradient1 = GLOBALS.ctx.createRadialGradient(
			this.state.posX - GLOBALS.camera.posX, 
			this.state.posY - GLOBALS.camera.posY, 
			radius, 
			this.state.posX - GLOBALS.camera.posX, 
			this.state.posY - GLOBALS.camera.posY, 
			0
		);

		gradient1.addColorStop(0, this.state.innerColor);
		gradient1.addColorStop(1, this.state.outerColor);

		// GLOBALS.ctx.globalCompositeOperation = "soft-light";

		GLOBALS.ctx.fillStyle = gradient1;
		GLOBALS.ctx.fillRect(
			this.state.posX - GLOBALS.camera.posX - this.biggestRadius, 
			this.state.posY - GLOBALS.camera.posY - this.biggestRadius, 
			this.biggestRadius * 2, 
			this.biggestRadius * 2
		);

	}
}

export default RadialGradientAnimation;