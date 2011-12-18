/*
    Zombie Apocalypse HTML5 Clone

    Game;
    Player;
    Actors;
    Renderer;
    Levels;
    Sound;

*/


Zapoc = {
    currentLevel: 0,
    player: {
        cursorX: 0,
        cursorY: 0,
        grenadeCount: 3,
        bulletCount: 100,
        health: 100
    },
    shootingDelay: 20,
    shootingCount: 0
};

// Sprites
// ------------------------------------------------------------------
// Temp use of colours. This will use bitmap coords later.
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

            if (Zapoc.isShooting && Zapoc.player.bulletCount > 0) {
                if (Zapoc.shootingCount > 0) {
                    Zapoc.shootingCount -= 1;
                } else {
                    Zapoc.shootingCount = Zapoc.shootingDelay;
                    console.log('fire');
                    Zapoc.player.bulletCount -= 1;

                    var x = Zapoc.player.cursorX;
                    var y = Zapoc.player.cursorY;

                    if (x > go.x &&
                        x < go.x + go.width &&
                        y > go.y &&
                        y < go.y + go.height)
                    {
                        // do something to the actor
                        console.log('hit ', go);
                        go.onHit();
                    }
                }
            } else if (Zapoc.isGrenadeExplosion) {
                Zapoc.isGrenadeExplosion = false;
                go.onGrenade();
            }

        } else {
            // remove game object
            this.gameObjects.splice(i, 1);
            console.log('Deleted ', go);

            this.enemyCount -= 1;

            if (this.enemyCount > 0) {
                var delay = 150 + Math.random() * 300;
                setTimeout(Zapoc.addEnemy, delay);
            } else {
                // All enemies killed
                // end round
                console.log('Round End.');
            }
        }
    }

    Zapoc.drawText('Bullets ' + Zapoc.player.bulletCount, 10, 10);
    Zapoc.drawText('Zombies left ' + this.enemyCount, 10, 24);
    
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

Zapoc.mouseDown = function(event) {
    event.preventDefault();
    if (event.button === 0 && !Zapoc.isShooting) {
        Zapoc.isShooting = true;
        Zapoc.canvas.addEventListener(
            'mousemove', Zapoc.updateCursorPosition, false
        );
    } else if (event.button === 2) {
        Zapoc.throwGrenade();
    }
};

Zapoc.updateCursorPosition = function(event) {
    Zapoc.player.cursorX = event.offsetX;
    Zapoc.player.cursorY = event.offsetY;
};

Zapoc.shootGun = function() {
};

Zapoc.throwGrenade = function(event) {
    if (Zapoc.player.grenadeCount > 0) {
        Zapoc.player.grenadeCount -= 1;
        Zapoc.isGrenadeExplosion = true;
        console.log('throw grenade');
    }
};

Zapoc.mouseUp = function(event) {
    if (Zapoc.isShooting) {
        Zapoc.isShooting = false;
        Zapoc.canvas.removeEventListener(
            'mousemove', Zapoc.updateCursorPosition, false
        );
        console.log('removed listener');
    }
};



// Actors (Zombies, power-ups, grenades etc.)
// ------------------------------------------------------------------
Zapoc.GameObject = function() {
    this.isToBeDeleted = false;
};

//Zapoc.Zombie = new Zapoc.GameObject();
Zapoc.Zombie = function(zombieType) {
    this.zombieType = zombieType;
    this.health = 10;
    this.xSpeed = 0.6 + Math.random() * 0.3;

    // set direction
    if (Math.round(Math.random())) {
        this.xSpeed *= -1;
    }

    this.ySpeed = 0;
    this.width = 40;
    this.height = 90;
    this.x = (this.xSpeed > 0) ? 0 - this.width : Zapoc.width;
    this.y = 90;

    var randomSkinID = Math.round(
        (SpriteCords.zombies[this.zombieType].length - 1) * Math.random()
    );
    this.spriteMap = SpriteCords.zombies[zombieType][randomSkinID];

    Zapoc.GameObject.call(this, arguments);
};

Zapoc.Zombie.prototype.onHit = function() {
    this.health -= 1;
    if (this.health <= 0) {
        this.isToBeDeleted = true;
    }
};

Zapoc.Zombie.prototype.onGrenade = function() {
        this.isToBeDeleted = true;
};

Zapoc.Zombie.prototype.onLeaveScreen = function() {
    this.isToBeDeleted = true;
};


//
// ------------------------------------------------------------------
Zapoc.addEnemy = function() {
    Zapoc.gameObjects.push(new Zapoc.Zombie('normal'));
};


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

    this.spriteSheet = document.createElement('img');
    this.spriteSheet.src = 'images/sprite_sheet.png';
    this.spriteSheet.onload = function() {
        console.log('loaded');
    };


    var stopBtn = document.getElementById('stop');
    stopBtn.addEventListener('click', function() {
        console.log('df');
        clearInterval(Zapoc.ticker);
    });

    this.canvas.addEventListener('mousedown', Zapoc.mouseDown, false);
    this.canvas.addEventListener('mouseup', Zapoc.mouseUp, false);
    this.canvas.addEventListener('contextmenu', function(event) {
        if (event.button === 2) {
            event.preventDefault();
            return false;
        }
    }, false);

};

Zapoc.drawText = function(text, xpos, ypos) {
    var currentXPos = xpos;
    var letterSpace = 1;

    for (var i=0; i < text.length; i++) {
        var letter = text[i].toUpperCase();

        if (letter === " ") {
            currentXPos += 10;
        } else if(typeof BitmapFontMap[letter] !== 'undefined') {
            var ch = BitmapFontMap[letter];
            Zapoc.ctx.drawImage(
                this.spriteSheet,
                ch[0],
                ch[1],
                ch[2],
                ch[3],
                currentXPos, 
                ypos,
                ch[2],
                ch[3]
            );

            currentXPos += ch[2] + letterSpace;
        }
    }
};


BitmapFontMap = {
    'A': [0, 3, 9, 10],
    'B': [12, 3, 7, 10],
    'C': [22, 3, 9, 11],
    'D': [34, 3, 8, 10],
    'E': [44, 3, 7, 10],
    'F': [56, 3, 7, 10],
    'G': [65, 3, 10, 11],
    

    'H': [1, 16, 8, 10],
    'I': [12, 16, 2, 10],
    'J': [18, 16, 6, 11],
    'K': [30, 16, 8, 10],
    'L': [41, 16, 6, 10],
    'M': [50, 16, 9, 10],
    'N': [63, 16, 8, 10],
    'O': [0, 29, 10, 11],
    'P': [13, 29, 7, 10],
    'Q': [23, 29, 10, 11],
    'R': [36, 29, 8, 10],
    'S': [46, 29, 8, 11],
    'T': [57, 29, 8, 10],
    'U': [68, 29, 8, 11],
    'V': [0, 42, 9, 10],
    'W': [11, 42, 12, 10],
    'X': [25, 42, 9, 10],
    'Y': [36, 42, 9, 10],
    'Z': [47, 42, 8, 10],

    '0': [57, 42, 7, 11],
    '1': [67, 42, 4, 10],
    '2': [0, 55, 7, 10],
    '3': [9, 55, 7, 11],
    '4': [18, 55, 7, 10],
    '5': [27, 55, 7, 11],
    '6': [36, 55, 7, 11],
    '7': [45, 55, 7, 10],
    '8': [54, 55, 7, 11],
    '9': [0, 68, 7, 11]
};


Zapoc.start();
