// ----------------------------------
// Game class

Game = function()
{
    // Init game variables
    this.paused = false;
    this.images = {};
    this.InGameMenu = null;
    this.score = 0;
    this.time = 0;
    this.level = 1;
    this.playerDeathTimer = 0;

    // Init entities.
    this.starfield = new Starfield(canvas.width, canvas.height);
    this.explosions = new Explosions();
    this.enemies = new Enemies(MakeColor(255, 128, 64));
    this.playerBullets = new Bullets(MakeColor(64, 255, 255));
    this.enemyBullets = new Bullets(MakeColor(255, 64, 128));

    this.player = new Player(40, canvas.height/2, 10);
}

Game.prototype.Tick = function(elapsed)
{
    fps.update(elapsed);
    this.Logic(elapsed);
    this.Render(elapsed);
}

Game.prototype.Logic = function(elapsed)
{
    // --- Input
    InputManager.padUpdate();

    // --- Logic
    if (InputManager.padPressed & InputManager.PAD.CANCEL) {
        this.paused = true;
        this.StartInGameMenu();
    }

    if (!this.paused)
    {
        if (this.player.life > 0)
            this.time += elapsed; // Player is alive, keep time ticking
        else
        {
            // Player death delay
            this.playerDeathTimer += elapsed;
            if (this.playerDeathTimer >= 5 || (InputManager.padPressed & InputManager.PAD.OK))
            {
                StartMainMenu();
                return;
            }
        }

        this.level = Math.floor(this.time / 15 + 1); // Increase level every 15 seconds

        // Create new enemy every 40 frames or so, with life equal to difficulty level.
        if (RandomInt(40) == 0)
            this.enemies.Create(canvas.width+20, RandomFloat(canvas.height), 10, 170, this.level, RandomIntRange(2,9), RandomIntRange(2,9));

        // Logic of game entities
        this.player.Logic(elapsed);
        this.enemies.Logic(elapsed);
        this.playerBullets.Logic(elapsed);
        this.enemyBullets.Logic(elapsed);

        // Use the mouse position to give stars and explosions a little variation in movement.
        var mx = Clamp(InputManager.lastMouseX, 0, canvas.width);
        var my = Clamp(InputManager.lastMouseY, 0, canvas.height);
        var sx = Lerp(25, 50, mx/canvas.width);
        var sy = Lerp(-10, 10, my/canvas.height);
        this.explosions.Logic(elapsed, sx, sy);
        this.starfield.Logic(elapsed, sx, sy);

        // Collision detection and response
        // Player vs enemy bullets
        var bindThis = this;
        if (this.player.life > 0)
            this.enemyBullets.Collide(this.player.x, this.player.y, 3, function(s) {
                bindThis.player.life -= 1;
                if (bindThis.player.life > 0)
                    bindThis.explosions.Create(s.x, s.y, 8, 3);
                else
                {
                    // Player dies
                    bindThis.explosions.Create(bindThis.player.x, bindThis.player.y, 24, 1);
                    AudioManager.play("explosion");
                }
                s.life = 0; // Kill bullet
                return bindThis.player.life > 0;
            });
        // Enemies vs player bullets
        for (var e, i = 0; e = this.enemies.pool[i]; ++i)
        {
            if (e.life > 0)
                this.playerBullets.Collide(e.x, e.y, e.size, function(s) {
                    e.life -= 1;
                    if (e.life > 0)
                        bindThis.explosions.Create(s.x, s.y, 8, 3);
                    else
                    {
                        // Enemy dies
                        bindThis.score++;
                        bindThis.explosions.Create(e.x, e.y, 16, 2);
                    }
                    s.life = 0; // Kill bullet
                    return e.life > 0;
                });
        }
    }
}

Game.prototype.Render = function(elapsed)
{
    // Clear the screen
    var grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#000');
    grad.addColorStop(0.3, '#012');
    grad.addColorStop(0.6, '#001');
    grad.addColorStop(0.9, '#012');
    grad.addColorStop(1, '#000');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render objects
    ctx.drawImage(this.images['sun'], 600, 20);

    this.starfield.Render(elapsed);
    this.explosions.Render(elapsed);
    this.enemies.Render(elapsed);
    this.playerBullets.Render(elapsed);
    this.enemyBullets.Render(elapsed);
    this.player.Render(elapsed);

    // HUD
    ctx.textAlign = "left";
    ctx.fillStyle = "white";
    ctx.font = "20px sans-serif";
    ctx.fillText("Score: " + this.score + " Shields: " + this.player.life, 3, 20);
    ctx.textAlign = "right";
    ctx.fillText("Level: " + this.level, canvas.width-3, 20);
    if (this.player.life <= 0)
    {
        ctx.textAlign = "center";
        ctx.fillStyle = "red";
        ctx.font = "60px sans-serif";
        ctx.fillText("Game Over", canvas.width/2, canvas.height/2);
    }
}

Game.prototype.StartInGameMenu = function()
{
    InputManager.reset();
    var bindThis = this;
    this.InGameMenu = new Menu("In-game Menu",
            [ "Continue", "Quit" ],
            "",
            70, 50, 400,
            function(numItem) {
                if (numItem == 0) { GameLoopManager.run(function(elapsed) { bindThis.Tick(elapsed); }); bindThis.paused = false; bindThis.InGameMenu = null;  }
                else if (numItem == 1) StartMainMenu();
            },
            function(elapsed) { bindThis.Render(elapsed); });
    GameLoopManager.run(function(elapsed) { bindThis.InGameMenu.Tick(elapsed); });
}

