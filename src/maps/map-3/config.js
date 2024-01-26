import { GLOBALS } from '../../globals.js';

let config = {
	gravity: 1,
	state: undefined,
	setPlayerPosition: function(player, enterFrom){

		// Default position

		let x = 80, y = 600; // Start

		player.state.posX = x; 
		player.state.posY = y;
	}
};

export default config;