function showAbout() {
	alert("This training tool is designed to practice movement in the Sotetseg "   +
		"maze from the Theatre of Blood in Oldschool Runescape. You can share "    +
		"mazes by copying the seed and copy/pasting it into the Edit Seed prompt.");
}

const tick_length  = 600;

const maze_width   = 14;
const maze_height  = 15;
const max_x_change = 5;
const path_turns   = 8;

const tile_size    = 40;
const tile_stroke  = tile_size/25;

const color_mazeback = "#323232";
const color_tilepath = "#961919";
const color_tilenogo = "#C8C8C8";
const color_tileplay = "#77dd77";
const color_tilenext = "#C8C8C8";
const color_tilesolv = "#6495ED";
const color_linesolv = "#FFFF00";

var canvas = document.getElementById("sotetseg-maze");
var ctx = canvas.getContext("2d");
canvas.width = tile_size * maze_width;
canvas.height = tile_size * maze_height;

function randRange(a, b) {
	return Math.floor(Math.random() * (b - a + 1)) + a;
}

class Point {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

function drawMazeTile(x, y, color_tile) {
	var pos_x = tile_size * x;
	var pos_y = tile_size * y;
	ctx.fillStyle = color_tile;
	ctx.fillRect(pos_x, pos_y, tile_size, tile_size);
	ctx.fillStyle = color_mazeback;
	ctx.fillRect(
		pos_x + tile_stroke,
		pos_y + tile_stroke,
		tile_size - tile_stroke * 2,
		tile_size - tile_stroke * 2
	);
	ctx.beginPath(pos_x, pos_y, pos_x+tile_size, pos_y+tile_size);
	ctx.arc(pos_x+tile_size/2, pos_y+tile_size/2, tile_size/3.4, 0, 2*Math.PI);
	ctx.lineWidth = tile_stroke*1.2;
	ctx.strokeStyle = color_tile;
	ctx.stroke();
}

function drawMaze() {
	for (var x = 0; x < maze.length; x++) {
		for (var y = 0; y < maze[x].length; y++) {
			drawMazeTile(x, y, maze[x][y] ? color_tilepath : color_tilenogo);
		}
	}
}

function makeSeededMaze(seed) {
	var maze = new Array(maze_width);
	for (var x = 0; x < maze.length; x++) {
		maze[x] = new Array(maze_height);
	}
	for (var x = 0; x < maze.length; x++) {
		for (var y = 0; y < maze[x].length; y++) {
			maze[x][y] = false;
		}
	}
	var next_x = -1;
	var s = 0;
	var x = seed[s];
	var y = 0;
	while (y < maze[0].length) {
		if (y % 2) {
			next_x = seed[++s];
			for (var i = Math.min(x, next_x); i <= Math.max(x, next_x); i++) {
				maze[i][y] = true;
			}
			x = next_x;
		} else {
			maze[x][y] = true;
		}
		y++;
	}
	return maze;
}

function makeSeed() {
	seed = Array(path_turns);
	seed[0] = randRange(0, maze_width - 1);
	for (var i = 1; i < seed.length; i++) {
		seed[i] = randRange(Math.max(seed[i-1] - max_x_change, 0), Math.min(seed[i-1] + max_x_change, maze_width - 1));
	}
	return seed;
}

function makeMaze() {
	seed = makeSeed();
	return makeSeededMaze(seed);
}

function startMaze() {
	maze = makeMaze();
	drawMaze(maze);
	moves = new Array();
	path_taken = new Array();
}

function resetMaze() {
	drawMaze(maze);
	moves = new Array();
	path_taken = new Array();
}

function connectPoints(points, color) {
	console.log(points);
	ctx.beginPath();
	for (var i = 0; i < points.length - 1; i++) {
		ctx.moveTo(points[i].x * tile_size + tile_size / 2, points[i].y * tile_size + tile_size / 2);
		ctx.lineTo(points[i + 1].x * tile_size + tile_size / 2, points[i + 1].y * tile_size + tile_size / 2);
	}
	ctx.lineWidth = Math.round(tile_stroke * 1.5);
	ctx.strokeStyle = color;
	ctx.stroke();
}

function getTileClicked(event) {
	var rect = canvas.getBoundingClientRect();
	var pixel_x = event.clientX - rect.left;
	var pixel_y = event.clientY - rect.top;
	var tile_x = Math.floor(pixel_x / tile_size);
	var tile_y = Math.floor(pixel_y / tile_size);
	return { x: tile_x, y: tile_y };
}

function editSeed() {
	var savestate = prompt("Enter a seed", seed.join(","));
	savestate = savestate.split(',').map(Number);
	if (savestate.length != path_turns || Math.max(savestate) >= maze_width || Math.min(savestate) < 0) {
		alert("Bad seed");
		return;
	}
	seed = savestate;
	maze = makeSeededMaze(seed);
	drawMaze(maze);
}

function getPassedTiles(previous, target) {
	let current = new Point(previous.x, previous.y);
	let movement_vector = new Point(target.x - current.x, target.y - current.y);
	let turns = 0;
	while (result.length < 2 && !(current.x == target.x && current.y == target.y)) {
		movement_vector = new Point(target.x - current.x, target.y - current.y);
		if (Math.abs(movement_vector.x) == Math.abs(movement_vector.y)) { // diagonal
			current.x += (current.x < target.x ? 1 : -1);
			current.y += (current.y < target.y ? 1 : -1);
		} else if (Math.abs(movement_vector.x) > Math.abs(movement_vector.y)) {
			current.x += (current.x < target.x ? 1 : -1);
		} else {
			current.y += (current.y < target.y ? 1 : -1);
		}
		result.push(new Point(current.x, current.y));
		turns++;
	}
	return result;
}

canvas.addEventListener('mousedown', function (event) {
	var clickedTile = getTileClicked(event);
	let targetTile = new Point(clickedTile.x, clickedTile.y)
	drawMazeTile(clickedTile.x, clickedTile.y, color_tilesolv);
	if (moves.length > 0) {
		let tiles_passed = getPassedTiles(moves[moves.length -1], targetTile);
		for (var i = 0; i < tiles_passed.length; i++) {
			path_taken.push(tiles_passed[i]);
		}
	} else {
		path_taken.push(targetTile);
	}
	moves.push(targetTile);
});

// function restartSession() {
// 	endSession();
// 	startSession();
// }

// function endSession() {
// 	clearInterval(timerTick);
// }

// function startSession() {
// 	ticks = 0;
// 	session_active = true;
// }

function gameTick() {
  ticks += 1;
  document.getElementById("info").innerHTML = (ticks * tick_length/1000).toFixed(1) + " seconds";
  // process movement
}

// var ticks = 0;
// var session_active = false;
// var timerTick = setInterval(gameTick, tick_length);


var seed;
var maze;
var weighted_maze;
var moves = new Array();
var player_position;
var path_taken = new Array();

startMaze();
