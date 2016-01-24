Game = function () {
    this.sharkCount = 0;
    this.minnowCount = 0;
    this.gameRound = 0;
    this.canvas = {
        width: 750,
        height: 450
    }
    this.safezoneWidth = 50;
    this.waiting = true;
}

Game.prototype.Collisions = function(player) {
    //Left wall.
    var width = player.width();
    var height = player.height();
    if(player.pos.x <= 0) {
        player.pos.x = 0;
    }
    if(player.fishType === "shark" && this.gameRound%2 === 1 && player.pos.x <= this.safezoneWidth) {
        player.pos.x = this.safezoneWidth;
    }
    if(!player.safe && player.fishType === "minnow" && this.gameRound%2 === 1 && player.pos.x <= this.safezoneWidth) {
        player.safe = true;
    }
    if(player.safe && player.fishType === "minnow" && this.gameRound%2 === 1 && player.pos.x >= this.safezoneWidth) {
        player.pos.x = this.safezoneWidth;
    }
    //Right wall
    if(player.pos.x + width >= canvas.width) {
        player.pos.x = canvas.width - width ;
    }
    if(player.fishType === "shark" && this.gameRound%2 === 0 && player.pos.x >= canvas.width - this.safezoneWidth - width) {
        player.pos.x = canvas.width - this.safezoneWidth - width ;
    }
    if(!player.safe && player.fishType === "minnow" && this.gameRound%2 === 0 && player.pos.x >= canvas.width - this.safezoneWidth) {
        player.safe = true;
    }
    if(player.safe && player.fishType === "minnow" && this.gameRound%2 === 0 && player.pos.x <= canvas.width - this.safezoneWidth) {
        player.pos.x = canvas.width - this.safezoneWidth;
    }
    //Roof wall.
    if(player.pos.y <= 0) {
        player.pos.y = 0;
    }
    //Floor wall
    if(player.pos.y >= canvas.height - height) {
        player.pos.y = canvas.height - height;
    }
}


Game.prototype.Spawn = function() {
    // change from hard coded height / width
    var fishHeight = 14;
    var fishWidth = 28;
    var sharkHeight = 25;
    var sharkWidth = 50;
    var pos = {};
    if (this.sharkCount > 0) {
        var type = "shark"
        this.sharkCount++;
        pos.y = Math.floor(Math.random()*(canvas.height - sharkHeight));
        pos.x = Math.floor((canvas.width/2 + 150) - Math.random()*300);
        return initialConfig = {fishType: type, pos: {x: pos.x, y: pos.y}};
    } else {
        var type = "minnow"
        if(this.gameRound%2 == 0) {
            pos.y = Math.floor(Math.random()*(canvas.height-sharkHeight));
            pos.x = canvas.width - (Math.floor(Math.random()*this.safezoneWidth - fishWidth));
        } else {
            pos.y = Math.floor(Math.random()*(canvas.height-fishHeight));
            pos.x = (Math.floor(Math.random()*this.safezoneWidth - fishWidth));
        }
        return initialConfig = {fishType: type, pos: {x: pos.x, y: pos.y}};
    }
}


// var clients = board.clients;
// for (var currentPlayer in board.clients) {
//   var currentPlayerObj = clients[currentPlayer];
//   if (clients.hasOwnProperty(currentPlayer) && currentPlayerObj.id != player.id && currentPlayerObj.state == "shark") {
//     if (collisionDetected(currentPlayerObj)) {
//       if (currentPlayerObj.state == "shark") {
//         currentPlayerObj.minnowsCaught++;
//       } else {
//         currentPlayerObj.state = "minnow";
//       }
//     }
//   }
// }
