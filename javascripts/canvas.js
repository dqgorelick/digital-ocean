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
	player.state = data.state;
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
var gameBoardReady = false;
var bgImage = new Image();
bgImage.onload = function () {
	gameBoardReady = true;
};
bgImage.src = "images/background.png";

// shark image
var sharkReady = false;
var sharkImage = new Image();
sharkImage.onload = function () {
	sharkReady = true;
};
sharkImage.src = "images/hero.png";

// minnow image
var minnowReady = false;
var minnowImage = new Image();
minnowImage.onload = function () {
	minnowReady = true;
};
minnowImage.src = "images/monster.png";

// Game objects
var shark = {
	speed: 384 // movement in pixels per second
};
var minnow = {
	speed: 256
};
var minnowsCaught = 0;

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
    shark.x -= x;
    shark.y += y;
    shark.z += z;
}

addEventListener("devicemotion", handleMotionEvent, true);

// Reset the game when the player catches a minnow
var reset = function () {
	shark.x = canvas.width / 2;
	shark.y = canvas.height / 2;

	// Throw the minnow somewhere on the screen randomly
	minnow.x = 32 + (Math.random() * (canvas.width - 64));
	minnow.y = 32 + (Math.random() * (canvas.height - 64));
};

// Update game objects
var update = function (modifier) {
	if (38 in keysDown) { // Player holding up
		shark.y -= shark.speed * modifier;
	}
	if (40 in keysDown) { // Player holding down
		shark.y += shark.speed * modifier;
	}
	if (37 in keysDown) { // Player holding left
		shark.x -= shark.speed * modifier;
	}
	if (39 in keysDown) { // Player holding right
		shark.x += shark.speed * modifier;
	}

	// Are they touching?
	if (
		shark.x <= (minnow.x + 32)
		&& minnow.x <= (shark.x + 32)
		&& shark.y <= (minnow.y + 32)
		&& minnow.y <= (shark.y + 32)
	) {
		++minnowsCaught;
		reset();
	}
	player.x = shark.x;
	player.y = shark.y;
};

// Draw everything
var render = function () {
	if (gameBoardReady) {
		ctx.drawImage(bgImage, 0, 0);
	}

	if (sharkReady) {
		// ctx.drawImage(sharkImage, shark.x, shark.y);
		// draw other players
		if (connection) {
			updated.active.forEach(function(id){
				console.log("drawing ", id);
				console.log(updated.clients[id].x);
				if(updated.clients[id].x && updated.clients[id].y){
					ctx.drawImage(sharkImage, updated.clients[id].x, updated.clients[id].y);
				}
			});
		}
	}

	if (minnowReady) {
		ctx.drawImage(minnowImage, minnow.x, minnow.y);
	}

	// Score
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Goblins caught: " + minnowsCaught, 32, 32);
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
