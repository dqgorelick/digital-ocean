var canvas = null;
var fps = null;
var connection = false;

var images = {};
images.shark = document.getElementById("shark");

// player to send to the server
var player = {};
// creates socket.io instance
var client = io();
client.on('onconnected', function(data) {
    player.id = data.id;
    player.state = data.state;
    console.log("Your username is " + data.id)
    console.log("Your are a " + data.state)
});
client.on('board state', function(state) {
    connection = true;
    updatedBoard = state;
});

var sharkReady = false;
images.shark = new Image();
images.shark.onload = function() {
    sharkReady = true;
};
images.shark.src = "images/sharksprite.png";

var backgroundReady = false;
images.background = new Image();
images.background.onload = function() {
    backgroundReady = true;
};
images.background.src = "images/backgroundsprite.png";

// Game objects
var shark = {
    speed: 384 // movement in pixels per second
};
var minnow = {
    speed: 256
};

var minnowsCaught = 0;

// Reset the game when the player catches a minnow
var reset = function() {
    shark.x = canvas.width / 2;
    shark.y = canvas.height / 2;

    // Throw the minnow somewhere on the screen randomly
    minnow.x = 32 + (Math.random() * (canvas.width - 64));
    minnow.y = 32 + (Math.random() * (canvas.height - 64));
};

var keysDown = {};
function handleMotionEvent(event) {
    var x = event.accelerationIncludingGravity.x;
    var y = event.accelerationIncludingGravity.y;
    var z = event.accelerationIncludingGravity.z;
    shark.x -= x;
    shark.y += y;
    shark.z += z;
}
addEventListener("keydown", function(e) {
    keysDown[e.keyCode] = true;
}, false);
addEventListener("keyup", function(e) {
    delete keysDown[e.keyCode];}, false);
document.getElementById("up").addEventListener("touchstart", function() {
    keysDown[38] = true;
}, false);
document.getElementById("up").addEventListener("touchend", function() {
    delete keysDown[38];
}, false);
document.getElementById("left").addEventListener("touchstart", function() {
    keysDown[37] = true;
}, false);
document.getElementById("left").addEventListener("touchend", function() {
    delete keysDown[37];
}, false);
document.getElementById("right").addEventListener("touchstart", function() {
    keysDown[39] = true;
}, false);
document.getElementById("right").addEventListener("touchend", function() {
    delete keysDown[39];
}, false);
document.getElementById("down").addEventListener("touchstart", function() {
    keysDown[40] = true;
}, false);
document.getElementById("down").addEventListener("touchend", function() {
    delete keysDown[40];
}, false);



// initialize();

fps = null;
canvas = null;
ctx = null;
// Our 'game' variables

var sizeX = 50;
var sizeY = 50;
var updateFlag = false;
function GameTick(elapsed)
{
    if(updateFlag){
        client.emit('update', player);
    }
    updateFlag = !updateFlag;
    fps.update(elapsed);
    // Movement physics
    // Collision detection and response
    var lastX = shark.x;
    if (38 in keysDown) { // Player holding up
        shark.y -= shark.speed * elapsed;
    }
    if (40 in keysDown) { // Player holding down
        shark.y += shark.speed * elapsed;
    }
    if (37 in keysDown) { // Player holding left
        shark.x -= shark.speed * elapsed;
    }
    if (39 in keysDown) { // Player holding right
        shark.x += shark.speed * elapsed;
    }
    // lastX < shark.x ? images.direction.shark = 1: images.direction.shark = -1;
    if (
        shark.x <= (minnow.x + 32) && minnow.x <= (shark.x + 32) && shark.y <= (minnow.y + 32) && minnow.y <= (shark.y + 32)
    ) {
        ++minnowsCaught;
        reset();
    }
    // --- Rendering

    // Clear the screen
    // ctx.fillStyle = "#000000";
    // ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.drawImage(images.background, 0, 0, 400, 400);

    // Render objects
    if(connection) {
        console.log(updatedBoard.active.length);
        for (var i = 0; i < updatedBoard.active.length; i++) {
            var entity_id = updatedBoard.active[i];
            var x_coord = updatedBoard.clients[entity_id].x;
            var y_coord = updatedBoard.clients[entity_id].y;
            // if (entity_id !== player.id) {
                {
                    // ctx.fillStyle = "#ffffff";
                    // ctx.setTransform(1, 0, 0, 1, x_coord, y_coord); // Transform that scales circle vertically into a flat ellipse
                    // ctx.beginPath();
                    // ctx.arc(0, 0, 12, 0, 2 * Math.PI, false);
                    // ctx.fill();
                    ctx.drawImage(images.shark, x_coord-25, y_coord-25, 50, 28);
                }
                ctx.restore();
            // }
        };
    }
    // ctx.save(); // Save the entire context because we'll be setting the transform. We could just reset to identity...
    // {
    //     ctx.fillStyle = "#ffffff";
    //     ctx.setTransform(1, 0, 0, 1, hero.x, hero.y); // Transform that scales circle vertically into a flat ellipse
    //     ctx.beginPath();
    //     ctx.arc(0, 0, 12, 0, 2 * Math.PI, false);
    //     ctx.fill();
    // }
    // ctx.drawImage(images.shark, x_coord-25, y_coord-25, 50, 28);

    ctx.restore();
    player.x = shark.x;
    player.y = shark.y;

    // console.log(player.x,player.y);
}
$(document).ready(function(){
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    fps = new FPSMeter("fpsmeter", document.getElementById("fpscontainer"));
    reset();
    GameLoopManager.run(GameTick);
})
