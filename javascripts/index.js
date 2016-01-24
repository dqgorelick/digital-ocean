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

//backgroundImage
images.background = new Image();
images.background.onload = function() {
  backgroundReady = true;
};
images.background.src = "/images/backgroundsprite.png";

//shark image
images.shark = new Image();
images.shark.onload = function() {
  sharkReady = true;
};
images.shark.src = "/images/sharksprite.png";

// minnow image
images.minnow = new Image();
images.minnow.onload = function() {
  minnowReady = true;
};
images.minnow.src = "/images/fishsprite.png";

//barrier image
images.barrier = new Image();
images.barrier.onload = function() {
  barrierReady = true;
};
images.barrier.src = "/images/barriers.png";

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

// Username and controls flag
var username = document.getElementById("username").innerHTML;
var controls = document.getElementById("controls").innerHTML;

var keysDown = {};

if(controls === "keyboard"){
    addEventListener("keydown", function(e) {
        keysDown[e.keyCode] = true;
    }, false);

    addEventListener("keyup", function(e) {
        delete keysDown[e.keyCode];
    }, false);
}

if(controls === "joystick"){
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
}

function handleMotionEvent(event) {
  var x = event.accelerationIncludingGravity.x;
  var y = event.accelerationIncludingGravity.y;
  var z = event.accelerationIncludingGravity.z;
  player.physics.x -= x;
  player.physics.y += y;
  player.physics.z += z;
}

if(controls === "tilt"){
    addEventListener("devicemotion", handleMotionEvent, true);
}

fps = null;
canvas = null;
ctx = null;
// Our 'game' variables

var sizeX = 50;
var sizeY = 50;
var updateFlag = false;

function GameTick(elapsed) {
  if (updateFlag) {
    client.emit('update', player);
  }
  updateFlag = !updateFlag;
  fps.update(elapsed);
  // Movement physics
  // Collision detection and response
  //var lastX = player.physics.x;
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
  var clients = board.clients;
  for (var currentPlayer in board.clients) {
    var currentPlayerObj = clients[currentPlayer];
    if (clients.hasOwnProperty(currentPlayer) && currentPlayerObj.id != player.id && currentPlayerObj.state == "shark") {
      if (collisionDetected(currentPlayerObj)) {
        if (currentPlayerObj.state == "shark") {
          currentPlayerObj.minnowsCaught++;
        } else {
          currentPlayerObj.state = "minnow";
        }
      }
    }
  }

  ctx.save();

  // Render objects
  if (connection) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(images.background, 0, 0, 400, 400);
    for (var entity in board.clients) {
      if (board.clients.hasOwnProperty(entity)) {
        entity = board.clients[entity];
        var x_coord = entity.physics.x;
        var y_coord = entity.physics.y;
        if(entity.state == "shark") {
          ctx.drawImage(images.shark, x_coord, y_coord, 50, 28);
        } else {
          ctx.drawImage(images.minnow, x_coord, y_coord, 28, 14);
        }
      }
    }
  }
}

var collisionDetected = function(otherObject) {
  return (otherObject.physics.x <= (player.physics.x + 32) &&
    player.physics.x <= (otherObject.physics.x + 32) &&
    otherObject.physics.y <= (player.physics.y + 32) &&
    player.physics.y <= (otherObject.physics.y + 32))
}

$(document).ready(function() {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  fps = new FPSMeter("fpsmeter", document.getElementById("fpscontainer"));
  GameLoopManager.run(GameTick);
})
