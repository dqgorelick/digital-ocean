function Player (id, pos, fishType, username) {
    this.id = id;
    this.pos = pos;
    this.speed = 384;
    this.fishType = fishType;
    this.username = username;
    this.safe = false;
    this.isAlive = true;

    this.width = function() {
        if (this.fishType == "shark") {
            return 50;
        } else {
            return 25
        }
    }
    this.width = function() { return (this.fishType == "shark" ? 50 : 25)};
    this.height = function() { return (this.fishType == "shark" ? 28 : 14)};
    // this.physics = physics;
    // this.minnowsCaught = 0;
}

// Player.prototype.Physics = function(state) {

// }
// Player.prototype.Images = function() {

//     console.log(this.images);
// }

// Player.protoype.Render = function(elapsed) {

// }
