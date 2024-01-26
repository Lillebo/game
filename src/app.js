import { GLOBALS } from './globals.js';
import { aabb, getViewport } from './utils.js';

import TileModel from './models/tile.js';
import EntityModel from './models/entity.js';
import PlayerModel from './models/player.js';
import MobModel from './models/mob.js';
import SlugModel from './models/slug.js';
import AirSlugModel from './models/air-slug.js';
import SpikeModel from './models/spike.js';
import FallSpikeModel from './models/fallspike.js';
import SentryModel from './models/sentry.js';
import SentryJumperModel from './models/sentry-jumper.js';
import AirTrackerModel from './models/air-tracker.js';
import DropletModel from './models/droplet.js';
import CoinModel from './models/coin.js';
import ChestModel from './models/chest.js';

import Camera from './views/camera.js';
import DebugUI from './ui/debug.js';
import Hud from './views/hud.js';

import maps from './maps/maps.js';

// import map from './maps/map-3-b.js';
// import mapTexture from './maps/map-3-texture.png';
import mapBackground from './maps/old/map-3-background.png';

class App {

	constructor(){
		console.log('App init', maps);

		// Default start map

		this.currentMapIndex = 0;
		this.currentMap = maps[this.currentMapIndex];

		// Init camera

		GLOBALS.camera = new Camera(this.currentMap);

		// Init player

		this.player = new PlayerModel({
			width: GLOBALS.tileSize, 
			height: (GLOBALS.tileSize * 2),
			direction: 'right'
		});

		GLOBALS.player = this.player;

		// Load map tiles

		this.loadMapTiles(this.currentMap.tiles);

		// Run map init script (give player a position etc)

		this.currentMap.config.setPlayerPosition(this.player);

		// Register player on camera

		GLOBALS.camera.register(this.player);

		// Set HUD

		GLOBALS.hud = new Hud(this.player);

		// Configure canvas

		GLOBALS.canvas.width  = GLOBALS.camera.width;
		GLOBALS.canvas.height = GLOBALS.camera.height;

		this.setCanvasScale();

		this.debug = new DebugUI(this.player);

		// this.mapTextureFile = new Image();
		// this.mapTextureFile.src = mapTexture;
		// this.mapTextureFile.onload = () => {
		// 	console.log('Textures loaded');
		// 	if (this.checkAssetsLoaded()) {
		// 		this.run();
		// 	}
		// };

		// this.mapBackgroundFile = new Image();
		// this.mapBackgroundFile.src = mapBackground;
		// this.mapBackgroundFile.onload = () => {
		// 	console.log('Background loaded');
		// 	if (this.checkAssetsLoaded()) {
		// 		this.run();
		// 	}
		// };

		this.run();

		addEventListener('keydown', this.keydown);
	}

	changeMap(exit){

		// Stop the tick cycle

		this.stop();

		// Save currentMap state

		this.currentMap.config.state = {
			tiles: GLOBALS.tiles,
			entities: GLOBALS.entities
		};

		// Set new currentMap

		this.currentMapIndex = this.currentMap.config.exits[exit];
		this.currentMap = maps[this.currentMapIndex];

		// Reset tickables

		GLOBALS.tiles = [];
		GLOBALS.entities = [];

		// Load new tickables

		if (this.currentMap.config.state) {
			GLOBALS.tiles = this.currentMap.config.state.tiles;
			GLOBALS.entities = this.currentMap.config.state.entities;
		} else {
			this.loadMapTiles(this.currentMap.tiles);
		}

		// Set new camera bounds

		GLOBALS.camera.setBounds(this.currentMap);

		// Inform new map where player enter it from

		let enterFrom = (exit === 'left') ? 'right' : 'left' ;

		this.currentMap.config.setPlayerPosition(this.player, enterFrom);

		// Start the tick cycle again

		this.run();
	}

	setCanvasScale(){
		this.viewport = getViewport();
		this.scale = this.viewport.width / GLOBALS.camera.width;
		GLOBALS.canvas.style = 'transform: scale('+this.scale+')';
	}

	checkAssetsLoaded(){
		let texturesLoaded = this.mapTextureFile.complete && this.mapTextureFile.naturalHeight !== 0;
		let backgroundLoaded = this.mapBackgroundFile.complete && this.mapBackgroundFile.naturalHeight !== 0;
		return texturesLoaded && backgroundLoaded;
	}

	keydown = (e) => {
		switch (e.keyCode) {
			case 27: this.togglePause(); break;
		}
	}

	togglePause(){
		if (this.running) {
			this.stop();
		} else {
			this.run();
		}
	}

	loadMapTiles = (tiles) => {

		for (let y = 0; y < tiles.length; y++) {
			for (let x = 0; x < tiles[y].length; x++) {

				let code = tiles[y][x];

				if (code === 2) {
					GLOBALS.tiles.push(new TileModel({
						posX: x, 
						posY: y
					}));
				}

				if (code === 'x') {
					GLOBALS.tiles.push(new TileModel({
						posX: x, 
						posY: y,
						type: 'exit'
					}));
				}

				if (code === 'w') {
					GLOBALS.tiles.push(new SpikeModel({
						posX: x,
						posY: y
					}));
				}

				if (code === 'v') {
					GLOBALS.entities.push(new FallSpikeModel({
						posX: x,
						posY: y
					}));
				}

				if (code === 's') {
					GLOBALS.entities.push(new SentryModel({
						posX: x,
						posY: y
					}));
				}

				if (code === 'sj') {
					GLOBALS.entities.push(new SentryJumperModel({
						posX: x,
						posY: y
					}));
				}

				if (code === 'c') {
					GLOBALS.entities.push(new ChestModel({
						posX: x,
						posY: y
					}));
				}

				if (code === 3) {
					GLOBALS.entities.push(new SlugModel({
						posX: x,
						posY: y
					}));
				}

				if (code === 9) {
					GLOBALS.entities.push(new AirSlugModel({
						posX: x,
						posY: y
					}));
				}

				if (code === 'at') {
					GLOBALS.entities.push(new AirTrackerModel({
						posX: x,
						posY: y
					}));
				}
			}
		}
	}

