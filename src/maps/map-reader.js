let fs  = require('fs');
let png = require('pngjs2').PNG;

if (process.argv.length < 3) {
	throw new Error('Missing input file argument');
}

let inputFile = process.argv[2];
let name = inputFile.split('.')[0];

fs.createReadStream(inputFile)
	.pipe(new png())
	.on('parsed', function(){

		let map = [];

		for (let y = 0; y < this.height; y++) {

			if (!map[y]) {
				map[y] = [];
			}

			for (let x = 0; x < this.width; x++) {

				let idx = (this.width * y + x) << 2;
				let r, g, b, a, tile;

				r = this.data[idx];
				g = this.data[idx + 1];
				b = this.data[idx + 2];
				a = this.data[idx + 3];

				if (a) {

					let colorCode = r + ':' + g + ':' + b;

					let codes = {
						'dirt': 	 '0:0:0',
						'player': 	 '0:0:255',
						'spike':     '255:0:0',
						'fallspike': '255:50:0',
						'slug': 	 '255:174:201',
						'health': 	 '15:211:24',
						'handle': 	 '255:138:0',
						'door': 	 '110:110:110',
						'boss': 	 '255:0:222',
						'ability':   '255:255:0',
						'airslug':   '255:201:14',
						'exit':      '0:162:232',
						'sentry':    '255:100:200'
					};

					switch (colorCode) {
						case codes['player']:
							map[y][x] = 1;
							break;
						case codes['dirt']:
							map[y][x] = 2;
							break;
						case codes['slug']: 
							map[y][x] = 3;
							break;
						case codes['health']: 
							map[y][x] = 4;
							break;
						case codes['handle']: 
							map[y][x] = 5;
							break;
						case codes['door']: 
							map[y][x] = 6;
							break;
						case codes['boss']: 
							map[y][x] = 7;
							break;
						case codes['ability']: 
							map[y][x] = 8;
							break;
						case codes['airslug']: 
							map[y][x] = 9;
							break;
						case codes['exit']: 
							map[y][x] = '\'x\'';
							break;
						case codes['sentry']: 
							map[y][x] = '\'s\'';
							break;
						case codes['spike']: 
							map[y][x] = '\'w\'';
							break
						case codes['fallspike']: 
							map[y][x] = '\'v\'';
							break
						default:
							map[y][x] = 0;
							break;
					}

				} else {
					map[y][x] = 0;
				}

			}
		}

		let rows = [];

		for (let y = 0; y < map.length; y++) {
			rows.push('[ ' + map[y].join(', ') + ' ]');
		}

		let exportName = 'map';

		let output = 'let '+exportName+' = [\n'+rows.join(',\n')+'\n];\nexport default '+exportName+';';

		fs.writeFile('./'+name+'.js', output, function(err){
			if (err) {
				return console.log(err);
			}

			console.log('File saved!');
		});

	});