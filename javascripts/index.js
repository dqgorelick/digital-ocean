var canvas = null;
var fps = null;
var connection = false;

var images = {};
var players = {};

var engine = new Game();
//image states
var backgroundReady = false;
var sharkReady = false;
var minnowReady = false;
var barrierReady = false;

var username = document.getElementById("username").innerHTML;
var controls = document.getElementById("controls").innerHTML;

var types = ["shark", "minnow"];
var fishType = types[Math.floor(Math.random()*types.length)];

var client = null;
var player = null;
//main player initiated in the $(document).ready();

//backgroundImage
images.background = new Image();
images.background.onload = function() {
  backgroundReady = true;
};
images.background.src = "/images/background-large.png";

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

//arrow image
images.arrow = new Image();
images.arrow.onload = function() {
  arrowReady = true;
};
images.arrow.src = "/images/arrow.png";

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
  player.pos.x -= x;
  player.pos.y += y;
  player.pos.z += z;
}

if(controls === "tilt"){
    addEventListener("devicemotion", handleMotionEvent, true);
}

fps = null;
canvas = null;
ctx = null;

var sizeX = 50;
var sizeY = 50;
var updateFlag = false;

function GameTick(elapsed) {
  if (updateFlag) {
    client.emit('client update', player);
  }
  updateFlag = !updateFlag;
  fps.update(elapsed);
  if (38 in keysDown) { // Player holding up
    player.pos.y -= player.speed * elapsed;
  }
  if (40 in keysDown) { // Player holding down
    player.pos.y += player.speed * elapsed;
  }
  if (37 in keysDown) { // Player holding left
    player.pos.x -= player.speed * elapsed;
  }
  if (39 in keysDown) { // Player holding right
    player.pos.x += player.speed * elapsed;
  }
  engine.Collisions(player);
  ctx.save();
  ctx.restore();
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Draw background
  ctx.drawImage(images.background, 0, 0, 750, 450);

  // Draw safe zones
  if (engine.gameRound % 2 === 0) {
    ctx.fillStyle = ctx.fillStyle = "rgba(49, 129, 49, 0.4)";
    ctx.fillRect(engine.canvas.width-engine.safezoneWidth,0,engine.canvas.width,engine.canvas.height);
  } else {
    ctx.fillStyle = ctx.fillStyle = "rgba(49, 129, 49, 0.4)";
    ctx.fillRect(0,0,engine.safezoneWidth,engine.canvas.height);
  }

  // Draw player
  ctx.fillStyle = 'white';
  ctx.font = "12px Helvetica";
  if(player.fishType === "shark"){
    ctx.drawImage(images.shark, player.pos.x, player.pos.y, 50, 28);
    ctx.fillText(player.username, player.pos.x + 5 - (player.username).length, player.pos.y + 33);
  } else {
    ctx.drawImage(images.minnow, player.pos.x, player.pos.y, 25, 14);
    ctx.fillText(player.username, player.pos.x + 5 - (player.username).length, player.pos.y + 33);
  }
  ctx.drawImage(images.arrow, player.pos.x + 15, player.pos.y - 10, 14, 7);

  // Draw players
  for (var entity in players) {
    if (players.hasOwnProperty(entity)) {
      entity = players[entity];
      var x_coord = entity.pos.x;
      var y_coord = entity.pos.y;
      ctx.fillStyle = 'white';
      ctx.font = "12px Helvetica";
      if(entity.fishType === "shark"){
        ctx.drawImage(images.shark, x_coord, y_coord, 50, 28);
        ctx.fillText(entity.username, x_coord + 5 - (entity.username).length, y_coord + 33);
      } else {
        ctx.drawImage(images.minnow, x_coord, y_coord, 25, 14);
        ctx.fillText(entity.username, x_coord + 5 - (entity.username).length, y_coord + 33);
      }
      if(entity.id != player.id){
        if(collisionDetected(entity)){
          console.log(entity.fishType);
        }
      }
    }
  }

  // Draw HUD

}

var collisionDetected = function(otherObject) {
  return (otherObject.pos.x <= (player.pos.x + 32) &&
    player.pos.x <= (otherObject.pos.x + 32) &&
    otherObject.pos.y <= (player.pos.y + 32) &&
    player.pos.y <= (otherObject.pos.y + 32))
}

$(document).ready(function() {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  client = io();
  var firstload1 = true;
  var firstload2 = true;
  client.on('onconnected', function(updatedPositions) {
    if(firstload1) {
      console.log("connected");
      // console.log(updatedPositions);
      // players = updatedPositions;
      fps = new FPSMeter("fpsmeter", document.getElementById("fpscontainer"));
      firstload1 = false;
    }
  })
  client.on('user-id', function(userId) {
    if(firstload2) {
      console.log("user-id")
      var initialConfig = engine.Spawn();
      console.log(initialConfig);
      player = new Player(userId, initialConfig.pos, initialConfig.fishType, username);
      GameLoopManager.run(GameTick);
      client.emit('client update', player);
      firstload2 = false
    }
  })
  var deleted = [];
  client.on('server update', function(updates) {
    for (var entity in updates) {
      if (updates.hasOwnProperty(entity)) {
        entity = updates[entity];
        if (entity.id !== player.id) {
          players[entity.id] = entity;
        }
        for (var i = 0; i < deleted.length; i++) {
          if (deleted[i] === entity.id) {
            delete players[playerID];
            console.log("deleting ID", playerID);
            console.log("deleted", players[playerID]);
          }
        }
      }
    }
  })
  client.on('remove player', function(playerID) {
    deleted.push(playerID);
  })
  client.on('status update', function(boardState) {
    // console.log(boardState);
    // console.log(players);
  })
})
