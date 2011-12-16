/*
    Zombie Apocolypse HTML5 Clone

    Game;
    Player;
    Actors;
    Renderer;
    Levels;
    Sound;

*/


Zapoc = {};



// Drawing
// ------------------------------------------------------------------
Zapoc.renderRound = function() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (var i = 0; i < this.actors.length; i++) {
        var actor = this.actors[i];
        this.moveActor(actor);
        this.drawActor(this.actors[i]);
    }
};



Zapoc.drawSprite = function(x, y, w, h) {
};

Zapoc.drawText = function(text, x, y, size, color) {
};

Zapoc.moveActor = function(actor) {
    if (actor.x + actor.xSpeed > Zapoc.width ||
        actor.x + actor.xSpeed < 0 - actor.width
    ) {
        actor.xSpeed *= -1;
    }

    if (actor.y + actor.ySpeed > Zapoc.height ||
        actor.y + actor.height - actor.ySpeed < 0
    ) {
        actor.ySpeed *= -1;
    }

    actor.x += actor.xSpeed;
    actor.y += actor.ySpeed;
};

Zapoc.drawActor = function(actor) {
    this.fillRect(actor.x, actor.y, actor.width, actor.height, 'rgb(0, 0, 0)');
};


Zapoc.fillRect = function(x, y, w, h, colour) {
    this.ctx.fillStyle = colour;
    this.ctx.fillRect(x, y, w, h);
};

Zapoc.clicked = function(event) {
    var xPos = event.offsetX;
    var yPos = event.offsetY;
    
    for (var i = 0; i < Zapoc.actors.length; i++) {
        var actor = Zapoc.actors[i];
        if (xPos > actor.x &&
            xPos < actor.x + actor.width &&
            yPos > actor.y &&
            yPos < actor.y + actor.height )
        {
            actor.health -= 1;
        }
    }
};



// Actors (Zombies, power-ups, grenades etc.)
// ------------------------------------------------------------------
Zapoc.Actor = function() {
    this.health = 10;
    this.x = 90;
    this.y = 90;
    this.xSpeed = 1;
    this.ySpeed = 0;
    this.width = 40;
    this.height = 90;
};

Zapoc.Zombie = new Zapoc.Actor();
Zapoc.Zombie = function() {
    
}
Zapoc.Zombie = function(type) {
    Zapoc.Actor.call(this);
    this.skin = type;
}
Zapoc.Zombie.prototype = new Zapoc.Zombie();
Zapoc.Zombie.prototype.constructor = Zapoc.Zombie;



// Player
// ------------------------------------------------------------------
Zapoc.actors = [];
Zapoc.actors.push(new Zapoc.Zombie('normal'));


// Sprites
// ------------------------------------------------------------------
SpriteCords = {
    zombies: {
        normal_1: [[0, 0, 100, 100], [0, 0, 100, 100], [0, 0, 100, 100]],
        normal_2: [[0, 0, 100, 100], [0, 0, 100, 100], [0, 0, 100, 100]]
    }
};

// Levels
// ------------------------------------------------------------------
Zapoc.levels = {
    0: {
        zombieTypes: ['normal'],
        background: 'street.png',
        wallHeight: 100,
        rounds: 3
    },
    1: {
        zombieTypes: ['normal', 'soilder'],
        background: 'bridge.png',
        wallHeight: 100,
        rounds: 3,
    },
    2: {
        zombieTypes: ['soilder', 'scientist'],
        background: 'lab.png',
        wallHeight: 200,
        rounds: 4,
    }
};

// Tools
// ------------------------------------------------------------------
Zapoc.setupCanvas = function() {
    this.canvas = document.getElementById('gamescreen');
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;
};

Zapoc.gameTick = function() {
    Zapoc.renderRound();
};

Zapoc.start = function() {
    this.setupCanvas();
    Zapoc.fillRect(20, 40, 100, 90, 'rgb(210, 40, 190)');
    this.ticker = setInterval(this.gameTick, 30 / 100);

    var stopBtn = document.getElementById('stop');
    stopBtn.addEventListener('click', function() {
        console.log('df');
        clearInterval(Zapoc.ticker);
    });

    this.canvas.addEventListener('click', Zapoc.clicked, true);
};


Zapoc.start();
