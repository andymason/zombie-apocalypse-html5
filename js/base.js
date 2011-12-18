/*
    Zombie Apocolypse HTML5 Clone

    Game;
    Player;
    Actors;
    Renderer;
    Levels;
    Sound;

*/


Zapoc = {
    currentLevel: 0
};

// Sprites
// ------------------------------------------------------------------
SpriteCords = {
    zombies: {
        normal: [
            'rgb(0, 90, 230)',
            'rgb(150, 190, 30)',
            'rgb(250, 20, 80)'
        ]
    }
};

// Drawing
// ------------------------------------------------------------------
Zapoc.renderRound = function() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.drawBackground();

    for (var i = 0; i < this.gameObjects.length; i++) {

        var go = this.gameObjects[i];

        if (!go.isToBeDeleted) {
            this.moveGameObject(go);
            this.drawGameObject(go);
        } else {
            // remove game object
            this.gameObjects.splice(i, 1);
            console.log('Deleted ', go);

            this.enemyCount -= 1;

            if (this.enemyCount > 0) {
                var delay =  150 + Math.random() * 300;
                setTimeout(function() {
                    Zapoc.gameObjects.push(new Zapoc.Zombie('normal'));
                    }, delay);
            } else {
                // All enemies killed
                // end round
                console.log('Round End.');
            }
        }
    }
};


Zapoc.drawSprite = function(x, y, w, h) {
};

Zapoc.drawText = function(text, x, y, size, color) {
};

Zapoc.drawBackground = function() {
    // stub background
    this.fillRect(0, 0, this.width, this.height, 'rgb(125, 20, 160)');
};

Zapoc.moveGameObject = function(go) {
    if (go.x + go.xSpeed > Zapoc.width ||
        go.x + go.xSpeed < 0 - go.width ||
        go.y + go.ySpeed > Zapoc.height ||
        go.y + go.ySpeed < 0 - go.height
    ) {
        go.onLeaveScreen();
    }

    go.x += go.xSpeed;
    go.y += go.ySpeed;
};

Zapoc.drawGameObject = function(go) {
    this.fillRect(go.x, go.y, go.width, go.height, go.spriteMap);
};


Zapoc.fillRect = function(x, y, w, h, colour) {
    this.ctx.fillStyle = colour;
    this.ctx.fillRect(x, y, w, h);
};

Zapoc.clicked = function(event) {
    var xPos = event.offsetX;
    var yPos = event.offsetY;

    for (var i = 0; i < Zapoc.gameObjects.length; i++) {
        var go = Zapoc.gameObjects[i];
        if (xPos > go.x &&
            xPos < go.x + go.width &&
            yPos > go.y &&
            yPos < go.y + go.height)
        {
            // do something to the actor
            console.log('hit ', go);
            go.onHit();
        }
    }
};



// Actors (Zombies, power-ups, grenades etc.)
// ------------------------------------------------------------------
Zapoc.GameObject = function() {
    this.isToBeDeleted = false;
};

Zapoc.Zombie = new Zapoc.GameObject();

Zapoc.Zombie = function() {
};

Zapoc.Zombie = function(zombieType) {
    this.zombieType = zombieType;
    this.health = 10;
    this.xSpeed =  0.6 + Math.random() * 0.3;

    // set direction
    if (Math.round(Math.random())) {
        this.xSpeed *= -1;
    }

    this.ySpeed = 0;
    this.width = 40;
    this.height = 90;
    this.x = (this.xSpeed > 0) ? 0 - this.width : Zapoc.width;
    this.y = 90;
    
    var randomSkinID = Math.round(SpriteCords.zombies[this.zombieType].length * Math.random());
    this.spriteMap = SpriteCords.zombies[zombieType][randomSkinID];
    Zapoc.GameObject.call(this, arguments);
};

Zapoc.Zombie.prototype.onHit = function() {
    this.health -= 1;
    if (this.health <= 0) {
        this.isToBeDeleted = true;
    }
};

Zapoc.Zombie.prototype.onLeaveScreen = function() {
    this.isToBeDeleted = true;
};


// 
// ------------------------------------------------------------------





// Levels
// ------------------------------------------------------------------
Zapoc.levels = {
    0: {
        zombieTypes: ['normal'],
        background: 'street.png',
        wallHeight: 100,
        rounds: 3,
        enemyCount: 10
    },
    1: {
        zombieTypes: ['normal', 'soilder'],
        background: 'bridge.png',
        wallHeight: 100,
        rounds: 3
    },
    2: {
        zombieTypes: ['soilder', 'scientist'],
        background: 'lab.png',
        wallHeight: 200,
        rounds: 4
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

    this.enemyCount = this.levels[this.currentLevel].enemyCount;
    Zapoc.gameObjects = [];
    Zapoc.gameObjects.push(new Zapoc.Zombie('normal'));



    var stopBtn = document.getElementById('stop');
    stopBtn.addEventListener('click', function() {
        console.log('df');
        clearInterval(Zapoc.ticker);
    });

    this.canvas.addEventListener('click', Zapoc.clicked, true);
};


Zapoc.start();
