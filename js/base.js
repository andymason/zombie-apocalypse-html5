/*
    Zombie Apocalypse HTML5 Clone

    Game;
    Player;
    Actors;
    Renderer;
    Levels;
    Sound;

    TODO:
        * Use a second canvas to flip spite images with .transform

*/


Zapoc = {
    currentLevel: 0,
    player: {
        cursorX: 0,
        cursorY: 0,
        grenadeCount: 3,
        bulletCount: 500,
        health: 100
    },
    shotsFired: 0,
    hits: 0,
    accuracy: 0,
    shootingDelay: 20,
    shootingCount: 0,
    grenadeFlashLength: 30,
    grenadeFlashCount: 0
};

// Sprites
// ------------------------------------------------------------------
// Temp use of colours. This will use bitmap coords later.
SpriteCords = {
    zombies: {
        normal: [
            [[132, 0, 45, 96], [179, 0, 45, 95], [226, 0, 30, 95]]
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
                    Zapoc.shotsFired += 1;
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
                        Zapoc.hits += 1;
                        go.onHit();
                    }
                }
            } else if (Zapoc.isGrenadeExplosion) {
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
                Zapoc.drawText('Round end', 260, 130);
                clearInterval(Zapoc.ticker);
            }
        }
    }

    // Grenade flash
    if (Zapoc.grenadeFlashCount > 0) {
        Zapoc.grenadeFlashCount -= 1;
        this.fillRect(0, 0, this.width, this.height, 'rgba(255, 255, 255, 0.8)');
    }

    Zapoc.isGrenadeExplosion = false;

    Zapoc.accuracy = Math.round((Zapoc.hits / Zapoc.shotsFired) * 100);

    Zapoc.drawText('Bullets left ' + Zapoc.player.bulletCount, 10, 10);
    Zapoc.drawText('Grenades left ' + Zapoc.player.grenadeCount, 10, 24);
    Zapoc.drawText('Zombies left ' + this.enemyCount, 10, 38);
    Zapoc.drawText('Shots fired ' + Zapoc.shotsFired, 10, 52);
    Zapoc.drawText('Hits ' + Zapoc.hits, 10, 66);
    Zapoc.drawText('Accuracy ' + Zapoc.accuracy + '%', 10, 80);
};



Zapoc.drawSprite = function(image, x, y, w, h, destX, destY) {

    this.ctx.drawImage(image, x, y, w, h, destX, destY, w, h);
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
    var image = Zapoc.spriteSheet;
    var x = go.spriteMap[go.skinIndex][0];
    var y = go.spriteMap[go.skinIndex][1];

    if (go.xSpeed < 0) {
        image = Zapoc.reverseSpriteSheet;
        x = Zapoc.width - (go.spriteMap[go.skinIndex][0] + go.width);
    }

    Zapoc.drawSprite(
        image,
        x,
        y,
        go.width,
        go.height,
        go.x,
        go.y
    );
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
        Zapoc.grenadeFlashCount = Zapoc.grenadeFlashLength;
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
    this.maxHealth = 10;
    this.currentHealth = this.maxHealth;
    this.xSpeed = 0.6 + Math.random() * 0.3;

    var randomSkinID = Math.round(
        (SpriteCords.zombies[this.zombieType].length - 1) * Math.random()
    );
    this.spriteMap = SpriteCords.zombies[zombieType][randomSkinID];
    this.skinIndex = 0;

    // set direction
    if (Math.round(Math.random())) {
        this.xSpeed *= -1;
    }

    this.ySpeed = 0;
    this.width = this.spriteMap[this.skinIndex][2];
    this.height = this.spriteMap[this.skinIndex][3];
    this.x = (this.xSpeed > 0) ? 0 - this.width : Zapoc.width;
    this.y = 90;

    Zapoc.GameObject.call(this, arguments);
};

Zapoc.Zombie.prototype.onHit = function() {
    this.currentHealth -= 1;
    if (this.currentHealth <= 0) {
        this.isToBeDeleted = true;
    } else if (this.currentHealth < this.maxHealth / 3) {
        this.skinIndex = 2;
    } else if (this.currentHealth < (this.maxHealth / 3) * 2) {
        this.skinIndex = 1;
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
    Zapoc.gameObjects.push(new Zapoc.Zombie('normal'));
    console.log(Zapoc.gameObjects);

    this.spriteSheet = document.createElement('img');
    this.reverseSpriteSheet = document.createElement('img');
    //this.spriteSheet.src = 'images/sprite_sheet.png';
    this.spriteSheet.src = spriteBase64;

    
    this.spriteSheet.onload = function() {
        // Generate horizontally flipped image
        this.canvas2 = document.createElement('canvas');
        this.canvas2.width = this.width;
        this.canvas2.height = this.height;

        this.ctx2 = this.canvas2.getContext('2d');
        this.ctx2.translate(this.width, 0);
        this.ctx2.scale(-1, 1);
        this.ctx2.drawImage(this, 0, 0);

        document.querySelector('body').appendChild(this.canvas2);
        Zapoc.reverseSpriteSheet.src = this.canvas2.toDataURL();

        console.log('loaded');
    };


    var stopBtn = document.getElementById('stop');
    stopBtn.addEventListener('click', function() {
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

    for (var i = 0; i < text.length; i++) {
        var letter = text[i].toUpperCase();

        if (letter === ' ') {
            currentXPos += 10;
        } else if (typeof BitmapFontMap[letter] !== 'undefined') {
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

// Hack to get around Canvas CORS security issue
var spriteBase64 = 'data:image/png;base64,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kgyA0hiFP6DttmtjZbB7+lwEWpI0XN4DKA0SBMc7BLaWg6lPUHEYWJI0XPYASjXddt9fu55AewAlScNlD6BGnWsBjg17ACVJBkB1jaYeq052tbDtkiSN0d873wINZKjhp91wZUopjfVCxRO57UP9XVwEWpIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSdZjcAkAAAP6SURBVJIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkaYL6/4N1cE7pgXpLAAAAAElFTkSuQmCC';

Zapoc.start();
