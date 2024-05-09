class MainScene extends Phaser.Scene {
    graphics;
    curve;
    path;

    constructor() {
        super("MainScene");


        this.saveFile = function(file){
            localStorage.setItem('save',JSON.stringify(file));
        };
        
        this.loadFile = function(){
            return JSON.parse(localStorage.getItem('save'));
        };





        this.reset = function(){
            this.my = {sprite: {}};
            this.bodyX = 400;
            this.bodyY = 400;
            this.Speed = 10;
            this.MissileSpeed1 = 4;
            this.MissileSpeed2 = 8;
            this.MissileSpeed3 = 32;
            this.MissileCooldown1 = 0;
            this.MissileCooldown2 = 50;
    
            this.MissileChargeMax = 100;
            this.MissileChargeRate = 0.4;
            this.MissileCharge = this.MissileChargeMax;
            this.MissileCooldownTime1 = 0;
            this.MissileCooldownTime2 = 0;
            this.NumLives = 5;
            this.Lives = this.NumLives;
            this.DamageFrame = 10;
            this.playerDamage = [];
            this.FrameDamage = 0;
            this.pause = false;
    
            this.PlayerRadius = 30;
            this.EnemiesKilled = 0;
            this.MaxLaserFireY = this.bodyY * 1.15
            this.score = 0;


            this.SaveData = this.loadFile();

            if(!this.SaveData){
                this.SaveData = {
                    TopScore: 0
                };
            }
            //console.log(this.SaveData);
        }

        /*
        my.sprite.enemies[my.sprite.enemies.length - 1].setScale(.4);
        my.sprite.enemies[my.sprite.enemies.length - 1].angle = Math.abs(my.sprite.CurveShips[tmp].angle % 180);
        my.sprite.enemies[my.sprite.enemies.length - 1].x = my.sprite.CurveShips[tmp].x;
        my.sprite.enemies[my.sprite.enemies.length - 1].y = my.sprite.CurveShips[tmp].y;
        my.sprite.enemies[my.sprite.enemies.length - 1].waitFrame = true;
        my.sprite.enemies[my.sprite.enemies.length - 1].maxHealth = 20;
        my.sprite.enemies[my.sprite.enemies.length - 1].health = my.sprite.enemies[my.sprite.enemies.length - 1].maxHealth;
        my.sprite.enemies[my.sprite.enemies.length - 1].burstMaxNum = 10;
        my.sprite.enemies[my.sprite.enemies.length - 1].burstNum = my.sprite.enemies[my.sprite.enemies.length - 1].burstMaxNum;
        my.sprite.enemies[my.sprite.enemies.length - 1].burstTime = 0;
        my.sprite.enemies[my.sprite.enemies.length - 1].burstTimer = my.sprite.enemies[my.sprite.enemies.length - 1].burstTime;
        my.sprite.enemies[my.sprite.enemies.length - 1].reloadTime = 40;
        my.sprite.enemies[my.sprite.enemies.length - 1].reloadTimer = my.sprite.enemies[my.sprite.enemies.length - 1].reloadTime;
        my.sprite.enemies[my.sprite.enemies.length - 1].fa = (Math.random() - 0.5) * 20;
        */

        this.EnemyData = {
            Enemy_1:
            {
                scale: 0.4,
                angle: 0,
                maxHealth: 20,
                burstMaxNum: 10,
                burstTime: 0,
                reloadTime: 40,
                damage: 1,
                bulletWidth: 0.1,
                bulletHeight: 0.3,
                laserSound: "Laser1",
                laserSoundRate: 5.0,
                laserSoundVolume: 0.5,
                points: 1000,
                speed: 1
            },
            Enemy_2:
            {
                scale: 0.4,
                angle: 0,
                maxHealth: 150,
                burstMaxNum: 1,
                burstTime: 0,
                reloadTime: 40,
                damage: 10,
                bulletWidth: 1,
                bulletHeight: 0.3,
                laserSound: "Laser2",
                laserSoundRate: 1.0,
                laserSoundVolume: 0.8,
                points: 2500,
                speed: 0.6
            }
        }


        this.reset();


        this.addDamage = function(damage){
            this.playerDamage.push(damage);

            let sd = this.playerDamage.length - this.DamageFrame;
            if(sd > 0){
                this.playerDamage.splice(0, sd);
            }
        }

        this.getDamage = function(){
            let sum = 0;
            for(let i = 0; i < this.playerDamage.length; i++){
                sum += this.playerDamage[i];
            }
            return sum;
        }

        //this.obj;


        this.sqDist = function(x1, y1, x2, y2){
            return (x2-x1)*(x2-x1) + (y2-y1)*(y2-y1);
        }
        this.dist = function(x1, y1, x2, y2){
            return Math.sqrt(this.sqDist(x1, y1, x2, y2));
        }

        this.degToRad = function(degrees) {
            return degrees * (Math.PI / 180);
          }
          
        this.radToDeg = function(rad) {
            return rad / (Math.PI / 180);
        }
        this.reMap = function(d, min, max){
            return d*(1-min-max) + min;
        }

        this.findNearestEnemy = function(x, y, Enemies){
            let minDist = Infinity;
            let out = -1;
            for(let i = 0; i < Enemies.length; i++){
                let d = this.dist(x, y, Enemies[i].x, Enemies[i].y);
                if(d < minDist){
                    minDist = d;
                    out = i;
                }
            }
            return {i:out, d:minDist};
        }
        this.lerp = function(n1, n2, f){
            return n1 * (1-f) + n2 * f;
        }
        this.angleLerp = function(a1, a2, f){
            let tmpa2 = a2;
            if(Math.abs((a2 + 360) - a1) < Math.abs(tmpa2 - a1)){
                tmpa2 = a2 + 360;
            }
            if(Math.abs((a2 - 360) - a1) < Math.abs(tmpa2 - a1)){
                tmpa2 = a2 - 360;
            }
            return a1 * (1-f) + tmpa2 * f;
        }
        this.spawnship;
    }

    preload() {
        // Assets from Kenny Assets pack "Shape Characters"
        // https://kenney.nl/assets/shape-characters

        this.load.setPath("./assets/");

        let Avatar = this.load.image("Avatar", "shipBlue_manned.png");

        let Enemy_1 = this.load.image("Enemy_1", "Ships/spaceShips_003.png");

        let Enemy_2 = this.load.image("Enemy_2", "Ships/spaceShips_007.png");

        //Enemy_1.flipY = true;

        //let Enemy_1 = this.load.image("Enemy_1", "playerShip1_orange.png");

        //const PlayerLayer = this.add.layer();

        //PlayerLayer.add([ Avatar ]);

        this.load.image("Missile", "Missiles/spaceMissiles_024.png");
        this.load.image("Laser", "Lasers/laserRed13.png");

        //laserRed02.png

        //fire12.png
        this.load.image("MissileFire", "Effects/fire12.png");

        this.load.image("GreenBarh", "UI/barHorizontal_green_mid.png");
        this.load.image("GreenBarr", "UI/barHorizontal_green_right.png");
        this.load.image("GreenBarl", "UI/barHorizontal_green_left.png");

        this.load.image("RedBarh", "UI/barHorizontal_red_mid.png");
        this.load.image("RedBarr", "UI/barHorizontal_red_right.png");
        this.load.image("RedBarl", "UI/barHorizontal_red_left.png");

        this.load.image("BlueBarh", "UI/barHorizontal_blue_mid.png");
        this.load.image("BlueBarr", "UI/barHorizontal_blue_right.png");
        this.load.image("BlueBarl", "UI/barHorizontal_blue_left.png");


        this.load.image("ShadowBarh", "UI/barHorizontal_shadow_mid.png");
        this.load.image("ShadowBarr", "UI/barHorizontal_shadow_right.png");
        this.load.image("ShadowBarl", "UI/barHorizontal_shadow_left.png");


        this.load.audio('MissileThrust1', [ 'Sound/thrusterFire_002.ogg' ]);
        this.load.audio('MissileThrust2', [ 'Sound/thrusterFire_000.ogg' ]);

        this.load.audio('MissileExplosion1', [ 'Sound/explosionCrunch_000.ogg' ]);
        this.load.audio('MissileExplosion2', [ 'Sound/explosionCrunch_001.ogg' ]);

        this.load.audio('Laser1', [ 'Sound/laserRetro_004.ogg' ]);
        this.load.audio('Laser2', [ 'Sound/laserRetro_004.ogg' ]);



        this.load.image("MetalPanel", "UI/metalPanel_plate.png");

        this.load.image("LifeFull", "shipBlue_manned.png");
        this.load.image("LifeLost", "shipBlue_damage2.png");

        //metalPanel_plate.png

        //const BulletLayer = this.add.layer();

        //BulletLayer.add([ Lazer ]);
        
    }

    create() {

        let my = this.my;
        let { width, height } = this.sys.game.canvas;

        my.sprite.Curves = [];
        

        this.graphics = this.add.graphics();
        this.graphics.clear(); 
        for(let X = 25; X < width - 50; X += 50){
            let points = [
                width/2, -50,
                width/2, 0,
                width/2 - (width/2 - X)*0.79, 30,
                width/2 - (width/2 - X)*0.90, 110,
                width/2 - (width/2 - X)*0.89, 120,
            ];
            my.sprite.Curves.push(new Phaser.Curves.Spline(points));                      // Clear the existing line
            //this.graphics.lineStyle(2, 0xffffff, 2);    // A white line
            //my.sprite.Curves[my.sprite.Curves.length - 1].draw(this.graphics, 32);         // Draw the spline
            
        }

        // Initialize Phaser graphics, used to draw lines
        this.graphics = this.add.graphics();

        //this.drawLine();

        this.input.mouse.disableContextMenu();

        my.sprite.avatar = this.add.sprite(this.bodyX, this.bodyY * 1.2, "Avatar");
        my.sprite.missiles = [];
        my.sprite.missileFires = [];

        my.sprite.bars = [];

        my.sprite.enemies = [];
        my.sprite.EnemyBars = [];

        my.sprite.avatar.depth = 100;

        my.sprite.avatar.setScale(.4);

        my.AKey = this.input.keyboard.addKey("A");
        my.DKey = this.input.keyboard.addKey("D");
        my.SpaceKey = this.input.keyboard.addKey("Space");
        my.EnterKey = this.input.keyboard.addKey("Enter");


        my.sprite.panel = this.add.sprite(125, 35, "MetalPanel")
        my.sprite.panel.displayWidth = 250;
        my.sprite.panel.displayHeight = 70;

        my.sprite.panel2 = this.add.sprite(width - 125, 35, "MetalPanel")
        my.sprite.panel2.displayWidth = 250;
        my.sprite.panel2.displayHeight = 70;

        my.sprite.Lives = [];
        let gap = 30;
        for(let i = 0; i < this.NumLives; i++){
            my.sprite.Lives.push({
                full: this.add.sprite(width - 125 - this.NumLives*gap*0.5 + i * gap, 35 + 15, "LifeFull"),
                lost: this.add.sprite(width - 125 - this.NumLives*gap*0.5 + i * gap, 35 + 15 + 6, "LifeLost")
            })
            my.sprite.Lives[my.sprite.Lives.length - 1].full.setScale(0.2);
            my.sprite.Lives[my.sprite.Lives.length - 1].lost.setScale(0.2);
            my.sprite.Lives[my.sprite.Lives.length - 1].lost.visible = false;
            //my.sprite.Lives[my.sprite.Lives.length - 1].full.visible = false;
        }
        this.updateLives = function(num, lives){
            for(let i = 0; i < lives.length; i++){
                if(i > this.NumLives - num - 1){
                    lives[i].full.visible = true;
                    lives[i].lost.visible = false;
                } else {
                    lives[i].lost.visible = true;
                    lives[i].full.visible = false;
                }
            }
        }

        this.updateLives(this.NumLives, my.sprite.Lives);
        my.sprite.bars.push({
            x:125,
            y:35 - 15,
            w:200,
            h:20,
            value:1,
            main: this.add.sprite(0, 0, "GreenBarh"),
            right: this.add.sprite(0, 0, "GreenBarr"),
            left: this.add.sprite(0, 0, "GreenBarl"),
            Smain: this.add.sprite(0, 0, "ShadowBarh"),
            Sright: this.add.sprite(0, 0, "ShadowBarr"),
            Sleft: this.add.sprite(0, 0, "ShadowBarl")
        });

        my.sprite.bars.push({
            x:125,
            y:35 + 15,
            w:200,
            h:20,
            value:1,
            main: this.add.sprite(0, 0, "BlueBarh"),
            right: this.add.sprite(0, 0, "BlueBarr"),
            left: this.add.sprite(0, 0, "BlueBarl"),
            Smain: this.add.sprite(0, 0, "ShadowBarh"),
            Sright: this.add.sprite(0, 0, "ShadowBarr"),
            Sleft: this.add.sprite(0, 0, "ShadowBarl")
        });


        my.sprite.CurveShips = [];


        //let healthBar=this.makeBar(140,100,0x2ecc71);

        //my.sprite.enemyShip = this.add.follower(my.sprite.Curves[0], 0, 0, "Enemy_1");

        //my.sprite.enemyShip.x = my.sprite.Curves[0].points[0].x;
        //my.sprite.enemyShip.y = my.sprite.Curves[0].points[0].y;
        //my.sprite.enemyShip.startFollow(this.obj);
        //my.sprite.enemyShip.setScale(.5);
        this.spawnship = function(i, type){

            let data = this.EnemyData[type];

            my.sprite.CurveShips.push(this.add.follower(my.sprite.Curves[i], 0, 0, type));
            my.sprite.CurveShips[my.sprite.CurveShips.length - 1].setScale(data.scale);
            my.sprite.CurveShips[my.sprite.CurveShips.length - 1].x = my.sprite.Curves[i].points[0].x;
            my.sprite.CurveShips[my.sprite.CurveShips.length - 1].y = my.sprite.Curves[i].points[0].y;
            let tmp = my.sprite.CurveShips.length - 1;
            my.sprite.CurveShips[my.sprite.CurveShips.length - 1].startFollow(
                {
                    from: 0,
                    to: 0.66,
                    delay: 0,
                    duration: 5000,
                    repeat: 0,
                    yoyo: false,
                    rotateToPath: true,
                    rotationOffset: -90 + data.angle,
                    onComplete: function(){

                        let data = this.EnemyData[type];
                        my.sprite.enemies.push(this.add.sprite(my.sprite.CurveShips[tmp].x, my.sprite.CurveShips[tmp].y, type));

                        my.sprite.EnemyBars.push({
                            x: my.sprite.enemies[my.sprite.enemies.length - 1].x,
                            y: my.sprite.enemies[my.sprite.enemies.length - 1].y,
                            w:30,
                            h:2,
                            value:1,
                            main: this.add.sprite(0, 0, "RedBarh"),
                            right: this.add.sprite(0, 0, "RedBarr"),
                            left: this.add.sprite(0, 0, "RedBarl"),
                            Smain: this.add.sprite(0, 0, "ShadowBarh"),
                            Sright: this.add.sprite(0, 0, "ShadowBarr"),
                            Sleft: this.add.sprite(0, 0, "ShadowBarl")
                        });
                        my.sprite.enemies[my.sprite.enemies.length - 1].type = type;
                        my.sprite.enemies[my.sprite.enemies.length - 1].bulletWidth = data.bulletWidth;
                        my.sprite.enemies[my.sprite.enemies.length - 1].bulletHeight = data.bulletHeight;
                        my.sprite.enemies[my.sprite.enemies.length - 1].damage = data.damage;
                        my.sprite.enemies[my.sprite.enemies.length - 1].setScale(data.scale);
                        my.sprite.enemies[my.sprite.enemies.length - 1].angle = data.angle + Math.abs(my.sprite.CurveShips[tmp].angle % 180);
                        my.sprite.enemies[my.sprite.enemies.length - 1].x = my.sprite.CurveShips[tmp].x;
                        my.sprite.enemies[my.sprite.enemies.length - 1].y = my.sprite.CurveShips[tmp].y;
                        my.sprite.enemies[my.sprite.enemies.length - 1].waitFrame = true;
                        my.sprite.enemies[my.sprite.enemies.length - 1].maxHealth = data.maxHealth;
                        my.sprite.enemies[my.sprite.enemies.length - 1].health = my.sprite.enemies[my.sprite.enemies.length - 1].maxHealth;
                        my.sprite.enemies[my.sprite.enemies.length - 1].burstMaxNum = data.burstMaxNum;
                        my.sprite.enemies[my.sprite.enemies.length - 1].burstNum = my.sprite.enemies[my.sprite.enemies.length - 1].burstMaxNum;
                        my.sprite.enemies[my.sprite.enemies.length - 1].burstTime = data.burstTime;
                        my.sprite.enemies[my.sprite.enemies.length - 1].burstTimer = my.sprite.enemies[my.sprite.enemies.length - 1].burstTime;
                        my.sprite.enemies[my.sprite.enemies.length - 1].reloadTime = data.reloadTime;
                        my.sprite.enemies[my.sprite.enemies.length - 1].reloadTimer = Math.random() * my.sprite.enemies[my.sprite.enemies.length - 1].reloadTime;
                        my.sprite.enemies[my.sprite.enemies.length - 1].fa = (Math.random() - 0.5) * 20;
                        my.sprite.CurveShips[tmp].destroy();
                        my.sprite.enemies[my.sprite.enemies.length - 1].laserSound = this.sound.add(data.laserSound);
                        my.sprite.enemies[my.sprite.enemies.length - 1].laserSound.loop = true;
                        my.sprite.enemies[my.sprite.enemies.length - 1].laserSound.volume = data.laserSoundVolume;
                        my.sprite.enemies[my.sprite.enemies.length - 1].laserSound.setRate(data.laserSoundRate);
                        my.sprite.enemies[my.sprite.enemies.length - 1].points = data.points;
                        my.sprite.enemies[my.sprite.enemies.length - 1].speed = data.speed;
                        //laserRetro_004.ogg
                    },
                    callbackScope: this
                });
        }



        //this.spawnship(2, "Enemy_1");
        //this.spawnship(4, "Enemy_1");
        //this.spawnship(5, "Enemy_1");
        //this.spawnship(7, "Enemy_1");
        //this.spawnship(9, "Enemy_1");
        //this.spawnship(10, "Enemy_1");


        // index goes from 0 - 14
        this.time = 0;
        this.levels = [
            {
                waves: [
                    {
                        time:0, 
                        enemys: [
                            {name: "Enemy_1", index: 0},
                            {name: "Enemy_1", index:7},
                            {name: "Enemy_1", index: 14}
                        ]
                    },
                    {
                        time:400, 
                        enemys: [
                            {name: "Enemy_1", index: 0},
                            {name: "Enemy_1", index:4},
                            {name: "Enemy_1", index: 10},
                            {name: "Enemy_1", index: 14}
                        ]
                    },
                    {
                        time:800, 
                        enemys: [
                            {name: "Enemy_1", index: 0},
                            {name: "Enemy_2", index:4},
                            {name: "Enemy_1", index: 10},
                            {name: "Enemy_1", index: 14}
                        ]
                    },
                    {
                        time:850, 
                        enemys: [
                            {name: "Enemy_1", index:4},
                        ]
                    },
                    {
                        time:1200, 
                        enemys: [
                            {name: "Enemy_2", index: 0},
                            {name: "Enemy_1", index:4},
                            {name: "Enemy_1", index: 10},
                            {name: "Enemy_2", index: 14}
                        ]
                    },
                    {
                        time:1600, 
                        enemys: [
                            {name: "Enemy_2", index: 0},
                            {name: "Enemy_2", index:4},
                            {name: "Enemy_2", index: 10},
                            {name: "Enemy_2", index: 14}
                        ]
                    }
                ]
            }
        ];
        this.level = this.levels[0];

        this.updateLevel = function(level){
            for(let i = 0; i < level.waves.length; i++){
                if(level.waves[i].time === this.time){
                    for(let o = 0; o < level.waves[i].enemys.length; o++){
                        this.spawnship(level.waves[i].enemys[o].index, level.waves[i].enemys[o].name);
                    }
                }
            }
        }

        this.LoadLevel = function(level){
            this.level = level;
            this.time = 0;
            let count = 0;
            for(let i = 0; i < level.waves.length; i++){
                for(let o = 0; o < level.waves[i].enemys.length; o++){
                    count++;
                }
            }
            level.numEnemies = count;
            //this.updateLevel(level);
        }
        this.LoadLevel(this.levels[0]);
        

        my.sprite.Lasers = [];

        this.fireLaser = function(x, y, w, h, a, d){
            if(y < this.MaxLaserFireY){
                my.sprite.Lasers.push(this.add.sprite(x, y, "Laser"));
                let i = my.sprite.Lasers.length - 1;
                my.sprite.Lasers[i].setScale(w, h);
                my.sprite.Lasers[i].angle = -180 + a + Math.random()*2;
                my.sprite.Lasers[i].damage = d;
            }
        }


        this.mouseDown = this.input.on('pointerdown', (pointer) => {
            if(this.MissileCharge >= 10 && pointer.button === 0){
                this.MissileCharge -= 10;
                if(this.MissileCharge <= 0){
                    this.MissileCooldownTime1 = this.MissileCooldown1;
                    this.MissileCharge = 0;
                }
                if(this.MissileCooldownTime1 <= 0){
                    for(let i = 0; i < 10; i++){
                    my.sprite.missiles.push(this.add.sprite(my.sprite.avatar.x, my.sprite.avatar.y, "Missile"));
                    my.sprite.missileFires.push(this.add.sprite(my.sprite.avatar.x, my.sprite.avatar.y, "MissileFire"));
                    my.sprite.missiles[my.sprite.missiles.length - 1].tx = pointer.x;
                    my.sprite.missiles[my.sprite.missiles.length - 1].ty = pointer.y;

                    my.sprite.missiles[my.sprite.missiles.length - 1].dx = my.sprite.missiles[my.sprite.missiles.length - 1].x - my.sprite.missiles[my.sprite.missiles.length - 1].tx;
                    my.sprite.missiles[my.sprite.missiles.length - 1].dy = my.sprite.missiles[my.sprite.missiles.length - 1].y - my.sprite.missiles[my.sprite.missiles.length - 1].ty;

                    let tmpd = this.dist(my.sprite.missiles[my.sprite.missiles.length - 1].x, my.sprite.missiles[my.sprite.missiles.length - 1].y, my.sprite.missiles[my.sprite.missiles.length - 1].tx, my.sprite.missiles[my.sprite.missiles.length - 1].ty);
                    my.sprite.missiles[my.sprite.missiles.length - 1].d = tmpd;

                    my.sprite.missiles[my.sprite.missiles.length - 1].s = this.MissileSpeed1;



                    //my.sprite.missiles[my.sprite.missiles.length - 1].setScale(.5);
                    //my.sprite.missileFires[my.sprite.missileFires.length - 1].setScale(.75);
                    //my.sprite.missileFires[my.sprite.missileFires.length - 1].setOrigin(0.5, 1);

                    my.sprite.missiles[my.sprite.missiles.length - 1].setScale(.25);
                    my.sprite.missileFires[my.sprite.missileFires.length - 1].setScale(.375);
                    my.sprite.missileFires[my.sprite.missileFires.length - 1].setOrigin(0.5, 1);

                    my.sprite.missiles[my.sprite.missiles.length - 1].p = 0;

                    my.sprite.missiles[my.sprite.missiles.length - 1].sinShift = Math.random()*4;

                    my.sprite.missiles[my.sprite.missiles.length - 1].t = Math.random() * 25;
                    my.sprite.missiles[my.sprite.missiles.length - 1].damage = 1;

                    my.sprite.missiles[my.sprite.missiles.length - 1].Thrust = this.sound.add('MissileThrust1');
                    my.sprite.missiles[my.sprite.missiles.length - 1].Thrust.loop = true;
                    my.sprite.missiles[my.sprite.missiles.length - 1].Thrust.volume = 0.2;
                    my.sprite.missiles[my.sprite.missiles.length - 1].Thrust.play();

                    my.sprite.missiles[my.sprite.missiles.length - 1].Explosion = this.sound.add('MissileExplosion1');
                    my.sprite.missiles[my.sprite.missiles.length - 1].Explosion.volume = 0.5;
                    //my.sprite.missiles[my.sprite.missiles.length - 1].Explosion.play();
                    }
                }
            }
            if(this.MissileCooldownTime2 <= 0 && pointer.button === 2){
                for(let i = 0; i < 1; i++){
                    my.sprite.missiles.push(this.add.sprite(my.sprite.avatar.x, my.sprite.avatar.y, "Missile"));
                    my.sprite.missileFires.push(this.add.sprite(my.sprite.avatar.x, my.sprite.avatar.y, "MissileFire"));
                    this.MissileCooldownTime2 = this.MissileCooldown2;
                    my.sprite.missiles[my.sprite.missiles.length - 1].tx = pointer.x;
                    my.sprite.missiles[my.sprite.missiles.length - 1].ty = pointer.y;

                    my.sprite.missiles[my.sprite.missiles.length - 1].dx = my.sprite.missiles[my.sprite.missiles.length - 1].x - my.sprite.missiles[my.sprite.missiles.length - 1].tx;
                    my.sprite.missiles[my.sprite.missiles.length - 1].dy = my.sprite.missiles[my.sprite.missiles.length - 1].y - my.sprite.missiles[my.sprite.missiles.length - 1].ty;

                    let tmpd = this.dist(my.sprite.missiles[my.sprite.missiles.length - 1].x, my.sprite.missiles[my.sprite.missiles.length - 1].y, my.sprite.missiles[my.sprite.missiles.length - 1].tx, my.sprite.missiles[my.sprite.missiles.length - 1].ty);
                    my.sprite.missiles[my.sprite.missiles.length - 1].d = tmpd;

                    my.sprite.missiles[my.sprite.missiles.length - 1].s = this.MissileSpeed1;



                    my.sprite.missiles[my.sprite.missiles.length - 1].setScale(.5);
                    my.sprite.missileFires[my.sprite.missileFires.length - 1].setScale(.75);
                    my.sprite.missileFires[my.sprite.missileFires.length - 1].setOrigin(0.5, 1);

                    my.sprite.missiles[my.sprite.missiles.length - 1].p = 0;

                    my.sprite.missiles[my.sprite.missiles.length - 1].sinShift = Math.random()*4;

                    my.sprite.missiles[my.sprite.missiles.length - 1].t = 0;
                    my.sprite.missiles[my.sprite.missiles.length - 1].damage = 10;

                    my.sprite.missiles[my.sprite.missiles.length - 1].Thrust = this.sound.add('MissileThrust2');
                    my.sprite.missiles[my.sprite.missiles.length - 1].Thrust.loop = true;
                    my.sprite.missiles[my.sprite.missiles.length - 1].Thrust.volume = 4;
                    my.sprite.missiles[my.sprite.missiles.length - 1].Thrust.play();

                    my.sprite.missiles[my.sprite.missiles.length - 1].Explosion = this.sound.add('MissileExplosion2');
                    my.sprite.missiles[my.sprite.missiles.length - 1].Explosion.volume = 3;
                }
            }
        });

        this.scoreText = this.add.text(width - 125, 35 - 15, 'Current Score: 1053', { fontFamily: 'Arial', fontSize: 24, color: '#ffffff' });
        this.scoreText.setOrigin(0.5, 0.5);
        this.scoreText.depth = 1000;


        this.lose = this.add.text(width/2, height/2, 'You lose, press enter to try again', { fontFamily: 'Arial', fontSize: 24, color: '#ffffff' });
        this.lose.setOrigin(0.5, 0.5);
        this.lose.visible = false;
        this.lose.depth = 1000;

        this.win = this.add.text(width/2, height/2, 'You win, press enter to restart the game', { fontFamily: 'Arial', fontSize: 24, color: '#ffffff' });
        this.win.setOrigin(0.5, 0.5);
        this.win.visible = false;
        this.win.depth = 1000;

        //my.sprite.MissileThrust = this.sound.add('MissileThrust');
        //my.sprite.MissileThrust.loop = true;
        //my.sprite.MissileThrust.play();

    }

    //drawPoints() {
    //    for (let point of this.curve1.points) {
    //        this.xImages.push(this.add.image(point.x, point.y, "x-mark"));
    //    }
    //}

    // Clear points
    // Removes all of the points, and then clears the line and x-marks

    // Draws the spline
    drawLine() {
        this.graphics.clear();                      // Clear the existing line
        this.graphics.lineStyle(2, 0xffffff, 1);    // A white line
        this.curve1.draw(this.graphics, 32);         // Draw the spline
    }

    update() {
        let { width, height } = this.sys.game.canvas;
        let my = this.my;
        this.updateLevel(this.level);
        //console.log(this.time);

        if(!this.pause){
            this.FrameDamage = 0;
            //this.spawnship();

            

            //my.sprite.enemyShip.x = my.sprite.Curves[8].points[0].x;
            //my.sprite.enemyShip.y = my.sprite.Curves[8].points[0].y;
            //my.sprite.enemyShip.startFollow(obj);



            if(my.AKey.isDown){
                my.sprite.avatar.x -= this.Speed;
            }
            if(my.DKey.isDown){
                my.sprite.avatar.x += this.Speed;
            }
            if(my.sprite.avatar.x > this.bodyX*2){
                my.sprite.avatar.x = this.bodyX*2;
            }
            if(my.sprite.avatar.x < 0){
                my.sprite.avatar.x = 0;
            }
            this.MissileCooldownTime1--;
            this.MissileCooldownTime2--;

            if(this.MissileCooldownTime1 < 0){
                this.MissileCooldownTime1 = 0;
            }
            if(this.MissileCooldownTime2 < 0){
                this.MissileCooldownTime2 = 0;
            }
            this.MissileCharge += this.MissileChargeRate;
            if(this.MissileCharge > this.MissileChargeMax){
                this.MissileCharge = this.MissileChargeMax;
            }

            for(let i = 0; i < my.sprite.missiles.length; i++){
                if(my.sprite.missiles[i].t <= 0){
                    if(my.sprite.missiles[i].p === 0 || my.sprite.missiles[i].p === 1){
                        my.sprite.missiles[i].a = -this.radToDeg(Math.atan2(my.sprite.missiles[i].x - my.sprite.missiles[i].tx, my.sprite.missiles[i].y - my.sprite.missiles[i].ty));
                    } else {
                        my.sprite.missiles[i].a = -this.radToDeg(Math.atan2(my.sprite.missiles[i].dx, my.sprite.missiles[i].dy));
                        //my.sprite.missiles[i].a = my.sprite.missiles[i].angle;
                    }
                    //my.sprite.missiles[i].y -= ((my.sprite.missiles[i].y - my.sprite.missiles[i].ty)/(tmpd))*this.MissileSpeed;
                    //my.sprite.missiles[i].x -= ((my.sprite.missiles[i].x - my.sprite.missiles[i].tx)/(tmpd))*this.MissileSpeed;
                    my.sprite.missiles[i].d -= my.sprite.missiles[i].s;
                    if(my.sprite.missiles[i].d < my.sprite.missiles[i].s + 0.1 && my.sprite.missiles[i].p === 0){
                        //my.sprite.missiles[i].d = 0.001;
                        let tmpI = this.findNearestEnemy(my.sprite.missiles[i].x, my.sprite.missiles[i].y, my.sprite.enemies);
                        if(tmpI.i !== -1){
                            my.sprite.missiles[i].tx = my.sprite.enemies[tmpI.i].x;
                            my.sprite.missiles[i].ty = my.sprite.enemies[tmpI.i].y;

                            my.sprite.missiles[i].dx = my.sprite.missiles[i].x - my.sprite.missiles[i].tx;
                            my.sprite.missiles[i].dy = my.sprite.missiles[i].y - my.sprite.missiles[i].ty;

                            my.sprite.missiles[i].d = tmpI.d;
                            my.sprite.missiles[i].s = this.MissileSpeed2;
                            my.sprite.missiles[i].p = 1;
                        } else {
                            my.sprite.missiles[i].p = 2;
                            my.sprite.missiles[i].s = this.MissileSpeed3;
                        }
                    }
                    if(my.sprite.missiles[i].d < my.sprite.missiles[i].s + 0.1 && my.sprite.missiles[i].p === 1){
                        my.sprite.missiles[i].p = 2;
                        my.sprite.missiles[i].s = this.MissileSpeed3;
                    }
                    let tmpd = this.dist(my.sprite.missiles[i].x, my.sprite.missiles[i].y, my.sprite.missiles[i].tx, my.sprite.missiles[i].ty);

                    if(tmpd !== 0){
                        let newx;
                        let newy;
                        if(my.sprite.missiles[i].p === 0){
                            newx = my.sprite.missiles[i].tx + ((my.sprite.missiles[i].x - my.sprite.missiles[i].tx)/tmpd) * my.sprite.missiles[i].d + ((my.sprite.missiles[i].y - my.sprite.missiles[i].ty)/tmpd) * Math.sin((my.sprite.missiles[i].d/30) + my.sprite.missiles[i].sinShift)*8;
                            newy = my.sprite.missiles[i].ty + ((my.sprite.missiles[i].y - my.sprite.missiles[i].ty)/tmpd) * my.sprite.missiles[i].d - ((my.sprite.missiles[i].x - my.sprite.missiles[i].tx)/tmpd) * Math.sin((my.sprite.missiles[i].d/30) + my.sprite.missiles[i].sinShift)*8;
                        } else if(my.sprite.missiles[i].p === 1){
                            newx = my.sprite.missiles[i].tx + ((my.sprite.missiles[i].x - my.sprite.missiles[i].tx)/tmpd) * my.sprite.missiles[i].d + ((my.sprite.missiles[i].y - my.sprite.missiles[i].ty)/tmpd) * Math.sin((my.sprite.missiles[i].d/30) + my.sprite.missiles[i].sinShift)*8;
                            newy = my.sprite.missiles[i].ty + ((my.sprite.missiles[i].y - my.sprite.missiles[i].ty)/tmpd) * my.sprite.missiles[i].d - ((my.sprite.missiles[i].x - my.sprite.missiles[i].tx)/tmpd) * Math.sin((my.sprite.missiles[i].d/30) + my.sprite.missiles[i].sinShift)*8;
                        } else if(my.sprite.missiles[i].p === 2){
                            newx = my.sprite.missiles[i].x + Math.sin(this.degToRad(my.sprite.missiles[i].angle)) * my.sprite.missiles[i].s;
                            newy = my.sprite.missiles[i].y - Math.cos(this.degToRad(my.sprite.missiles[i].angle)) * my.sprite.missiles[i].s;
                        }



                        my.sprite.missiles[i].x = this.lerp(my.sprite.missiles[i].x, newx, 0.2);
                        my.sprite.missiles[i].y = this.lerp(my.sprite.missiles[i].y, newy, 0.2);

                    
                    
                    }
                    //let tmpa = my.sprite.missiles[i].angle - 180 + (my.sprite.missiles[i].angle - my.sprite.missiles[i].a)/2 + Math.random()*10;


                    //console.log(my.sprite.missiles[i].a);
                    //if(my.sprite.missiles[i].p === 0 || my.sprite.missiles[i].p === 1){
                        my.sprite.missiles[i].angle = this.angleLerp(my.sprite.missiles[i].angle, my.sprite.missiles[i].a, 0.2);
                    //}

                    //my.sprite.missileFires[i].x = my.sprite.missiles[i].x - Math.sin(this.degToRad(my.sprite.missiles[i].angle)) * 10;
                    //my.sprite.missileFires[i].y = my.sprite.missiles[i].y + Math.cos(this.degToRad(my.sprite.missiles[i].angle)) * 10;
                    

                    my.sprite.missiles[i].depth = 50;
                    my.sprite.missileFires[i].depth = 51;
                } else {
                    
                    my.sprite.missiles[i].x = my.sprite.avatar.x;
                    my.sprite.missiles[i].y = my.sprite.avatar.y;
                    my.sprite.missiles[i].d = this.dist(my.sprite.missiles[i].x, my.sprite.missiles[i].y, my.sprite.missiles[i].tx, my.sprite.missiles[i].ty);
                }
                let tmpa = my.sprite.missiles[i].angle - 180 + (my.sprite.missiles[i].angle - my.sprite.missiles[i].a)/2 + Math.random()*10;
                my.sprite.missileFires[i].x = my.sprite.missiles[i].x - Math.sin(this.degToRad(my.sprite.missiles[i].angle)) * 15 * my.sprite.missileFires[i].scale;
                my.sprite.missileFires[i].y = my.sprite.missiles[i].y + Math.cos(this.degToRad(my.sprite.missiles[i].angle)) * 15 * my.sprite.missileFires[i].scale;
                my.sprite.missileFires[i].angle = tmpa;
                my.sprite.missiles[i].t--;
            }
            for(let i = 0; i < my.sprite.missiles.length; i++){
                for(let o = 0; o < my.sprite.enemies.length; o++){
                    if(this.dist(my.sprite.missiles[i].x, my.sprite.missiles[i].y, my.sprite.enemies[o].x, my.sprite.enemies[o].y) < 20){
                        my.sprite.missiles[i].Explosion.play();
                        my.sprite.enemies[o].health -= my.sprite.missiles[i].damage;
                        if(my.sprite.enemies[o].health < 0){
                            my.sprite.enemies[o].health = 0;
                        }
                        my.sprite.missiles[i].Thrust.destroy();
                        my.sprite.missiles[i].destroy();
                        my.sprite.missileFires[i].destroy();
                        my.sprite.missiles.splice(i, 1);
                        my.sprite.missileFires.splice(i, 1);
                        //console.log(my.sprite.missiles[i].damage);
                        i--;
                        if(i < 0){
                            i = 0;
                        }
                        break;
                    }
                }
            }
            
            for(let i = 0; i < my.sprite.missiles.length; i++){
                //console.log(width);
                if(this.sqDist(my.sprite.missiles[i].x, my.sprite.missiles[i].y, width/2, height/2) > width*width + height*height + 50){
                    my.sprite.missiles[i].Thrust.destroy();
                    my.sprite.missiles[i].destroy();
                    my.sprite.missileFires[i].destroy();
                    my.sprite.missiles.splice(i, 1);
                    my.sprite.missileFires.splice(i, 1);
                    i--;
                    if(i < 0){
                        i = 0;
                    }
                }
            }
            
            for(let i = 0; i < my.sprite.enemies.length; i++){
                my.sprite.enemies[i].depth = 90;
                my.sprite.enemies[i].setScale(.4);
                if(!my.sprite.enemies[i].waitFrame){
                    my.sprite.enemies[i].angle = this.angleLerp(my.sprite.enemies[i].angle, 0, 0.001);
                    my.sprite.enemies[i].y += my.sprite.enemies[i].speed;
                }
                my.sprite.enemies[i].waitFrame = false;

                if(my.sprite.enemies[i].reloadTimer <= 0){
                    my.sprite.enemies[i].burstNum = my.sprite.enemies[i].burstMaxNum;
                    //this.fireLaser(my.sprite.enemies[i].x, my.sprite.enemies[i].y);
                    my.sprite.enemies[i].reloadTimer = my.sprite.enemies[i].reloadTime + Math.random() * (my.sprite.enemies[i].reloadTime * 0.1);
                    //my.sprite.enemies[i].fa = (Math.random() - 0.5) * 20;
                    my.sprite.enemies[i].fa = (Math.random() - 0.5) * 20 + 180 - this.radToDeg(Math.atan2(my.sprite.enemies[i].x - my.sprite.avatar.x, my.sprite.enemies[i].y - my.sprite.avatar.y));
                }
                if(my.sprite.enemies[i].burstTimer <= 0 && my.sprite.enemies[i].burstNum > 0){
                    this.fireLaser(my.sprite.enemies[i].x, my.sprite.enemies[i].y, my.sprite.enemies[i].bulletWidth, my.sprite.enemies[i].bulletHeight, my.sprite.enemies[i].fa, my.sprite.enemies[i].damage);
                    my.sprite.enemies[i].burstTimer = my.sprite.enemies[i].burstTime;
                    my.sprite.enemies[i].burstNum--;
                    my.sprite.enemies[i].laserSound.play();
                } else{
                    my.sprite.enemies[i].laserSound.pause();
                }
                my.sprite.enemies[i].burstTimer--;
                my.sprite.enemies[i].reloadTimer--;

                if(my.sprite.enemies[i].health <= 0){
                    this.EnemiesKilled++;
                    this.score += Math.round(Math.abs(my.sprite.enemies[i].points * (my.sprite.enemies[i].y / height)));
                    my.sprite.enemies[i].laserSound.destroy();
                    my.sprite.enemies[i].destroy();
                    my.sprite.EnemyBars[i].main.destroy();
                    my.sprite.EnemyBars[i].right.destroy();
                    my.sprite.EnemyBars[i].left.destroy();
                    my.sprite.EnemyBars[i].Smain.destroy();
                    my.sprite.EnemyBars[i].Sright.destroy();
                    my.sprite.EnemyBars[i].Sleft.destroy();
                    my.sprite.enemies.splice(i, 1);
                    my.sprite.EnemyBars.splice(i, 1);
                    i--;
                    if(i < 0){
                        i = 0;
                    }
                }
                //.setOrigin(1, 0.5);
            }

            for(let i = 0; i < my.sprite.Lasers.length; i++){
                my.sprite.Lasers[i].y -= Math.cos(this.degToRad(my.sprite.Lasers[i].angle))*5;
                my.sprite.Lasers[i].x += Math.sin(this.degToRad(my.sprite.Lasers[i].angle))*5;
                //my.sprite.Lasers[i].angle = 180;
                if(this.dist(my.sprite.Lasers[i].x, my.sprite.Lasers[i].y, my.sprite.avatar.x, my.sprite.avatar.y) < this.PlayerRadius){
                    this.FrameDamage += my.sprite.Lasers[i].damage;
                    my.sprite.Lasers[i].destroy();
                    my.sprite.Lasers.splice(i, 1);
                    i--;
                    if(i < 0){
                        i = 0;
                    }
                }
                if(my.sprite.Lasers[i].x > width + 50 || my.sprite.Lasers[i].x < -50 || my.sprite.Lasers[i].y > height + 50 || my.sprite.Lasers[i].y < -50){
                    my.sprite.Lasers[i].destroy();
                    my.sprite.Lasers.splice(i, 1);
                    i--;
                    if(i < 0){
                        i = 0;
                    }
                }
            }


            for(let i = 0; i < my.sprite.EnemyBars.length; i++){
                my.sprite.EnemyBars[i].x = my.sprite.enemies[i].x;
                my.sprite.EnemyBars[i].y = my.sprite.enemies[i].y + 20;
                my.sprite.EnemyBars[i].value = my.sprite.enemies[i].health / my.sprite.enemies[i].maxHealth;
                let value = this.reMap(my.sprite.EnemyBars[i].value, 0, 0);
                my.sprite.EnemyBars[i].main.x = Math.floor(my.sprite.EnemyBars[i].x - my.sprite.EnemyBars[i].w/2);
                my.sprite.EnemyBars[i].main.y = my.sprite.EnemyBars[i].y;
                my.sprite.EnemyBars[i].main.displayWidth = my.sprite.EnemyBars[i].w * value;
                my.sprite.EnemyBars[i].main.displayHeight = my.sprite.EnemyBars[i].h;
                my.sprite.EnemyBars[i].main.depth = 200;
                my.sprite.EnemyBars[i].main.setOrigin(0, 0.5);


                my.sprite.EnemyBars[i].right.x = Math.floor(my.sprite.EnemyBars[i].x - my.sprite.EnemyBars[i].w/2 + my.sprite.EnemyBars[i].w * value);
                my.sprite.EnemyBars[i].right.y = my.sprite.EnemyBars[i].y;
                my.sprite.EnemyBars[i].right.displayHeight = my.sprite.EnemyBars[i].h;
                my.sprite.EnemyBars[i].right.displayWidth = 0.5;
                my.sprite.EnemyBars[i].right.depth = 199;
                my.sprite.EnemyBars[i].right.setOrigin(0, 0.5);


                my.sprite.EnemyBars[i].left.x = my.sprite.EnemyBars[i].x - my.sprite.EnemyBars[i].w/2;
                my.sprite.EnemyBars[i].left.y = my.sprite.EnemyBars[i].y;
                my.sprite.EnemyBars[i].left.displayHeight = my.sprite.EnemyBars[i].h;
                my.sprite.EnemyBars[i].left.displayWidth = 0.5;
                my.sprite.EnemyBars[i].left.depth = 199;
                my.sprite.EnemyBars[i].left.setOrigin(1, 0.5);


                my.sprite.EnemyBars[i].Smain.x = Math.round(my.sprite.EnemyBars[i].x - my.sprite.EnemyBars[i].w/2);
                my.sprite.EnemyBars[i].Smain.y = my.sprite.EnemyBars[i].y;
                my.sprite.EnemyBars[i].Smain.displayWidth = my.sprite.EnemyBars[i].w;
                my.sprite.EnemyBars[i].Smain.displayHeight = my.sprite.EnemyBars[i].h;
                my.sprite.EnemyBars[i].Smain.depth = 198;
                my.sprite.EnemyBars[i].Smain.setOrigin(0, 0.5);


                my.sprite.EnemyBars[i].Sright.x = my.sprite.EnemyBars[i].x - my.sprite.EnemyBars[i].w/2 + my.sprite.EnemyBars[i].w;
                my.sprite.EnemyBars[i].Sright.y = my.sprite.EnemyBars[i].y;
                my.sprite.EnemyBars[i].Sright.displayHeight = my.sprite.EnemyBars[i].h;
                my.sprite.EnemyBars[i].Sright.displayWidth = 0.5;
                my.sprite.EnemyBars[i].Sright.depth = 198;
                my.sprite.EnemyBars[i].Sright.setOrigin(0, 0.5);


                my.sprite.EnemyBars[i].Sleft.x = my.sprite.EnemyBars[i].x - my.sprite.EnemyBars[i].w/2;
                my.sprite.EnemyBars[i].Sleft.y = my.sprite.EnemyBars[i].y;
                my.sprite.EnemyBars[i].Sleft.displayHeight = my.sprite.EnemyBars[i].h;
                my.sprite.EnemyBars[i].Sleft.displayWidth = 0.5;
                my.sprite.EnemyBars[i].Sleft.depth = 198;
                my.sprite.EnemyBars[i].Sleft.setOrigin(1, 0.5);
            }






            my.sprite.bars[0].value = this.MissileCharge / this.MissileChargeMax;
            my.sprite.bars[1].value = (this.MissileCooldown2-this.MissileCooldownTime2)/this.MissileCooldown2;

            for(let i = 0; i < my.sprite.bars.length; i++){
                let value = this.reMap(my.sprite.bars[i].value, 0.01, 0);
                my.sprite.bars[i].main.x = Math.floor(my.sprite.bars[i].x - my.sprite.bars[i].w/2);
                my.sprite.bars[i].main.y = my.sprite.bars[i].y;
                my.sprite.bars[i].main.displayWidth = my.sprite.bars[i].w * value;
                my.sprite.bars[i].main.displayHeight = my.sprite.bars[i].h;
                my.sprite.bars[i].main.depth = 200;
                my.sprite.bars[i].main.setOrigin(0, 0.5);


                my.sprite.bars[i].right.x = Math.floor(my.sprite.bars[i].x - my.sprite.bars[i].w/2 + my.sprite.bars[i].w * value);
                my.sprite.bars[i].right.y = my.sprite.bars[i].y;
                my.sprite.bars[i].right.displayHeight = my.sprite.bars[i].h;
                my.sprite.bars[i].right.depth = 199;
                my.sprite.bars[i].right.setOrigin(0, 0.5);


                my.sprite.bars[i].left.x = my.sprite.bars[i].x - my.sprite.bars[i].w/2;
                my.sprite.bars[i].left.y = my.sprite.bars[i].y;
                my.sprite.bars[i].left.displayHeight = my.sprite.bars[i].h;
                my.sprite.bars[i].left.depth = 199;
                my.sprite.bars[i].left.setOrigin(1, 0.5);


                my.sprite.bars[i].Smain.x = Math.round(my.sprite.bars[i].x - my.sprite.bars[i].w/2);
                my.sprite.bars[i].Smain.y = my.sprite.bars[i].y;
                my.sprite.bars[i].Smain.displayWidth = my.sprite.bars[i].w;
                my.sprite.bars[i].Smain.displayHeight = my.sprite.bars[i].h;
                my.sprite.bars[i].Smain.depth = 198;
                my.sprite.bars[i].Smain.setOrigin(0, 0.5);


                my.sprite.bars[i].Sright.x = my.sprite.bars[i].x - my.sprite.bars[i].w/2 + my.sprite.bars[i].w;
                my.sprite.bars[i].Sright.y = my.sprite.bars[i].y;
                my.sprite.bars[i].Sright.displayHeight = my.sprite.bars[i].h;
                my.sprite.bars[i].Sright.depth = 198;
                my.sprite.bars[i].Sright.setOrigin(0, 0.5);


                my.sprite.bars[i].Sleft.x = my.sprite.bars[i].x - my.sprite.bars[i].w/2;
                my.sprite.bars[i].Sleft.y = my.sprite.bars[i].y;
                my.sprite.bars[i].Sleft.displayHeight = my.sprite.bars[i].h;
                my.sprite.bars[i].Sleft.depth = 198;
                my.sprite.bars[i].Sleft.setOrigin(1, 0.5);
            }
            //console.log(this.MissileCharge);
            this.addDamage(this.FrameDamage);
            if(this.getDamage() > 8){
                this.Lives--;
                this.score -= 100;
                this.updateLives(this.Lives, my.sprite.Lives);
                this.playerDamage = [];
            }

            if(this.Lives <= 0){
                //this.reset();
                //this.scene.restart();
            }
            this.time++;
        }
        if(this.EnemiesKilled >= this.level.numEnemies){
            for(let i = 0; i < my.sprite.missiles.length; i++){
                my.sprite.missiles[i].Thrust.destroy();
            }
            for(let i = 0; i < my.sprite.enemies.length; i++){
                my.sprite.enemies[i].laserSound.destroy();
            }
            this.pause = true; 
            //this.reset();
            if(this.score > this.SaveData.TopScore){
                this.SaveData.TopScore = this.score;
                this.saveFile(this.SaveData);
            }
            this.win.text = "You won with a score of " + this.score + " points,\nYour top score is " + this.SaveData.TopScore + "\n press enter to restart the game";
            this.win.visible = true;
            if(my.EnterKey.isDown){
                this.reset();
                this.scene.restart();
            }
        }
        if(this.Lives <= 0){
            for(let i = 0; i < my.sprite.missiles.length; i++){
                my.sprite.missiles[i].Thrust.destroy();
            }
            for(let i = 0; i < my.sprite.enemies.length; i++){
                my.sprite.enemies[i].laserSound.destroy();
            }
            this.pause = true; 
            //this.reset();
            if(this.score > this.SaveData.TopScore){
                this.SaveData.TopScore = this.score;
                this.saveFile(this.SaveData);
            }
            this.lose.text = "You lost with a score of " + this.score + " points,\nYour top score is " + this.SaveData.TopScore + "\n press enter to restart the game";
            this.lose.visible = true;
            if(my.EnterKey.isDown){
                this.reset();
                this.scene.restart();
            }
        }
        this.scoreText.text = "Current Score: " + this.score + "";
    }
}