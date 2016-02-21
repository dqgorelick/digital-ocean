// ----------------------------------
// Game Entities: player, bullets, enemies, explosions

Player = function(x, y, life)
{
    this.x = x;
    this.y = y;
    this.life = life;
    this.refire = 0; // Time before player can fire again.
    this.speed = 400;
}

Player.prototype.Logic = function(elapsed)
{
    if (this.life > 0)
    {
        // Compute vector from player to mouse, then normalize for speed, then scale with elapsed time.
        var mx = InputManager.lastMouseX-this.x;
        var my = InputManager.lastMouseY-this.y;
        var dx = mx;
        var dy = my;
        var r2 = dx*dx+dy*dy;
        var se = this.speed*elapsed; // Maximum length of movement allowed
        if (r2 > se*se)
        {
            var rInv = se / Math.sqrt(r2);
            dx *= rInv;
            dy *= rInv;
        }

        this.x += dx;
        this.y += dy;
        this.x = Clamp(this.x, 16, canvas.width-200);
        this.y = Clamp(this.y, 16, canvas.height-16);

        if (this.refire > 0)
            this.refire -= elapsed;
        else
        {
            // Commented out - this means Autofire! if (InputManager.padState & InputManager.PAD.OK)
            {
                MainGame.playerBullets.Create(this.x, this.y, 6, 300, 5, RandomFloatRange(-0.1, 0.1));
                this.refire = 0.1;
            }
        }

    }
}

Player.prototype.Render = function(elapsed)
{
    ctx.save(); // Save the entire context because we'll be setting the transform. We could just reset to identity...
    if (this.life > 0)
    {
        ctx.fillStyle = MakeColor(255, 255, 255);
        ctx.setTransform(1, 0, 0, 0.6, this.x, this.y); // Transform that scales circle vertically into a flat ellipse
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, 2 * Math.PI, false);
        ctx.fill();
    }
    ctx.restore();
}

// ----------------------------------
// Explosions

Explosions = function()
{
    this.pool = new Array();
    for (var i = 0; i < 40; ++i)
        this.pool.push({ life:0 });
}

Explosions.prototype.Create = function(x, y, size, speed)
{
    var news = null;
    for (var s, i = 0; (s = this.pool[i]) && s.life > 0; ++i)
        ;
    if (s)
    {
        s.x = x;
        s.y = y;
        s.size = size;
        s.speed = speed; // Speed at which explosion progresses
        s.life = 1;
    }
}

Explosions.prototype.Logic = function(elapsed, sx, sy)
{
    for (var s, i = 0; s = this.pool[i]; ++i)
    {
        if (s.life > 0)
        {
            s.life -= elapsed*s.speed;
            s.x -= sx*elapsed*5;
            s.y -= sy*elapsed*5;
        }
    }
}

Explosions.prototype.Render = function(elapsed)
{
    var b = ctx.globalCompositeOperation; // Save the default compositing operation, we'll use additive for explosions
    ctx.globalCompositeOperation = "lighter";
    for (var s, i = 0; s = this.pool[i]; ++i)
    {
        if (s.life > 0)
        {
            // Explosion colors go white -> yellow -> red with decreasing intensity
            ctx.fillStyle = MakeColor(Lerp(0, 255, s.life), Lerp(-255, 255, s.life), Lerp(-1024, 255, s.life));
            var sz = s.size*(s.life+0.5);
            ctx.beginPath();
            ctx.arc(s.x, s.y, sz, 0, 2 * Math.PI, false);
            ctx.fill();
        }
    }
    ctx.globalCompositeOperation = b;
}

// ----------------------------------
// Bullets

Bullets = function(color)
{
    this.pool = new Array();
    for (var i = 0; i < 100; ++i)
        this.pool.push({ life:0 });
    this.color = color;
}

Bullets.prototype.Create = function(x, y, size, speed, life, angle)
{
    var news = null;
    for (var s, i = 0; (s = this.pool[i]) && s.life > 0; ++i)
        ;
    if (s)
    {
        s.x = x;
        s.y = y;
        s.dx = Math.cos(angle); // Pre compute for use later.
        s.dy = Math.sin(angle);
        s.size = size;
        s.life = life;
        s.speed = speed;
        s.angle = angle;
    }
}

