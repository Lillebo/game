import { GLOBALS } from './globals.js';
import EntityModel from './models/entity.js';

export function getCollisionBox(state){
	return {
		x: state.posX,
		y: state.posY,
		w: state.width,
		h: state.height
	};
}

export function isAdjacentToTilesHorizontally(obj, box){
	let expandedBox = {
		x: box.x - 1,
		y: box.y,
		w: box.w + 2,
		h: box.h
	};

	return willCollideWithTiles(obj, expandedBox);
}

export function isAdjacentToTiles(obj, box){
	let expandedBox = {
		x: box.x - 1,
		y: box.y - 1,
		w: box.w + 2,
		h: box.h + 2
	};

	return willCollideWithTiles(obj, expandedBox);
}

export function hasAdjacent(obj, box){
	let expandedBox = {
		x: box.x - 1,
		y: box.y - 1,
		w: box.w + 2,
		h: box.h + 2
	};

	return willCollide(obj, expandedBox);
}

export function hasAdjacentHorizontally(obj, box){
	let expandedBox = {
		x: box.x - 1,
		y: box.y,
		w: box.w + 2,
		h: box.h
	};

	return willCollide(obj, expandedBox);
}

export function getSidesFromAdjacent(obj, box, adjacentObjects){
	
	let objects = adjacentObjects;

	if (!objects) {
		objects = hasAdjacent(obj, box);
	}

	let sides = {
		left: false,
		right: false,
		top: false,
		bottom: false
	};

	for (let object of objects) {
		
		let leftBox 	= Object.assign({}, box, {x: box.x - 1});
		let rightBox 	= Object.assign({}, box, {w: box.w + 1});
		let bottomBox 	= Object.assign({}, box, {h: box.h + 1});
		let topBox 		= Object.assign({}, box, {y: box.y - 1});

		if (aabb(leftBox, getCollisionBox(object.state))) {
			sides.left = true;
		}

		if (aabb(rightBox, getCollisionBox(object.state))) {
			sides.right = true;
		}

		if (aabb(bottomBox, getCollisionBox(object.state))) {
			sides.bottom = true;
		}

		if (aabb(topBox, getCollisionBox(object.state))) {
			sides.top = true;
		}

	}

	return sides;
}

export function getSidesFromAdjacentTiles(obj, box, adjacentTiles){
		
	let tiles = adjacentTiles;

	if (!tiles) {
		tiles = isAdjacentToTiles(obj, box);
	}

	let sides = {
		left: false,
		right: false,
		top: false,
		bottom: false
	};

	for (let tile of tiles) {
		
		let leftBox 	= Object.assign({}, box, {x: box.x - 1});
		let rightBox 	= Object.assign({}, box, {w: box.w + 1});
		let bottomBox 	= Object.assign({}, box, {h: box.h + 1});
		let topBox 		= Object.assign({}, box, {y: box.y - 1});

		if (aabb(leftBox, getCollisionBox(tile.state))) {
			sides.left = true;
		}

		if (aabb(rightBox, getCollisionBox(tile.state))) {
			sides.right = true;
		}

		if (aabb(bottomBox, getCollisionBox(tile.state))) {
			sides.bottom = true;
		}

		if (aabb(topBox, getCollisionBox(tile.state))) {
			sides.top = true;
		}

	}

	return sides;
}

export function getSidesFromCollidingTiles(obj, box, collidingTiles){
	
	let collisions = collidingTiles;

	if (!collisions) {
		collisions = willCollideWithTiles(obj, box);
	}

	let sides = {
		top: false,
		right: false,
		bottom: false,
		left: false
	};

	for (let tile of collisions) {

		if (tile.state.posY < box.y) {
			sides.top = tile;
		}

		if (tile.state.posX + tile.state.width > box.x + box.w) {
			sides.right = tile;
		}

		if (tile.state.posY + tile.state.height > box.y + box.h) {
			sides.bottom = tile;
		}

		if (tile.state.posX < box.x) {
			sides.left = tile;
		}

	}

	return Object.assign({}, sides);
}

export function getSidesFromCollisions(box, collisions){
	let sides = {
		top: false,
		right: false,
		bottom: false,
		left: false
	};

	for (let collision of collisions) {

		if (collision.state.posY < box.y) {
			sides.top = collision;
		}

		if (collision.state.posX + collision.state.width > box.x + box.w) {
			sides.right = collision;
		}

		if (collision.state.posY + collision.state.height > box.y + box.h) {
			sides.bottom = collision;
		}

		if (collision.state.posX < box.x) {
			sides.left = collision;
		}

	}

	return Object.assign({}, sides);
}

export function willCollideWithTiles(obj, box){

	let box2, collisions = [];

	for (let x = 0; x < GLOBALS.tiles.length; x++) {
		
		let tile = GLOBALS.tiles[x];

		if (tile === obj) {
			continue;
		}

		// Skip if colliding object has exceptions to which tiles it should collide with

		if (obj.state.hasOwnProperty('tileNoCollide') && 
			obj.state.tileNoCollide.indexOf(tile.state.type) !== -1) {
			continue;
		}

		box2 = {
			x: tile.state.posX,
			y: tile.state.posY,
			w: tile.state.width,
			h: tile.state.height
		};

		if (aabb(box, box2)) {
			collisions.push(tile);
		}

	}

	return collisions;
}

export function willCollideWithEntities(obj, box){

	let box2, collisions = [];

	for (let x = 0; x < GLOBALS.entities.length; x++) {
		
		let entity = GLOBALS.entities[x];

		if (entity === obj) {
			continue;
		}

		box2 = {
			x: entity.state.posX,
			y: entity.state.posY,
			w: entity.state.width,
			h: entity.state.height
		};

		if (aabb(box, box2)) {
			collisions.push(entity);
		}

	}

	return (collisions.length) ? collisions : false;
}

export function willCollide(obj, box) {

	let box2, collisions = [];

	// Check collision with entities

	for (let x = 0; x < GLOBALS.entities.length; x++) {
		
		let entity = GLOBALS.entities[x];

		if (entity === obj || 
			!entity.state.hasOwnProperty('collides') || 
			!entity.state.collides) {

			continue;
		}

		box2 = getCollisionBox(entity.state);

		if (aabb(box, box2)) {
			collisions.push(entity);
		}

	}

	// Check collision with tiles

	for (let x = 0; x < GLOBALS.tiles.length; x++) {
		
		let tile = GLOBALS.tiles[x];

		if (tile === obj) {
			continue;
		}

		// Skip if colliding object has exceptions to which tiles it should collide with

		if (obj.state.hasOwnProperty('tileNoCollide') && 
			obj.state.tileNoCollide.indexOf(tile.state.type) !== -1) {
			continue;
		}

		box2 = getCollisionBox(tile.state);

		if (aabb(box, box2)) {
			collisions.push(tile);
		}

	}

	return collisions;

};

export function aabb(box1, box2) {
	if (box1.x < box2.x + box2.w &&
		box1.x + box1.w > box2.x &&
		box1.y < box2.y + box2.h &&
		box1.h + box1.y > box2.y) {
		return true;
	} else {
		return false;
	}
};

export function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
};

export function getViewport(){
	return {
		width:  Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
		height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
	};
};