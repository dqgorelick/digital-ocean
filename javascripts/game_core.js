Game = function () {
    this.sharkCount = 0;
    this.minnowCount = 0;
    this.gameRound = 0;
    this.canvas = {
        width: 750,
        height: 450
    }
    this.safezoneWidth = 50;
}

Game.prototype.Collisions = function(player) {
    //Left wall.
    var width = player.width();
    var height = player.height();
    if(player.pos.x <= 0) {
        player.pos.x = 0;
    }
    if(player.fishType === "shark" && this.gameRound%2 === 0 && player.pos.x <= this.safezoneWidth) {
        player.pos.x = this.safezoneWidth;
    }
    //Right wall
    if(player.pos.x + width >= canvas.width) {
        player.pos.x = canvas.width - width ;
    }
    if(player.fishType === "shark" && this.gameRound%2 === 0 && player.pos.x >= canvas.width - this.safezoneWidth - width) {
        player.pos.x = canvas.width - this.safezoneWidth - width ;
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


Game.prototype.Logic = function() {
    this.sharkCount ? minnowCount++ : sharkCount++;
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