	run = () => {
		console.log('app run');

		this.frameCount = 0;
		this.updateIntervalSettings();

		this.startTime = window.performance.now();
		this.lastUpdate = this.startTime;
		this.lastUpdateLength;

		this.running = window.requestAnimationFrame(this.tick);
	}

	stop = () =>{
		console.log('app stop', this.running);
		
		this.running = false;
	}

	updateIntervalSettings(){
		this.fps = GLOBALS.fps;
		this.fpsInterval = 1000 / this.fps;
	}

	tick = (timestamp) => {

		if (this.running) {

			this.updateIntervalSettings();

			this.running = window.requestAnimationFrame(this.tick);

			let now = timestamp;
			this.lastUpdateLength = now - this.lastUpdate;

			if (this.lastUpdateLength > this.fpsInterval) {

				this.update(now);

				this.lastUpdate = now - (this.lastUpdateLength % this.fpsInterval);
				// this.frameCount++;
				// this.lastUpdate = now;
			}
		}
	}

	checkPlayerPosition(){
		if (this.player.state.posX + this.player.state.width <= 0) {
			// Player out of bounds left side
			console.log('OOB left');
			this.changeMap('left');
		}

		if (this.player.state.posX > this.currentMap.tiles[0].length * GLOBALS.tileSize) {
			// Player out of bounds right side
			console.log('OOB right');
			this.changeMap('right');
		}
	}

	checkPlayerHealth(){
		if (this.player.state.dead) {
			GLOBALS.fps = 20;

			let now = window.performance.now();

			if (now - this.player.state.lastDeath >= 2000) {
				GLOBALS.fps = 60;

				this.player.respawn();
				this.currentMap.config.setPlayerPosition(this.player);
			}
		}
	}

	update(timestamp){

		this.checkPlayerPosition();
		this.checkPlayerHealth();

		// Clear canvas
		GLOBALS.ctx.clearRect(0, 0, GLOBALS.canvas.width, GLOBALS.canvas.height);

		// Draw background
		// GLOBALS.ctx.drawImage(this.mapBackgroundFile, -GLOBALS.camera.posX, -GLOBALS.camera.posY);

		// Darken background
		GLOBALS.ctx.globalCompositeOperation = "multiply";
		GLOBALS.ctx.fillStyle = 'rgba(124, 93, 230, 0.25)';
		GLOBALS.ctx.fillRect(0, 0, GLOBALS.canvas.width, GLOBALS.canvas.height);

		// Reset blending
		GLOBALS.ctx.globalCompositeOperation = "source-over";

		// Darken
		GLOBALS.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
		GLOBALS.ctx.fillRect(0, 0, GLOBALS.canvas.width, GLOBALS.canvas.height);

		// context.globalCompositeOperation = "overlay";

		let cameraBox = {
			x: GLOBALS.camera.posX - GLOBALS.tileSize,
			y: GLOBALS.camera.posY - GLOBALS.tileSize,
			w: GLOBALS.camera.width + (GLOBALS.tileSize * 2),
			h: GLOBALS.camera.height + (GLOBALS.tileSize * 2)
		};

		// Tick all entities

		for (let entity of GLOBALS.entities) {

			let entityBox = {
				x: entity.state.posX,
				y: entity.state.posY,
				w: entity.state.width,
				h: entity.state.height
			};

			let alwaysTick = entity instanceof DropletModel || entity instanceof CoinModel || entity instanceof AirSlugModel || entity instanceof AirTrackerModel;

			if (aabb(cameraBox, entityBox) || alwaysTick) {
				entity.tick();
			}
		}

		// Tick all tiles

		for (let tile of GLOBALS.tiles) {

			let tileBox = {
				x: tile.state.posX,
				y: tile.state.posY,
				w: tile.state.width,
				h: tile.state.height
			};

			if (aabb(cameraBox, tileBox)) {
				tile.tick();
			}
		}

		// Tick all animations
		for (let animation of GLOBALS.animations) {

			let animationBox = {
				x: animation.state.posX,
				y: animation.state.posY,
				w: animation.state.width,
				h: animation.state.height
			};

			if (aabb(cameraBox, animationBox)) {
				animation.tick();
			}
		}

		// Tick player

		this.player.tick();

		// Draw base textures
		// GLOBALS.ctx.drawImage(this.mapTextureFile, -GLOBALS.camera.posX, -GLOBALS.camera.posY);

		GLOBALS.ctx.fillStyle = 'rgba(255,255,255,0.5)';
		GLOBALS.ctx.font = '14px Arial';

		// Math.round(1000 / (sinceStart / ++frameCount) * 100) / 100;
		let sinceStart = timestamp - this.startTime;
		let fps = Math.round(1000 / (sinceStart / this.frameCount) * 100) / 100;

		// GLOBALS.ctx.fillText('FPS: ' + fps, 10, 20);

		GLOBALS.hud.render();

		this.frameCount++;

		// Darken everything
		// GLOBALS.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
		// GLOBALS.ctx.fillRect(0, 0, GLOBALS.canvas.width, GLOBALS.canvas.height);
	}

	render = (element) => {
		console.log('Rendering app');
		element.innerHTML = '';
		element.appendChild(GLOBALS.canvas);
	}

}

export default new App;