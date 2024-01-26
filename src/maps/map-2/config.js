import { GLOBALS } from '../../globals.js';

let config = {
	gravity: 1,
	exits: {
		'right' : 0
	},
	setPlayerPosition: function(player, enterFrom){

		// Default position

		let x = 1085, 
			y = 380;

		player.state.posX = x; 
		player.state.posY = y;
	}
};

export default config;