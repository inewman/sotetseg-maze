const maze_width   = 14;
const maze_height  = 15;
const max_x_change = 5;
const path_turns   = 8;

const tile_size   = 40;
const tile_stroke = tile_size/25;

const color_tileback = "#323232";
const color_tilepath = "#961919";
const color_tilenogo = "#C8C8C8";
const color_tileplay = "#88EE44";
const color_tilenext = "#C8C8C8";
const color_tilesolv = "#DD77FF";

var canvas = document.getElementById("sotetseg-maze");
var ctx = canvas.getContext("2d");
canvas.width = tile_size * maze_width;
canvas.height = tile_size * maze_height;

function randRange(a, b) {
	return Math.floor(Math.random() * (b - a + 1)) + a;
}

function drawMazeTile(x, y, color_tile) {
	var pos_x = tile_size * x;
	var pos_y = tile_size * y;
	ctx.fillStyle = color_tile;
	ctx.fillRect(pos_x, pos_y, tile_size, tile_size);
	ctx.fillStyle = color_tileback;
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

function drawMaze(maze) {
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
	var seed = makeSeed(maze_height, maze_width, max_x_change);
	return makeSeededMaze(seed);
}

function getTileClicked(event) {
	var rect = canvas.getBoundingClientRect();
	var pixel_x = event.clientX - rect.left;
	var pixel_y = event.clientY - rect.top;
	var tile_x = Math.floor(pixel_x / tile_size);
	var tile_y = Math.floor(pixel_y / tile_size);
	return { x: tile_x, y: tile_y };
}

canvas.addEventListener('mousedown', function (event) {
	var new_pos = getTileClicked(event);
	drawMazeTile(new_pos.x, new_pos.y, color_tileplay);
});

canvas.addEventListener('keypress', function (event) {
	var keyCode = event.keyCode;

	console.log(keyCode);

	if (keyCode == 82 || keyCode == 114){ // r
		drawMaze(maze);
	}

	if (keyCode == 78 || keyCode == 110){ // n
		maze = makeMaze();
		drawMaze(maze);
	}
	
	if (keyCode == 77 || keyCode == 109){ // m
		var str_seed = prompt("Enter a seed", seed.join(","));
		seed = str_seed.split(',').map(Number);
		if (seed.length < 8) {
			seed = makeSeed();
		}
		maze = makeSeededMaze(seed);
		drawMaze(maze);
	}
});

var maze = makeMaze();
drawMaze(maze);
