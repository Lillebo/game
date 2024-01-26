import { GLOBALS } from '../../globals.js';

let config = {
	gravity: 1,
	exits: {
		'right' : 1,
		'left'  : 2
	},
	state: undefined,
	setPlayerPosition: function(player, enterFrom){

		// Default position

		// let x = 50, y = 440; // Start
		let x = 150, y = 320; // Start 2
		// let x = 1875, y = 440; // Right most exit

		switch (enterFrom) {
			case 'right': 	x = 1935; 	y = 440; 	break;
			case 'left': 	x = -23;	y = 940; 	break;
		}

		player.state.posX = x; 
		player.state.posY = y;
	}
};

export default config;