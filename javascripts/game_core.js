Game = function () {
    this.sharkCount = 0;
    this.minnowCount = 0;
    this.gameRound = 0;

}

Game.prototype.Collisions = function(player) {
    if(player.pos.x <= 0) {
        player.pos.x = 0;
    }    //Left wall.
    if(player.pos.x >= 400 ) {
        player.pos.x = 400;
    }    //Right wall
    if(player.pos.y <= 0) {
        player.pos.y = 0;
    }    //Roof wall.
    if(player.pos.y >= 400 ) {
        player.pos.y = 400;
    }    //Floor wall
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
