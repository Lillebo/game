import TakingDamageSound from './thump-cut.ogg';
import OpeningSound from './chest-open.ogg';

class ChestAudioController {
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

			let openingSound = new Audio(OpeningSound);
				openingSound.playbackRate = 3;
				openingSound.volume = 0.2;

			openingSound.play();
		}
	}
}

export default ChestAudioController;