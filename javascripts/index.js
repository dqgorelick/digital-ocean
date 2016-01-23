var canvas = null;
var fps = null;
var connection = false;

var images = {};
// player to send to the server
var player = {};
// creates socket.io instance
var client = io();
client.on('onconnected', function(data) {
    player.id = data.id;
    console.log(player.id);
    updatedBoard = data.state;
});
client.on('board state', function(state) {
    connection = true;
    updatedBoard = state;
});


// Game objects
var hero = {
    speed: 256 // movement in pixels per second
};

var monster = {};
var monstersCaught = 0;

// Reset the game when the player catches a monster
var reset = function() {
    hero.x = canvas.width / 2;
    hero.y = canvas.height / 2;

    // Throw the monster somewhere on the screen randomly
    monster.x = 32 + (Math.random() * (canvas.width - 64));
    monster.y = 32 + (Math.random() * (canvas.height - 64));
};

var keysDown = {};

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
    if (38 in keysDown) { // Player holding up
        hero.y -= hero.speed * elapsed;
    }
    if (40 in keysDown) { // Player holding down
        hero.y += hero.speed * elapsed;
    }
    if (37 in keysDown) { // Player holding left
        hero.x -= hero.speed * elapsed;
    }
    if (39 in keysDown) { // Player holding right
        hero.x += hero.speed * elapsed;
    }
    if (
        hero.x <= (monster.x + 32) && monster.x <= (hero.x + 32) && hero.y <= (monster.y + 32) && monster.y <= (hero.y + 32)
    ) {
        ++monstersCaught;
        reset();
    }

    // --- Rendering

    // Clear the screen
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    // Render objects
    if(connection) {
        console.log(updatedBoard.active.length);
        for (var i = 0; i < updatedBoard.active.length; i++) {
            var entity_id = updatedBoard.active[i];
            var x_coord = updatedBoard.clients[entity_id].x;
            var y_coord = updatedBoard.clients[entity_id].y;
            // if (entity_id !== player.id) {
                ctx.save();
                {
                    ctx.fillStyle = "#ffffff";
                    ctx.setTransform(1, 0, 0, 1, x_coord, y_coord); // Transform that scales circle vertically into a flat ellipse
                    ctx.beginPath();
                    ctx.arc(0, 0, 12, 0, 2 * Math.PI, false);
                    ctx.fill();
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
    // ctx.restore();
    if(hero.x == 200 || hero.y == 200) {
        console.log("here")
    }
    player.x = hero.x;
    player.y = hero.y;

    // console.log(player.x,player.y);
}
$(document).ready(function(){
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    fps = new FPSMeter("fpsmeter", document.getElementById("fpscontainer"));
    reset();
    GameLoopManager.run(GameTick);
})
