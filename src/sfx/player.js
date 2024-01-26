import { GLOBALS } from '../globals.js';

import WalkingSound from './walking.ogg';
import SwoshSound from './swosh.ogg';
import LandingSound from './landing.ogg';
import HurtSound from './hurt.ogg';
import JumpingSound from './exhale.ogg';
import ExhaleSound from './exhale3.ogg';
import ShatterSound from './shatter.ogg';
import SlowWoshSound from './slow-wosh.ogg';

class PlayerAudioController {
	constructor(model){
		this.model = model;
		this.model.emitter.on('change', this.update);

		this.walking = new Audio(WalkingSound);
		this.walking.loop = true;
		this.walking.volume = 0.1;
		this.walking.playbackRate = 2;

		this.swosh = new Audio(SwoshSound);
		this.swosh.volume = 0.4;
		this.swosh.playbackRate = 2;

		this.landing = new Audio(LandingSound);
		this.landing.volume = 0.1;
		this.landing.playbackRate = 1;

		this.hurt = new Audio(HurtSound);
		this.hurt.volume = 0.1;
		this.hurt.playbackRate = 1;

		this.exhale = new Audio(ExhaleSound);
		this.exhale.volume = 0.4;
		this.exhale.playbackRate = 1;
		this.exhale.currentTime = 500;

		this.jumping = new Audio(JumpingSound);
		this.jumping.volume = 0.1;
		this.jumping.playbackRate = 1;
		this.jumping.currentTime = 800;

		this.shatter = new Audio(ShatterSound);
		this.shatter.volume = 0.2;

		this.state = {
			hasLanded: false
		};
	}

	update = () => {
		if (this.model.state.grounded && 
			(this.model.state.moveLeft || this.model.state.moveRight)) {
			this.walking.play();
		} else {
			this.walking.pause();
		}

		if (this.model.state.attacking && this.model.state.attackTicks === 0) {
			this.swosh.play();
			this.exhale.play();
		}

		if (this.model.state.attackTicks === this.model.state.attackSpeed) {
			this.exhale.currentTime = 500;
		}

		if ((this.model.state.grounded || this.model.state.wallSlide) && !this.state.hasLanded) {
			this.landing.play();
			this.state.hasLanded = true;
			this.jumping.currentTime = 800;
		}
		
		if (!this.model.state.grounded) {
			this.landing.currentTime = 0;
			this.state.hasLanded = false;
		}

		if (this.model.state.takingDamage) {
			this.hurt.play();
		}

		if (this.model.state.jumpTicks == 1) {
			this.jumping.play();
		}

		if (this.model.state.dead) {
			this.shatter.play();
		}
	}
}

export default PlayerAudioController;