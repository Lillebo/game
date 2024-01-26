class GamepadManager {

	constructor(){

		console.log('GamepadManager init');

		this.gamepad 	= navigator.getGamepads()[0];
		this.connected 	= (this.gamepad);
		this.buttons 	= [];
		this.axes 	 	= [];

		addEventListener('gamepadconnected', this.gamepadconnected);
		addEventListener('gamepaddisconnected', this.gamepaddisconnected);
	}

	gamepadconnected = (e) => {
		console.log(e);
		this.gamepad = navigator.getGamepads()[0];
		this.connected = true;
		console.log(this.gamepad);
	}

	gamepaddisconnected = (e) => {
		console.log(e);
		this.gamepad = undefined;
		this.connected = false;
	}

	updateStatus = () => {

		this.gamepad = navigator.getGamepads()[0];

		if (this.gamepad && this.gamepad.connected) {

			// Register buttons

			for (let b = 0; b < this.gamepad.buttons.length; b++) {

				let buttonValue = this.gamepad.buttons[b];
				let pressed = buttonValue.pressed;

				if (pressed) {
					// console.log(b);
				}

				this.buttons[b] = pressed;
			}

			// Register axes

			for (let a = 0; a < this.gamepad.axes.length; a++) {
				this.axes[a] = this.gamepad.axes[a].toFixed(4);
			}

		}

	}

	getButtons() {
		if (this.connected) {
			this.updateStatus();

			return this.buttons;

		}
		return this.connected;
	}

	getAxes() {
		if (this.connected) {
			this.updateStatus();

			return this.axes;
		}
		
		return this.connected;
	}
}

export default GamepadManager;