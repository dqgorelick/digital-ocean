var GB = {
	width: 512,
	height: 480
};
var connection = false;
var updated;

// player to send to the server
var player = {};
var client = io();
client.on('onconnected', function(data) {
	player.id = data.id;
});
client.on('board state', function(board) {
	connection = true;
	updated = board;
});

var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = GB.width;
canvas.height = GB.height;
document.body.appendChild(canvas);

// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
	bgReady = true;
};
bgImage.src = "images/background.png";

// Hero image
var heroReady = false;
var heroImage = new Image();
heroImage.onload = function () {
	heroReady = true;
};
heroImage.src = "images/hero.png";

// Monster image
var monsterReady = false;
var monsterImage = new Image();
monsterImage.onload = function () {
	monsterReady = true;
};
monsterImage.src = "images/monster.png";

// Game objects
var hero = {
	speed: 256 // movement in pixels per second
};
var monster = {};
var monstersCaught = 0;

// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);

document.getElementById("up").addEventListener("touchstart", function(){
	keysDown[38] = true;
}, false);

document.getElementById("up").addEventListener("touchend", function(){
	delete keysDown[38];
}, false);

document.getElementById("left").addEventListener("touchstart", function(){
	keysDown[37] = true;
}, false);

document.getElementById("left").addEventListener("touchend", function(){
	delete keysDown[37];
}, false);

document.getElementById("right").addEventListener("touchstart", function(){
	keysDown[39] = true;
}, false);

document.getElementById("right").addEventListener("touchend", function(){
	delete keysDown[39];
}, false);

document.getElementById("down").addEventListener("touchstart", function(){
	keysDown[40] = true;
}, false);

document.getElementById("down").addEventListener("touchend", function(){
	delete keysDown[40];
}, false);

function handleMotionEvent(event) {
    var x = event.accelerationIncludingGravity.x;
    var y = event.accelerationIncludingGravity.y;
    var z = event.accelerationIncludingGravity.z;
    hero.x -= x;
    hero.y += y;
    hero.z += z;
}

addEventListener("devicemotion", handleMotionEvent, true);

// Reset the game when the player catches a monster
var reset = function () {
	hero.x = canvas.width / 2;
	hero.y = canvas.height / 2;

	// Throw the monster somewhere on the screen randomly
	monster.x = 32 + (Math.random() * (canvas.width - 64));
	monster.y = 32 + (Math.random() * (canvas.height - 64));
};

// Update game objects
var update = function (modifier) {
	if (38 in keysDown) { // Player holding up
		hero.y -= hero.speed * modifier;
	}
	if (40 in keysDown) { // Player holding down
		hero.y += hero.speed * modifier;
	}
	if (37 in keysDown) { // Player holding left
		hero.x -= hero.speed * modifier;
	}
	if (39 in keysDown) { // Player holding right
		hero.x += hero.speed * modifier;
	}

	// Are they touching?
	if (
		hero.x <= (monster.x + 32)
		&& monster.x <= (hero.x + 32)
		&& hero.y <= (monster.y + 32)
		&& monster.y <= (hero.y + 32)
	) {
		++monstersCaught;
		reset();
	}
	player.x = hero.x;
	player.y = hero.y;
};

// Draw everything
var render = function () {
	if (bgReady) {
		ctx.drawImage(bgImage, 0, 0);
	}

	if (heroReady) {
		// ctx.drawImage(heroImage, hero.x, hero.y);
		// draw other players
		if (connection) {
			updated.active.forEach(function(id){
				console.log("drawing ", id);
				console.log(updated.clients[id].x);
				if(updated.clients[id].x && updated.clients[id].y){
					ctx.drawImage(heroImage, updated.clients[id].x, updated.clients[id].y);
				}
			});
		}
	}

	if (monsterReady) {
		ctx.drawImage(monsterImage, monster.x, monster.y);
	}

	// Score
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Goblins caught: " + monstersCaught, 32, 32);
};

var now, delta, startTime, elapsed, fpsInterval, fps;
// The main game loop
var main = function () {
	now = Date.now();

	// throttle for sending to server
	fps = 22;
	fpsInterval=1000/fps;
    startTime=then;
    animate();
};

function animate() {
	requestAnimationFrame(animate);
	now = Date.now();
	delta = now - then;
	update(delta / 1000);
	render();
	then = now;

	elapsed = now - startTime;
	if (elapsed > fpsInterval) {
		startTime = now - (elapsed % fpsInterval);
		client.emit('update', player);
	}
}

// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;
var then = Date.now();
reset();
main();
