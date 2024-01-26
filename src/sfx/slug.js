import TakingDamageSound from './slug-hit.ogg';

class SlugAudioController {
	constructor(model){
		this.model = model;
		this.model.emitter.on('change', this.update);

		// this.takingDamage = new Audio(TakingDamageSound);
		// this.takingDamage.volume = 0.2;
	}

	update = () => {
		if (this.model.state.takingDamage) {

			let takingDamageSound = new Audio(TakingDamageSound);
				takingDamageSound.volume = 0.2;

			takingDamageSound.play();
		}
	}
}

export default SlugAudioController;