Bullets.prototype.Logic = function(elapsed)
{
    for (var s, i = 0; s = this.pool[i]; ++i)
    {
        if (s.life > 0)
        {
            s.life -= elapsed;
            s.x += s.dx*s.speed*elapsed;
            s.y += s.dy*s.speed*elapsed;
        }
    }
}

Bullets.prototype.Render = function(elapsed)
{
    ctx.save(); // Save the entire context because we'll be setting the transform.
    ctx.fillStyle = this.color;
    for (var s, i = 0; s = this.pool[i]; ++i)
    {
        if (s.life > 0)
        {
            // Set the translation and rotation matrix in one go
            ctx.setTransform(s.dx, s.dy, -s.dy, s.dx, s.x, s.y);
            ctx.fillRect(-s.size, -2, 2*s.size, 4);
        }
    }
    ctx.restore();
}

Bullets.prototype.Collide = function(x, y, size, callback)
{
    for (var s, i = 0; s = this.pool[i]; ++i)
    {
        if (s.life > 0)
        {
            // Simple circle/circle collision, good enough as long as bullets are not too elongated.
            var r2 = Pow2(size+s.size);
            var dx = x-s.x;
            var dy = y-s.y;
            if (dx*dx+dy*dy < r2)
            {
                if (!callback || !callback(s))
                    return s;
            }
        }
    }
    return false;
}

// ----------------------------------
// Enemies

Enemies = function(color)
{
    this.pool = new Array();
    for (var i = 0; i < 40; ++i)
        this.pool.push({ life:0 });
    this.color = color;
}

Enemies.prototype.Create = function(x, y, size, speed, life, a, b)
{
    var news = null;
    for (var s, i = 0; (s = this.pool[i]) && s.life > 0; ++i)
        ;
    if (s)
    {
        s.x = x;
        s.y = y;
        s.size = size;
        s.life = life;
        s.speed = speed;
        s.a = a; // a,b,t control the lissajous movement pattern
        s.b = b;
        s.t = 0;
        s.refire = RandomFloatRange(1,3); // Time before shooting again
    }
}

Enemies.prototype.Logic = function(elapsed)
{
    for (var s, i = 0; s = this.pool[i]; ++i)
    {
        if (s.life > 0)
        {
            // Lissajous pattern
            s.t += elapsed;
            var tx = canvas.width/2 + canvas.width*0.4*(Math.cos(s.t*s.a*0.2));
            var ty = canvas.height/2 + canvas.height*0.5*(Math.sin(s.t*s.b*0.2));

            // Move enemy towards point in lissajous pattern
            var mx = tx-s.x;
            var my = ty-s.y;
            var dx = mx;
            var dy = my;
            var r2 = dx*dx+dy*dy;
            var se = s.speed*elapsed; // Maximum length of movement allowed
            if (r2 > se*se)
            {
                var rInv = se / Math.sqrt(r2);
                dx *= rInv;
                dy *= rInv;
            }

            s.x += dx;
            s.y += dy;

            // Shooting logic.
            if (s.refire > 0)
                s.refire -= elapsed;
            else if (MainGame.player.life > 0)
            {
                MainGame.enemyBullets.Create(s.x, s.y, 5, 150, 5, Math.atan2(MainGame.player.y - s.y, MainGame.player.x - s.x));
                s.refire = RandomFloatRange(1,3);
            }
        }
    }
}

Enemies.prototype.Render = function(elapsed)
{
    ctx.fillStyle = this.color;
    for (var s, i = 0; s = this.pool[i]; ++i)
    {
        if (s.life > 0)
        {
            ctx.fillRect(s.x-s.size, s.y-s.size, 2*s.size, 2*s.size);
        }
    }
}

Enemies.prototype.Collide = function(x, y, size, callback)
{
    for (var s, i = 0; s = this.pool[i]; ++i)
    {
        if (s.life > 0)
        {
            var r2 = Pow2(size+s.size);
            var dx = x-s.x;
            var dy = y-s.y;
            if (dx*dx+dy*dy < r2)
            {
                if (!callback || !callback(s))
                    return s;
            }
        }
    }
    return false;
}
