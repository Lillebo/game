import map0 	  	from './map-0/map.js';
import map0Config 	from './map-0/config.js';

import map1			from './map-1/map.js';
import map1Config	from './map-1/config.js';

import map2			from './map-2/map.js';
import map2Config	from './map-2/config.js';

import map3			from './map-3/map.js';
import map3Config	from './map-3/config.js';

let maps = [
	{
		tiles: map0,
		config: map0Config
	},
	{
		tiles: map1,
		config: map1Config
	},
	{
		tiles: map2,
		config: map2Config
	},
	{
		tiles: map3,
		config: map3Config
	}
];

export default maps;