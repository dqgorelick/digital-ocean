var canvas = null;
var fps = null;
var connection = false;

var images = {};
var board = {};

//image states
var backgroundReady = false;
var sharkReady = false;
var minnowReady = false;
var barrierReady = false;

// player to send to the server
var player = {};

// creates socket.io instance
var client = io();
client.on('onconnected', function(data) {
    player.id = data.id;
    player.state = data.state;
    player.minnowsCaught = data.minnowsCaught;
    player.physics = data.physics;
    console.log("Your username is " + player.id);
    console.log("Your are a " + player.state);
    console.log("Your initial position is " + JSON.stringify(player.physics));
});

client.on('updatedBoard', function(updatedBoard) {
    connection = true;
    board = updatedBoard;
});

// Reset the game when game ends
var reset = function() {
    player.physics.x = canvas.width / 2;
    player.physics.y = canvas.height / 2;
};

var keysDown = {};
function handleMotionEvent(event) {
    var x = event.accelerationIncludingGravity.x;
    var y = event.accelerationIncludingGravity.y;
    var z = event.accelerationIncludingGravity.z;
    player.physics.x -= x;
    player.physics.y += y;
    player.physics.z += z;
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
    var lastX = player.physics.x;
    if (38 in keysDown) { // Player holding up
        player.physics.y -= player.physics.speed * elapsed;
    }
    if (40 in keysDown) { // Player holding down
        player.physics.y += player.physics.speed * elapsed;
    }
    if (37 in keysDown) { // Player holding left
        player.physics.x -= player.physics.speed * elapsed;
    }
    if (39 in keysDown) { // Player holding right
        player.physics.x += player.physics.speed * elapsed;
    }
    console.log(JSON.stringify(board.clients));
    for (var otherPlayer in board.clients) {
      if (clients.hasOwnProperty(otherPlayer) && clients.state == "shark") {
        if(collisionDetected(otherPlayer)) {
          if(player.state == "shark") {
            ++minnowsCaught;
          } else {
            player.state = "minnow";
          }
        }
      }
    }
    // lastX < shark.x ? images.direction.shark = 1: images.direction.shark = -1;

    // --- Rendering

    // Clear the screen
    // ctx.fillStyle = "#000000";
    // ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.drawImage(images.background, 0, 0, 400, 400);

    // Render objects
    if(connection) {
        console.log(board.clients.length);
        for (var i = 0; i < board.clients.length; i++) {
            var entity_id = board.clients[i].id;
            var x_coord = board.clients[entity_id].physics.x;
            var y_coord = board.clients[entity_id].physics.y;
            // if (entity_id !== player.id) {
                {
                    // ctx.fillStyle = "#ffffff";
                    // ctx.setTransform(1, 0, 0, 1, x_coord, y_coord); // Transform that scales circle vertically into a flat ellipse
                    // ctx.beginPath();
                    // ctx.arc(0, 0, 12, 0, 2 * Math.PI, false);
                    // ctx.fill();
                    if(en)
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
    // player.x = player.physics.x;
    // player.y = player.physics.y;

    // console.log(player.x,player.y);
}

var collisionDetected = function(otherPlayer) {
  return (otherPlayer.physics.x <= (player.physics.x + 32) &&
  player.physics.x <= (otherPlayer.physics.x + 32) &&
  otherPlayer.physics.y <= (player.physics.y + 32) &&
  player.physics.y <= (otherPlayer.physics.y + 32))
}

//backgroundImage
images.background = new Image();
images.background.onload = function() {
    backgroundReady = true;
};
images.background.src = "images/backgroundsprite.png";

//shark image
images.shark = new Image();
images.shark.onload = function() {
  sharkReady = true;
};
images.shark.src = "images/sharksprite.png";

// minnow image
images.shark = new Image();
minnowImage.onload = function () {
	minnowReady = true;
};
minnowImage.src = "images/monster.png";

//barrier image
images.barrier = new Image();
barrierImage.onload = function () {
    barrierReady = true;
};
barrierImage.src = "images/barriers.png";

$(document).ready(function(){
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    fps = new FPSMeter("fpsmeter", document.getElementById("fpscontainer"));
    reset();
    GameLoopManager.run(GameTick);
})
