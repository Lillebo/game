import { GLOBALS } from '../globals.js';

class SpriteSheet {

	constructor(path, frameWidth, frameHeight, posX, posY, direction, loop){

		this.sprite = new Image();

		this.sprite.src = path;
		this.frameWidth = frameWidth;
		this.frameHeight = frameHeight;

		this.posX = posX;
		this.posY = posY;
		this.direction = direction;
		this.loop = (typeof loop === 'undefined') ? true : loop;

		this.currentFrame = 0;
		this.displayFrame = this.currentFrame;
		this.maxFrames = undefined;
		this.ready = false;

		this.sprite.onload = () => {

			this.maxFrames = this.sprite.naturalWidth / frameWidth;
			this.ready = true;

		};

		this.sprite.onerror = () => {
			console.error('SpriteSheet failed to load image', this.sprite);
		};

	}

	setDirection(direction){
		this.direction = direction;
	}

	setPosition(posX, posY){
		this.posX = posX;
		this.posY = posY;
	}

	update(){
		
		if (!this.loop) {
			// console.log(this.currentFrame, this.maxFrames);
			if (this.currentFrame + 1 == this.maxFrames) {
				this.displayFrame = this.currentFrame * this.frameWidth;
				return;
			}
		}

		this.currentFrame = (this.currentFrame + 1) % this.maxFrames;

		if (this.direction === 'left') {
			this.displayFrame = this.currentFrame * this.frameWidth;
		} else {
			this.displayFrame = (this.maxFrames - this.currentFrame - 1) * this.frameWidth;
		}
	}

	render(opacity){

		if (!this.ready) {
			return;
		}

		if (opacity) {
			GLOBALS.ctx.globalAlpha = opacity;
		}

		GLOBALS.ctx.drawImage(
			this.sprite, 
			this.displayFrame,
			(this.direction === 'left') ? 0 : this.frameHeight,
			this.frameWidth,
			this.frameHeight,
			this.posX, 
			this.posY,
			this.frameWidth,
			this.frameHeight
		);

		GLOBALS.ctx.globalAlpha = 1;

		this.update();
	}

}

export default SpriteSheet;