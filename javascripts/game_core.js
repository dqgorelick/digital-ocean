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
    this.timer = 30;
    this.status = null;
}

Game.prototype.Collisions = function(player) {
    //Left wall.
    var width = player.width();
    var height = player.height();
    var leftToRight = true;
    if(player.pos.x <= 0) {
        player.pos.x = 0;
    }
    if(player.fishType === "shark" && this.gameRound%2 === 1 && player.pos.x <= this.safezoneWidth) {
        player.pos.x = this.safezoneWidth;
    }


    // Fish getting to the goal
    // FROM LEFT TO RIGHT
    if(leftToRight && this.waiting && player.fishType === "minnow" && this.gameRound%2 === 1 && player.pos.x >= this.safezoneWidth - width) {
        player.pos.x = this.safezoneWidth - width;
    }

    if(leftToRight && player.fishType === "minnow" && this.gameRound%2 === 0 && player.pos.x >= canvas.width - this.safezoneWidth){
        player.isSafe = true;
        leftToRight = false;
    }

    if(!(leftToRight) && this.gameRound%2 === 0 && player.pos.x <= this.safezoneWidth){
    }

    // // FROM RIGHT TO LEFT
    // if(!leftToRight && this.waiting && player.fishType === "minnow" && this.gameRound%2 === 0 && player.pos.x <= canvas.width - this.safezoneWidth) {
    //     player.pos.x = canvas.width - this.safezoneWidth;
    // }

    // if(!leftToRight && player.fishType === "minnow" && this.gameRound%2 === 1 && player.pos.x <= this.safezoneWidth - width){
    //     player.isSafe = true;
    //     leftToRight = true;
    // }
    // halfway
    // if (player.fishType === "minnow" && this.gameRound%2 === 0 && player.pos.x >= canvas.width/2) {
    //     player.checkpoint = true;
    // }

    // if(player.checkpoint && player.fishType === "minnow" && this.gameRound%2 === 1 && player.pos.x >= this.safezoneWidth - width) {
    //     player.pos.x = this.safezoneWidth - width;
    // }
    // Fish getting to the goal
    // if(this.waiting && player.fishType === "minnow" && this.gameRound%2 === 0 && player.pos.x >= canvas.width - this.safezoneWidth) {
    //     // player.safe = true;
    // }
    // if(player.fishType === "minnow" && this.gameRound%2 === 0 && player.pos.x <= canvas.width - this.safezoneWidth) {
    //     player.pos.x = canvas.width - this.safezoneWidth;
    // }


    //Right wall
    if(player.pos.x + width >= canvas.width) {
        player.pos.x = canvas.width - width ;
    }
    if(player.fishType === "shark" && this.gameRound%2 === 0 && player.pos.x >= canvas.width - width) {
        player.pos.x = canvas.width -  width ;
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

Game.prototype.isEaten = function(player, enemy){
    /*
    var widthPlayer = player.width();
    var heightPlayer = player.height();
    var widthEnemy = enemy.width();
    var heightEnemy = enemy.height();
    */
    // collide left side
    // if(player.pos.x )
    // collide right side
    // collide top
    // collide bottom
  return (enemy.pos.x <= (player.pos.x + 32) &&
    player.pos.x <= (enemy.pos.x + 32) &&
    enemy.pos.y <= (player.pos.y + 32) &&
    player.pos.y <= (enemy.pos.y + 32))
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
    // clear out all of the dead fish, make them spawn as sharks
    // reset the timer
    // make sure the minnows are in the gated area
}

Game.prototype.Respawn = function(player) {
    player.fishType = "shark";
    player.pos.y = Math.floor(Math.random()*(canvas.height - sharkHeight));
    player.pos.x = Math.floor((canvas.width/2 + 150) - Math.random()*300);
    player.isAlive = true;
}

Game.prototype.Counters = function(player) {
    if (player.fishType == "shark") {
        this.sharkCount++;
    } else if (player.fishType == "minnow") {
        this.minnowCount++;
    }
}
