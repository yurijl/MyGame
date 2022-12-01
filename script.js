;(function() {
    var star = 0;
    var gamelvl = 0;
    var jnamb = 0;

    var Game = function(canvasId) {
        var canvas = document.getElementById(canvasId);
        var screen = canvas.getContext('2d');
        var gameSize = {x: canvas.width, y: canvas.height};

        this.bodies = createInvaders(this);
        this.player = new Player(this, gameSize);
        this.bullet = new Bullet(this, {x: gameSize.x/2 , y: gameSize.y-this.player.size.y - 15} , {x: 0,y: 0});
        this.stars = [];
        this.bombs = [];

        var self = this;
        var tick = function () {
            self.update();
            self.drow(screen, gameSize);
            requestAnimationFrame(tick);
        };
        tick();
    };

    Game.prototype = {
        update: function() {
            var bodies = this.bodies;
            var player = this.player;
            var bullet = this.bullet;
            var stars = this.stars;
            var bombs = this.bombs;

            for (var i = 0; i < this.bodies.length; i++) {
                if (colliding(this.bullet, this.bodies[i])) {

                    if (this.bullet.center.x+this.bullet.size.x/2 == this.bodies[i].center.x-this.bodies[i].size.x/2 ||
                        this.bullet.center.x-this.bullet.size.x/2 == this.bodies[i].center.x+this.bodies[i].size.x/2)
                        {this.bullet.velocyty.x *= -1;}
                    if (this.bullet.center.y+this.bullet.size.y/2 == this.bodies[i].center.y-this.bodies[i].size.y/2 ||
                        this.bullet.center.y-this.bullet.size.y/2 == this.bodies[i].center.y+this.bodies[i].size.y/2)
                        {this.bullet.velocyty.y *= -1;}

                    if (this.bodies.length==1) {}
                    else if (getRandomInt(-10,20)>0)
                        {stars.push(new Stars(this, this.bodies[i].center))}
                    else {bombs.push(new Bombs(this, this.bodies[i].center))};

                    this.bodies.splice(i, 1);
                }
            };

            for (var i = 0; i < this.stars.length; i++) {
                if (colliding(this.stars[i], this.player)) {
                    star++;
                    $(".chenged.star").html(star);
                    this.stars.splice(i, 1);
                };
            };
            for (var i = 0; i < this.stars.length; i++) {
                if (this.stars[i].center.y+this.stars[i].size.y/2 > parseInt($('#screen').css("height")))
                    {this.stars.splice(i, 1)};
            };
            for (var i = 0; i < this.bombs.length; i++) {
                if (colliding(this.bombs[i], this.player)) {
                    if (star>0) {
                        star--;
                        $(".chenged.star").html(star);
                        this.bombs.splice(i, 1);}
                    else{endGame();};
                };
            };
            for (var i = 0; i < this.bombs.length; i++) {
                if (this.bombs[i].center.y+this.bombs[i].size.y/2 > parseInt($('#screen').css("height")))
                    {this.bombs.splice(i, 1)};
            };

            if (colliding(this.bullet, this.player)) {
                if (this.player.transform==0) {this.bullet.velocyty.y *= -1;}
                else if (this.player.transform=="left") {this.bullet.velocyty.y *= -1; this.bullet.velocyty.x = -1;}
                else if (this.player.transform=="right") {this.bullet.velocyty.y *= -1; this.bullet.velocyty.x = 1;};
            };


            if (this.bodies.length == 0) {
                vinGame();

                this.bullet.center.x=parseInt($('#screen').css("width"))/2;
                this.bullet.center.y=parseInt($('#screen').css("height")) - 30;
                this.bullet.velocyty.x=0;
                this.bullet.velocyty.y=0;
                this.bodies = createInvaders(this);
            };

            if (this.bullet.center.y+this.bullet.size.y/2 >= parseInt($('#screen').css("height"))) {
                this.bullet.velocyty.y = 0;
                this.bullet.velocyty.x = 0;
                endGame();
            };

            for (var i = 0; i < this.bodies.length; i++) {this.bodies[i].update();};
            this.bullet.update();
            this.player.update();
            for (var i = 0; i < this.stars.length; i++) {this.stars[i].update();};
            for (var i = 0; i < this.bombs.length; i++) {this.bombs[i].update();};
        },

        drow: function(screen, gameSize) {
            screen.clearRect(0,0,gameSize.x,gameSize.y);
            for (var i = 0; i < this.bodies.length; i++)
                {drowRect(screen, this.bodies[i], 'box.png');}
            if (this.player.transform == 0) {drowRect(screen, this.player, 'platform.png')};
            if (this.player.transform == "left") {drowRect(screen, this.player, 'platformL.png')};
            if (this.player.transform == "right") {drowRect(screen, this.player, 'platformR.png')};
            drowRect(screen, this.bullet, 'fireball.png');
            for (var i = 0; i < this.stars.length; i++)
                {drowRect(screen, this.stars[i], 'star.png');}
            for (var i = 0; i < this.bombs.length; i++)
                {drowRect(screen, this.bombs[i], 'bomb.png');}
        }
    };

    var vinGame = function () {
        gamelvl++;
        if (gamelvl%10==0) {jnamb+=10};
        $(".chenged.gamelvl").html(gamelvl);
        if (gamelvl == 1+jnamb && jnamb!=10) {$(".chenged.howMachLvls").html("уровень")}
        else if (gamelvl >= 2+jnamb && gamelvl < 5+jnamb && jnamb!=10) {$(".chenged.howMachLvls").html("уровня")}
        else if (gamelvl >= 5) {$(".chenged.howMachLvls").html("уровней")};
        $(".hide").css("display", "block");
    };

    var endGame = function () {
        $('#screen').remove();
        $('.game').remove();
        $('.endGame').css("display", "block");
        window.setTimeout("location.reload()", 5000);
    };

    var Player = function (game, gameSize) {
        this.game = game;
        this.size = {x: 80, y: 15};
        this.center = {x: gameSize.x/2, y: gameSize.y - this.size.y};
        this.keyboarder = new Keyboarder();
        this.transform = 0;
    };

    Player.prototype = {
        update: function () {
            if (this.keyboarder.isDown(this.keyboarder.KEYS.LEFT) && this.center.x-this.size.x/2 > 0 && this.keyboarder.isUp(this.keyboarder.KEYS.SPACE)) {this.center.x -= 5;}
            else if (this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT) && this.center.x+this.size.x/2 < parseInt($("#screen").css("width")) && this.keyboarder.isUp(this.keyboarder.KEYS.SPACE)) {this.center.x += 5;}

            if (this.keyboarder.isDown(this.keyboarder.KEYS.SPACE) && this.game.bullet.velocyty.x == 0) {
                this.game.bullet.velocyty = {x:getRandomInt(-1,1), y:-5}
            }
            if (this.keyboarder.isUp(this.keyboarder.KEYS.SPACE)) {this.transform = 0}
            if (this.keyboarder.isDown(this.keyboarder.KEYS.SPACE) && this.keyboarder.isDown(this.keyboarder.KEYS.LEFT) )
                {this.transform = "left"}
            if (this.keyboarder.isDown(this.keyboarder.KEYS.SPACE) && this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT) )
                {this.transform = "right"}
        }
    };

    var Invaider = function (game, center) {
        this.game = game;
        this.size = {x: 20, y: 20};
        this.center = center;
    };

    Invaider.prototype = {
        update: function () {}
    };

    var Stars = function (game, center) {
        this.game = game;
        this.size = {x: 20, y: 20};
        this.center = center;
        this.velocyty = {x:0 , y: +3};
    };

    Stars.prototype = {
        update: function () {
            this.center.y += this.velocyty.y;}
    };

    var Bombs = function (game, center) {
        this.game = game;
        this.size = {x: 20, y: 20};
        this.center = center;
        this.velocyty = {x:0 , y: +3};
    };

    Bombs.prototype = {
        update: function () {
            this.center.y += this.velocyty.y;}
    };

    var createInvaders = function (game) {
        var invaiders = [];
        for (var i = 0; i < 21; i++) {
            var x = 30+(i%7)*40;
            var y = 30+(i%3)*40;
            invaiders.push(new Invaider(game, {x: x, y: y}));
        };
        return invaiders;
    };

    var Bullet = function (game, center, velocyty) {
        this.game = game;
        this.size = {x: 10, y: 10};
        this.center = center;
        this.velocyty = velocyty;
    }

    Bullet.prototype = {
        update: function () {
            this.center.x += this.velocyty.x;
            this.center.y += this.velocyty.y;

            if (this.center.x-this.size.x/2 < 0 || this.center.x+this.size.x/2 > parseInt($('#screen').css("width"))) {this.velocyty.x *= -1;};
            if (this.center.y-this.size.y/2 < 0 || this.center.y+this.size.y/2 > parseInt($('#screen').css("height"))) {this.velocyty.y *= -1;};
        }
    };

    var drowRect = function (screen, body, url) {
        var image = new Image();
        image.src = url;
        screen.drawImage(image,body.center.x - body.size.x/2,
        body.center.y - body.size.y/2,
        body.size.x,body.size.y);
    };

    var Keyboarder = function () {
        var keyState = {};

        window.onkeydown = function (e) {
            keyState[e.keyCode] = true;
        };

        window.onkeyup = function (e) {
            keyState[e.keyCode] = false;
        };

        this.isDown = function (keyCode) {
            return keyState[keyCode] === true;
        };

        this.isUp = function (keyCode) {
            return keyState[keyCode] === false;
        };

        this.KEYS = {LEFT:37,RIGHT:39,SPACE:32};
    };

    var colliding = function (b1, b2) {
        return!(b1===b2 ||
                b1.center.x + b1.size.x/2 < b2.center.x-b2.size.x/2 ||
                b1.center.y + b1.size.y/2 < b2.center.y-b2.size.y/2 ||
                b1.center.x - b1.size.x/2 > b2.center.x+b2.size.x/2 ||
                b1.center.y - b1.size.y/2 > b2.center.y+b2.size.y/2 );
    };


    var loadSound = function (url, callback) {
        var loaded = function () {
            callback(sound);
            sound.removeEventListener("canplaythrough", loaded);
        };

        var sound = new Audio(url);
        sound.addEventListener("canplaythrough", loaded);
        sound.load();
    };

    var createGameStage = function () {
        var canvas;
        init();
        function init() {
            canvas = document.createElement( 'canvas' );
            canvas.width = 310;
            canvas.height = 310;
            $(canvas).css("border", "1px solid black").attr('id', 'screen');
            $('body').append(canvas).append("<div class='game'></div>");
            $('.game').append("<p>1) Пробел для начала игры</p>");
            $('.game').append("<p>2) Пробел + вправо - наклон вправо</p>");
            $('.game').append("<p>3) Пробел + влево - наклон влево</p>");
            $('.game').append("<p>4) Звездочка это и очки и жизни =)</p>");
            $('.game').append("<p>5) У вас <span class='red chenged star'>"+ star +"</span> звезд</p>");
            $('.game').append("<p class='hide'>6) Вы прошли <span class='red chenged gamelvl'>" + gamelvl + "</span> <span class='chenged howMachLvls'></span>!!!</p>");
            $('body').append("<h1 class='endGame'>Вы проиграли!<br>Собрано звезд: <span class='red chenged star'>"+ star +"</span><br>Пройдено уровней: <span class='red chenged gamelvl'>"+ gamelvl +"</span></h1>");
        }
    };


    function getRandomInt(min, max){
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // рандом от -1 до 1
    var nogetRandomInt = function(min, max){
        return Math.floor(Math.cos(new Date().getTime())*(max - min + 1)) + min;
    };

    window.onload = function () {
        new createGameStage();
        new Game("screen");
    };
})();