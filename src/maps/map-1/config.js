import { GLOBALS } from '../../globals.js';

let config = {
	gravity: 1,
	exits: {
		'left' : 0
	},
	setPlayerPosition: function(player, enterFrom){

		// Default position

		let x = -15, 
			y = 580;

		player.state.posX = x; 
		player.state.posY = y;
	}
};

export default config;