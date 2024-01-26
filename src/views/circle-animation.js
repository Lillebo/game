import { GLOBALS } from '../globals.js';
import Animation from './animation.js';

class CircleAnimation extends Animation {
	constructor(props){
		super(props);

		this.biggestRadius = (props.endRadius > props.beginRadius) ? props.endRadius : props.beginRadius ;

		this.state = Object.assign({}, this.state, {
			width: 		 this.biggestRadius * 2,
			height: 	 this.biggestRadius * 2,
			beginRadius: props.beginRadius,
			endRadius:   props.endRadius,
			fillColor:   props.fillColor
		});

		GLOBALS.animations.push(this);
	}

	tick = () => {
		super.tick();
		this.render();
	}

	render = () => {

		let radius = this.state.beginRadius + (((this.state.endRadius - this.state.beginRadius) / this.state.maxFrames) * this.state.currentFrame);

		GLOBALS.ctx.beginPath();
		GLOBALS.ctx.arc(
			this.state.posX - GLOBALS.camera.posX,
			this.state.posY - GLOBALS.camera.posY,
			radius,
			0,
			2 * Math.PI
		);
		GLOBALS.ctx.fillStyle = this.state.fillColor;
		GLOBALS.ctx.fill();

	}
}

export default CircleAnimation;