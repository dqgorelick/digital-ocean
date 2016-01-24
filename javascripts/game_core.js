Game = function () {
    this.sharkCount = 0;
    this.minnowCount = 0;
    this.gameRound = 1;
    this.canvas = {
        width: 750,
        height: 450
    }
    this.safezoneWidth = 50;
    this.waiting = true;
    this.timer = 10;
    this.status = null;
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
    if(this.waiting && player.fishType === "minnow" && this.gameRound%2 === 1 && player.pos.x <= this.safezoneWidth - width) {
        console.log("safe");
    }
    if(player.safe && player.fishType === "minnow" && this.gameRound%2 === 1 && player.pos.x >= this.safezoneWidth - width) {
        player.pos.x = this.safezoneWidth - width;
    }
    //Right wall
    if(player.pos.x + width >= canvas.width) {
        player.pos.x = canvas.width - width ;
    }
    if(player.fishType === "shark" && this.gameRound%2 === 0 && player.pos.x >= canvas.width - this.safezoneWidth - width) {
        player.pos.x = canvas.width - this.safezoneWidth - width ;
    }
    if(this.waiting && player.fishType === "minnow" && this.gameRound%2 === 0 && player.pos.x >= canvas.width - this.safezoneWidth) {
        // player.safe = true;
    }
    if(player.safe && player.fishType === "minnow" && this.gameRound%2 === 0 && player.pos.x <= canvas.width - this.safezoneWidth) {
        player.pos.x = canvas.width - this.safezoneWidth;
        console.log("safe");
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

Game.prototype.isEaten = function(player, enemy)
    var widthPlayer = player.width();
    var heightPlayer = player.height();
    var widthEnemy = enemy.width();
    var heightEnemy = enemy.height();
    // collide left side
    // if(player.pos.x )
    // collide right side
    // collide top
    // collide bottom
  return (otherObject.pos.x <= (player.pos.x + 32) &&
    player.pos.x <= (otherObject.pos.x + 32) &&
    otherObject.pos.y <= (player.pos.y + 32) &&
    player.pos.y <= (otherObject.pos.y + 32))
}


Game.prototype.Spawn = function() {
    // change from hard coded height / width
    var fishHeight = 14;
    var fishWidth = 28;
    var sharkHeight = 25;
    var sharkWidth = 50;
    var pos = {};
    if (this.sharkCount == 0) {
        var type = "shark"
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

Game.prototype.Reset = function(player){

}

Game.prototype.Counters = function(player) {
    if (player.fishType == "shark") {
        this.sharkCount++;
    } else if (player.fishType == "minnow") {
        this.minnowCount++;
    }
}
