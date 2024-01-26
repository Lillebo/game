// import Camera from './views/camera.js';

let canvas  = document.createElement('canvas');
let ctx 	= canvas.getContext('2d');
let tileSize = 20;

export let GLOBALS = {
	fps: 60,
	canvas: canvas,
	ctx: ctx,
	camera: undefined,
	tileSize: tileSize,
	gravity: 1,
	friction: 0.1,
	terminalVelocity: tileSize * 0.75,
	entities: [],
	tiles: [],
	animations: []
};