// create a new scene called "Game"
let gameScene = new Phaser.Scene('Game');

gameScene.init = function(){
  this.sliderMinX = 320+64;
  this.sliderMaxX = 640-96;
  this.sliderMinX2 = 0+96;
  this.sliderMaxX2 = 320-64;
};

//load assets
gameScene.preload = function(){
  //progress display
  var progressBar = this.add.graphics();
  var progressBox = this.add.graphics();
  progressBox.fillStyle(0x222222, 0.8);
  progressBox.fillRect(240, 270, 320, 50);
  var width = this.cameras.main.width;
  var height = this.cameras.main.height;
  var loadingText = this.make.text({
    x: width/2,
    y: height / 2 - 50,
    text: 'loading...',
    style: {
      font: '20px monospace',
      fill: '#ffffff'
    }
  });
  loadingText.setOrigin(0.5, 0.5);
  var percentText = this.make.text({
    x: width / 2,
    y: height / 2 - 5,
    text: '0%',
    style: {
      font: '18px monospace',
      fill: '#ffffff'
    }
  });
  percentText.setOrigin(0.5, 0.5);
  var assetText = this.make.text({
    x: width / 2,
    y: height / 2 + 50,
    text: '',
    style: {
      font: '18px monospace',
      fill: '#ffffff'
    }
  });
  assetText.setOrigin(0.5, 0.5);
  //preload screen
  this.load.on('progress', function(value){
    console.log(value);
    percentText.setText(parseInt(value * 100) + '%');
    progressBar.clear();
    progressBar.fillStyle(0xffffff, 1);
    progressBar.fillRect(250, 280, 300 * value, 30);
  });
  this.load.on('fileprogress', function(file){
    console.log(file.src);
    assetText.setText('loading asset: ' + file.key);
  });
  this.load.on('complete', function(){
    progressBar.destroy();
    progressBox.destroy();
    loadingText.destroy();
    percentText.destroy();
    assetText.destroy();
  });
  //load images
  this.load.image('background', 'assets/grey2_block.png');
  this.load.image('ground', 'assets/platform.png');
  this.load.image('player', 'assets/blue_block.png');
  this.load.image('slider', 'assets/slider.png');
  this.load.image('door', 'assets/door.png');
  this.load.image('dangerZone', 'assets/dangerZone.png');
  this.load.image('button', 'assets/button.png');
  this.load.image('enemy', 'assets/red_block.png');
  this.load.image('mage', 'assets/white_block.png');
  this.load.image('goal', 'assets/exit.png');
  this.load.image('next_page', 'assets/next_page.png');
  this.load.image('bullet', 'assets/brown_block.png');
  this.load.audio('jump', ['assets/jump.mp3', 'assets/jump.ogg']);
  this.load.audio('right', ['assets/right.mp3', 'assets/right.ogg']);
  this.load.audio('wrong', ['assets/wrong.mp3', 'assets/wrong.ogg']);
  this.load.audio('die', ['assets/die.mp3', 'assets/die.ogg']);
  this.load.audio('start', ['assets/start.mp3', 'assets/start.ogg']);
  this.load.audio('shoot', ['assets/shoot.mp3', 'assets/shoot.ogg']);
  this.load.audio('hit', ['assets/hit.mp3', 'assets/hit.ogg']);
  cursors = this.input.keyboard.createCursorKeys();
};

var platforms;
var sliders;
var sliders2;
var player;
var doors;
var playerSpeed = 175;
var keySpace;
var aKey;
var dKey;
var jumpingSpeed = 220;
var enemies;
var lives = 3;
var score = 0;
var message = "";
var welcome = "welcome to BEAM tower.\nplease review the BEAM document below by clicking on\nit. it will prove helpful.\ngo down the tower. avoid enemies and electrified doors.\ntalk to the Mages and gather documents for your research\nuntil you get to the tower's basement.\nuse left key or 'a' to move left, right key or 'd'\nto move right, and the spacebar to jump.\npress the up key for maximum violence!";
var end = "the end.\ngame engine by Phaser v3.15\nsounds by:\n FartBiscuit1700\n TheDweebMan\n Bertrof\nart by Kenney.nl\nexcept for individual assets, this work\nis distributed under the MIT license.";
var playerStyle = {
  color: '#0000ff',
  backgroundColor: '#ffffff',
  padding: 2
};
var mageStyle = {
  color: '#ffffff',
  backgroundColor: '#000000',
  padding: 2
};
var doorClose = true;
var playerText;
var nextPage;
var goal;
var canWalk = true;
var jump;
var right;
var wrong;
var die;
var start;
var welcomeText;
var beamText;
var startText;
var dangerZones;
var bullets;
var bulletSpeed;
var bulletStats;
var lastFired = 0;
var shoot;
var hit;
var endText;

//executes once after assets loaded
gameScene.create = function(){
  //create bullet class
  var Bullet = new Phaser.Class({
    Extends: Phaser.GameObjects.Image,
    initialize:
    function Bullet(scene){
      Phaser.GameObjects.Image.call(this, scene, 0, 0, 'bullet');
      this.bulletSpeed = Phaser.Math.GetSpeed(400, 1);
    },
    fire: function(x, y){
      this.setPosition(x, y);
      this.setActive(true);
      this.setVisible(true);
    },
    update: function(time, delta){
      this.x += this.bulletSpeed * delta;
      if (this.x > 700){
        this.setActive(false);
        this.setVisible(false);
      }
    }
  });
  bullets = this.physics.add.group({
    classType: Bullet,
    maxSize: 10,
    runChildUpdate: true,
    allowGravity: false
  });
  //background
  let bg = this.add.sprite(0, 0, 'background').setScale(5, 18);
  //change origin to top left
  bg.setOrigin(0, 0);
  //assign sounds to variables
  jump = this.sound.add('jump', {loop: false});
  jump.setVolume(0.3);
  right = this.sound.add('right', {loop: false});
  right.setVolume(0.3);
  wrong = this.sound.add('wrong', {loop: false});
  wrong.setVolume(0.3);
  die = this.sound.add('die', {loop: false});
  die.setVolume(0.3);
  start = this.sound.add('start', {loop: false});
  start.setVolume(0.3);
  shoot = this.sound.add('shoot', {loop: false});
  shoot.setVolume(0.3);
  hit = this.sound.add('hit', {loop: false});
  hit.setVolume(0.3);
  //create platforms group
  platforms = this.physics.add.staticGroup();
  //displaying the ground and platforms
  platforms.create(160, 128, 'ground');
  platforms.create(480, 256, 'ground');
  platforms.create(128, 384, 'ground');
  platforms.create(512, 384, 'ground');
  platforms.create(160, 128+384, 'ground');
  platforms.create(480, 256+384, 'ground');
  platforms.create(128, 384+384, 'ground');
  platforms.create(512, 384+384, 'ground');
  platforms.create(160, 128+384+384, 'ground');
  platforms.create(480, 256+384+384, 'ground');
  platforms.create(128, 384+384+384, 'ground');
  platforms.create(512, 384+384+384, 'ground');
  platforms.create(160, 128+384+384+384, 'ground');
  platforms.create(480, 256+384+384+384, 'ground');
  platforms.create(128, 384+384+384+384, 'ground');
  platforms.create(512, 384+384+384+384, 'ground');
  platforms.create(160, 128+384+384+384+384, 'ground');
  platforms.create(480, 256+384+384+384+384, 'ground');
  platforms.create(128, 384+384+384+384+384, 'ground');
  platforms.create(512, 384+384+384+384+384, 'ground');
  platforms.create(512, 384+384+384+384+384, 'ground');
  platforms.create(160, 128+384+384+384+384+384, 'ground');
  platforms.create(480, 256+384+384+384+384+384, 'ground');
  platforms.create(160, 384+384+384+384+384+384, 'ground');
  platforms.create(480, 384+384+384+384+384+384, 'ground');
  
  //create danger zones group
  dangerZones = this.physics.add.staticGroup();
  
  //create dangerzones
  dangerZones.create(480-32, 128, 'dangerZone');
  dangerZones.create(160+32, 256, 'dangerZone');
  dangerZones.create(480-32, 128+384, 'dangerZone');
  dangerZones.create(160+32, 256+384, 'dangerZone');
  dangerZones.create(480-32, 128+384+384, 'dangerZone');
  dangerZones.create(160+32, 256+384+384, 'dangerZone');
  dangerZones.create(480-32, 128+384+384+384, 'dangerZone');
  dangerZones.create(160+32, 256+384+384+384, 'dangerZone');
  dangerZones.create(480-32, 128+384+384+384+384, 'dangerZone');
  dangerZones.create(160+32, 256+384+384+384+384, 'dangerZone');
  dangerZones.create(480-32, 128+384+384+384+384+384, 'dangerZone');
  dangerZones.create(160+32, 256+384+384+384+384+384, 'dangerZone');
  
  //place goal 100, 350+384+384+384+384+384,
  goal = this.physics.add.sprite(550, 350+384+384+384+384+384, 'goal');
  
  //create doors group
  doors = this.physics.add.staticGroup();
  
  //display doors
  doors.create(320, 382, 'door');
  doors.create(320, 766, 'door');
  doors.create(320, 1150, 'door');
  doors.create(320, 1534, 'door');
  doors.create(320, 1918, 'door');
  //displaying slider bars
  this.sliders = this.physics.add.group({
    key: 'slider',
    frameQuantity: 6,
    setXY: {
      x: 320,
      y: 125,
      stepY: 384,
    },
    allowGravity: false,
    immovable: true
  });
  
  
  
  this.sliders2 = this.physics.add.group({
    key: 'slider',
    frameQuantity: 6,
    setXY: {
      x: 320,
      y: 253,
      stepY: 384,
    },
    allowGravity: false,
    immovable: true
  });
  
  //set slider speeds
  Phaser.Actions.Call(this.sliders.getChildren(), function(slider){
    slider.speed = Math.random()*0.5+1;
  },this);
  
   //set slider2 speeds
  Phaser.Actions.Call(this.sliders2.getChildren(), function(slider){
    slider.speed = Math.random()*0.5+1;
  },this);
  
  //add mages
  mage1 = this.physics.add.sprite(550, 350, 'mage').setScale(0.25, 0.25);
  mage2 = this.physics.add.sprite(550, 350+384, 'mage').setScale(0.25, 0.25);
  mage3 = this.physics.add.sprite(550, 350+384+384, 'mage').setScale(0.25, 0.25);
  mage4 = this.physics.add.sprite(550, 350+384+384+384, 'mage').setScale(0.25, 0.25);
  mage5 = this.physics.add.sprite(550, 350+384+384+384+384, 'mage').setScale(0.25, 0.25);
  
  //add enemies
  enemies = this.physics.add.group({
    key: 'enemy',
    frameQuantity: 18,
    setXY: {
      x: 320,
      y: 98,
      stepY: 128,
    },
    allowGravity: false,
    immovable: true,
  });
  //set enemies' speed and scale
  Phaser.Actions.ScaleXY(enemies.getChildren(), -0.8, -0.8);
  Phaser.Actions.Call(enemies.getChildren(), function(enemy){
    enemy.speed = Math.random()*0.25+1;
  },this);
  //display player
  player = this.physics.add.sprite(20, 10, 'player').setScale(0.2, 0.2).setDepth(1);
  //player.setGravityY(600);
  player.setBounce(0.2);
  //player mass
  player.setMass(0);
  //prevent player from running offscreen
  player.setCollideWorldBounds(true);
  //set the world boundaries
  this.physics.world.bounds.width = 640;
  this.physics.world.bounds.height = 2304;
  //add collider to player and platforms
  this.physics.add.collider(player, platforms);
  this.physics.add.collider(player, this.sliders);
  this.physics.add.collider(player, this.sliders2);
  this.physics.add.collider(mage1, platforms);
  this.physics.add.collider(mage2, platforms);
  this.physics.add.collider(mage3, platforms);
  this.physics.add.collider(mage4, platforms);
  this.physics.add.collider(mage5, platforms);
  this.physics.add.collider(goal, platforms);
  this.physics.add.collider(player, enemies, gameOver, null, this);
  this.physics.add.collider(player, dangerZones, gameOver, null, this);
  this.physics.add.overlap(bullets, enemies, dieEnemy, null, this);
  this.physics.add.collider(player, doors, goThrough, null, this);
  this.physics.add.overlap(player, mage1, dialogBox11, null, this);
  this.physics.add.overlap(player, mage2, dialogBox21, null, this);
  this.physics.add.overlap(player, mage3, dialogBox31, null, this);
  this.physics.add.overlap(player, mage4, dialogBox41, null, this);
  this.physics.add.overlap(player, mage5, dialogBox51, null, this);
  this.physics.add.overlap(player, goal, theEnd, null, this);
  //set cameras
  this.cameras.main.setBounds(0, 0, 640, 2304);
  //make camera follow player
  this.cameras.main.startFollow(player);
  this.cameras.main.setBackgroundColor('#008081');
  player.customParams = {};
  //input display buttons
  let upButton = this.add.image(600, 100, 'button').setAlpha(0);
  upButton.setInteractive();
  upButton.setScrollFactor(0);
  upButton.on('pointerdown', jumpButton);
  upButton.on('pointerup', noJumpButton);
  
  let leftButton = this.add.image(40, 200, 'button').setAlpha(0).setAngle(-90);
  leftButton.setInteractive();
  leftButton.setScrollFactor(0);
  leftButton.on('pointerdown', walkLeftButton);
  leftButton.on('pointerup', stopLeftButton);
  
  let rightButton = this.add.image(600, 200, 'button').setAlpha(0).setAngle(90);
  rightButton.setInteractive();
  rightButton.setScrollFactor(0);
  rightButton.on('pointerdown', walkRightButton);
  rightButton.on('pointerup', stopRightButton);
  
  //display lives
  livesText = this.add.text(560, 30, lives, {fontSize: '32pt', fill: '#000'});
  livesText.setScrollFactor(0);
  //display score
  scoreText = this.add.text(30, 320, score, {fontSize: '32pt', fill: '#000'});
  scoreText.setScrollFactor(0);
  messageText = this.add.text(400, 150, message, mageStyle);
  messageText.setScrollFactor(0);
  keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  //set player alive
  //start game
  this.isPlayerAlive = false;
  welcomeText = this.add.text(50, 50, welcome, mageStyle);
  beamText = this.add.text(100, 300, "read BEAM", mageStyle).setInteractive();
  beamText.on('pointerdown', function(){
    window.open("https://library.hunter.cuny.edu/research-toolkit/how-do-i-use-sources/beam-method");
  });
  startText = this.add.text(100, 325, "i'm ready!", mageStyle).setInteractive();
  startText.on('pointerdown', function(){
    this.isPlayerAlive = true;
    start.play();
    welcomeText.destroy();
    beamText.destroy();
    startText.destroy();
  });
};

gameScene.update = function(time, delta){
  //check for alive player
  
  //player movement
  if((cursors.left.isDown || player.customParams.walkLeft || aKey.isDown) && canWalk){
    player.setVelocityX(-playerSpeed);
  }
  else if((cursors.right.isDown || player.customParams.walkRight || dKey.isDown) && canWalk){
    player.setVelocityX(playerSpeed);
  }
  else{
    player.setVelocityX(0);
  }
  if(((keySpace.isDown || player.customParams.jumpUp) && player.body.touching.down) && canWalk){
    player.setVelocityY(-jumpingSpeed);
    player.customParams.jumpUp = false;
    jump.play();
  }
  //bullets fired
  if (cursors.up.isDown && time > lastFired){
    var bullet = bullets.get();
    if (bullet){
      bullet.fire(player.x, player.y);
      lastFired = time + 50;
      shoot.play();
    }
  }

    //slider movement
    let movingSliders = this.sliders.getChildren();
    let numSliders = movingSliders.length;
    
    for (let i = 0; i<numSliders; i++){
      //move sliders
      movingSliders[i].x += movingSliders[i].speed;
      
      //reverse movement if edge reached
      if(movingSliders[i].x >= this.sliderMaxX && movingSliders[i].speed > 0){
        movingSliders[i].speed *=-1;
      } else if(movingSliders[i].x <= this.sliderMinX && movingSliders[i].speed < 0){
        movingSliders[i].speed *=-1;
      }
    }
    
    //slider2 movement
    let movingSliders2 = this.sliders2.getChildren();
    let numSliders2 = movingSliders2.length;
    
    for (let i = 0; i<numSliders2; i++){
      //move sliders
      movingSliders2[i].x += movingSliders2[i].speed;
      
      //reverse movement if edge reached
      if(movingSliders2[i].x >= this.sliderMaxX2 && movingSliders2[i].speed > 0){
        movingSliders2[i].speed *=-1;
      } else if(movingSliders2[i].x <= this.sliderMinX2 && movingSliders2[i].speed < 0){
        movingSliders2[i].speed *=-1;
      }
    }
    
    //enemy movement
    let movingEnemies = enemies.getChildren();
    let numEnemies = movingEnemies.length;
    
    for (let i = 0; i<numEnemies; i++){
      //move sliders
      movingEnemies[i].x += movingEnemies[i].speed;
      
      //reverse movement if edge reached
      if(movingEnemies[i].x >= 450 && movingEnemies[i].speed > 0){
        movingEnemies[i].speed *=-1;
      } else if(movingEnemies[i].x <= 80 && movingEnemies[i].speed < 0){
        movingEnemies[i].speed *=-1;
      }
    }
};

function walkLeftButton(){
  player.customParams.walkLeft = true;
}

function stopLeftButton(){
  player.customParams.walkLeft = false;
}

function walkRightButton(){
  player.customParams.walkRight = true;
}

function stopRightButton(){
  player.customParams.walkRight = false;
}

function jumpButton(){
  player.customParams.jumpUp = true;
}

function noJumpButton(){
  player.customParams.jumpUp = false;
}

function gameOver(){
  this.tweens.add({
    targets: player,
    duration: 1000,
    scaleX: .1,
    scaleY: .1,
    x: 20,
    y: 10,
    yoyo: true,
  });
  //die sound
  die.play();
  //substract a life
  lives -= 1;
  console.log(lives);
  //display lives
  livesText.setText(lives);
  //bring player to starting position
  player.setPosition(20, 10);
  //erase leftover text
}

function dieEnemy(player, enemy){
  console.log("enemy dead");
  enemy.disableBody(true, true);
  hit.play();
}

function dialogBox11(){
  canWalk = false;
  mage1.disableBody(true, false);
  this.playerText = this.add.text(400, 150, "hello mr. mage.", playerStyle);
  this.playerText.setScrollFactor(0);
  this.nextPage = this.add.text(400, 175, ">", mageStyle).setInteractive();
  this.nextPage.setScrollFactor(0);
  this.nextPage.on('pointerdown', dialogBox12, this);
}

function dialogBox12(){
  this.nextPage.destroy();
  this.playerText.destroy();
  console.log("clicked");
  this.playerText = this.add.text(400, 150, "what do you want?", mageStyle);
  this.playerText.setScrollFactor(0);
  this.nextPage = this.add.text(400, 175, ">", playerStyle).setInteractive();
  this.nextPage.setScrollFactor(0);
  this.nextPage.on('pointerdown', dialogBox13, this);
}

function dialogBox13(){
  this.nextPage.destroy();
  this.playerText.destroy();
  console.log("clicked");
  this.playerText = this.add.text(400, 150, "define pedagogy", playerStyle);
  this.playerText.setScrollFactor(0);
  this.nextPage = this.add.text(400, 175, ">", mageStyle).setInteractive();
  this.nextPage.setScrollFactor(0);
  this.nextPage.on('pointerdown', dialogBox14, this);
}

function dialogBox14(){
  this.nextPage.destroy();
  this.playerText.destroy();
  console.log("clicked");
  this.playerText = this.add.text(400, 150, "pick one:", mageStyle);
  this.playerText.setScrollFactor(0);
  var item1 = this.add.text(300, 150, "show doc", mageStyle).setInteractive();
  item1.setScrollFactor(0);
  var item2 = this.add.text(300, 175, "show doc", mageStyle).setInteractive();
  item2.setScrollFactor(0);
  var pick1 = this.add.text(450, 150, "pick", playerStyle).setInteractive();
  pick1.setScrollFactor(0);
  var pick2 = this.add.text(450, 175, "pick", playerStyle).setInteractive();
  pick2.setScrollFactor(0);
  item1.on('pointerdown', function(){
    window.open("http://www.oed.com/view/Entry/139520?redirectedFrom=pedagogy#eid");
  });
  item2.on('pointerdown', function(){
    window.open("http://infed.org/mobi/what-is-pedagogy/");
  });
  pick1.on('pointerdown', function(){
    right.play();
    score += 100;
    message = "door is unlocked.";
    scoreText.setText(score);
    messageText.setText(message);
    item1.destroy();
    item2.destroy();
    pick1.destroy();
    pick2.destroy();
    canWalk = true;
  });
  pick2.on('pointerdown', function(){
    wrong.play();
    score += 50;
    message = "door is unlocked.";
    scoreText.setText(score);
    messageText.setText(message);
    item1.destroy();
    item2.destroy();
    pick1.destroy();
    pick2.destroy();
    canWalk = true;
  });
  doorClose = false;
  this.playerText.destroy();
}

function dialogBox21(){
  canWalk = false;
  this.playerText.destroy();
  mage2.disableBody(true, false);
  this.playerText = this.add.text(400, 150, "hello mr. mage.", playerStyle);
  this.playerText.setScrollFactor(0);
  this.nextPage = this.add.text(400, 175, ">", mageStyle).setInteractive();
  this.nextPage.setScrollFactor(0);
  this.nextPage.on('pointerdown', dialogBox22, this);
}

function dialogBox22(){
  this.nextPage.destroy();
  this.playerText.destroy();
  console.log("clicked");
  this.playerText = this.add.text(400, 150, "what do you want?", mageStyle);
  this.playerText.setScrollFactor(0);
  this.nextPage = this.add.text(400, 175, ">", playerStyle).setInteractive();
  this.nextPage.setScrollFactor(0);
  this.nextPage.on('pointerdown', dialogBox23, this);
}

function dialogBox23(){
  this.nextPage.destroy();
  this.playerText.destroy();
  console.log("clicked");
  this.playerText = this.add.text(400, 150, "show the dust bowl.", playerStyle);
  this.playerText.setScrollFactor(0);
  this.nextPage = this.add.text(400, 175, ">", mageStyle).setInteractive();
  this.nextPage.setScrollFactor(0);
  this.nextPage.on('pointerdown', dialogBox24, this);
}

function dialogBox24(){
  this.nextPage.destroy();
  this.playerText.destroy();
  console.log("clicked");
  this.playerText = this.add.text(400, 200, "pick one:", mageStyle);
  this.playerText.setScrollFactor(0);
  var item1 = this.add.text(300, 150, "show doc", mageStyle).setInteractive();
  item1.setScrollFactor(0);
  var item2 = this.add.text(300, 175, "show doc", mageStyle).setInteractive();
  item2.setScrollFactor(0);
  var pick1 = this.add.text(450, 150, "pick", playerStyle).setInteractive();
  pick1.setScrollFactor(0);
  var pick2 = this.add.text(450, 175, "pick", playerStyle).setInteractive();
  pick2.setScrollFactor(0);
  item1.on('pointerdown', function(){
    window.open("https://www.britannica.com/place/Dust-Bowl");
  });
  item2.on('pointerdown', function(){
    window.open("http://loc.gov/pictures/resource/fsa.8b38293/");
  });
  pick1.on('pointerdown', function(){
    wrong.play();
    score += 50;
    message = "door is unlocked.";
    scoreText.setText(score);
    messageText.setText(message);
    item1.destroy();
    item2.destroy();
    pick1.destroy();
    pick2.destroy();
    canWalk = true;
  });
  pick2.on('pointerdown', function(){
    right.play();
    score += 100;
    message = "door is unlocked.";
    scoreText.setText(score);
    messageText.setText(message);
    item1.destroy();
    item2.destroy();
    pick1.destroy();
    pick2.destroy();
    canWalk = true;
  });
  doorClose = false;
  this.playerText.destroy();

}

function dialogBox31(){
  canWalk = false;
  this.playerText.destroy();
  mage3.disableBody(true, false);
  this.playerText = this.add.text(400, 150, "hello mr. mage.", playerStyle);
  this.playerText.setScrollFactor(0);
  this.nextPage = this.add.text(400, 175, ">", mageStyle).setInteractive();
  this.nextPage.setScrollFactor(0);
  this.nextPage.on('pointerdown', dialogBox32, this);
}

function dialogBox32(){
  this.nextPage.destroy();
  this.playerText.destroy();
  console.log("clicked");
  this.playerText = this.add.text(400, 150, "what do you want?", mageStyle);
  this.playerText.setScrollFactor(0);
  this.nextPage = this.add.text(400, 175, ">", playerStyle).setInteractive();
  this.nextPage.setScrollFactor(0);
  this.nextPage.on('pointerdown', dialogBox33, this);
}

function dialogBox33(){
  this.nextPage.destroy();
  this.playerText.destroy();
  console.log("clicked");
  this.playerText = this.add.text(300, 150, "Thomas Jefferson on civil rights.", playerStyle);
  this.playerText.setScrollFactor(0);
  this.nextPage = this.add.text(400, 175, ">", mageStyle).setInteractive();
  this.nextPage.setScrollFactor(0);
  this.nextPage.on('pointerdown', dialogBox34, this);
}

function dialogBox34(){
  this.nextPage.destroy();
  this.playerText.destroy();
  console.log("clicked");
  this.playerText = this.add.text(400, 200, "pick one:", mageStyle);
  this.playerText.setScrollFactor(0);
  var item1 = this.add.text(300, 150, "show doc", mageStyle).setInteractive();
  item1.setScrollFactor(0);
  var item2 = this.add.text(300, 175, "show doc", mageStyle).setInteractive();
  item2.setScrollFactor(0);
  var pick1 = this.add.text(450, 150, "pick", playerStyle).setInteractive();
  pick1.setScrollFactor(0);
  var pick2 = this.add.text(450, 175, "pick", playerStyle).setInteractive();
  pick2.setScrollFactor(0);
  item1.on('pointerdown', function(){
    window.open("https://www.loc.gov/item/pin0405/");
  });
  item2.on('pointerdown', function(){
    window.open("http://www.answers.com/Q/What_did_Thomas_Jefferson_have_to_do_with_the_Civil_rights_movement");
  });
  pick1.on('pointerdown', function(){
    right.play();
    score += 100;
    message = "door is unlocked.";
    scoreText.setText(score);
    messageText.setText(message);
    item1.destroy();
    item2.destroy();
    pick1.destroy();
    pick2.destroy();
    canWalk = true;
  });
  pick2.on('pointerdown', function(){
    wrong.play();
    score += 50;
    message = "door is unlocked.";
    scoreText.setText(score);
    messageText.setText(message);
    item1.destroy();
    item2.destroy();
    pick1.destroy();
    pick2.destroy();
    canWalk = true;
  });
  doorClose = false;
  this.playerText.destroy();
}

function dialogBox41(){
  canWalk = false;
  this.playerText.destroy();
  mage4.disableBody(true, false);
  this.playerText = this.add.text(400, 150, "hello mr. mage.", playerStyle);
  this.playerText.setScrollFactor(0);
  this.nextPage = this.add.text(400, 175, ">", mageStyle).setInteractive();
  this.nextPage.setScrollFactor(0);
  this.nextPage.on('pointerdown', dialogBox42, this);
}

function dialogBox42(){
  this.nextPage.destroy();
  this.playerText.destroy();
  console.log("clicked");
  this.playerText = this.add.text(400, 150, "what do you want?", mageStyle);
  this.playerText.setScrollFactor(0);
  this.nextPage = this.add.text(400, 175, ">", playerStyle).setInteractive();
  this.nextPage.setScrollFactor(0);
  this.nextPage.on('pointerdown', dialogBox43, this);
}

function dialogBox43(){
  this.nextPage.destroy();
  this.playerText.destroy();
  console.log("clicked");
  this.playerText = this.add.text(350, 150, "follow Michelson-Morley.", playerStyle);
  this.playerText.setScrollFactor(0);
  this.nextPage = this.add.text(400, 175, ">", mageStyle).setInteractive();
  this.nextPage.setScrollFactor(0);
  this.nextPage.on('pointerdown', dialogBox44, this);
}

function dialogBox44(){
  this.nextPage.destroy();
  this.playerText.destroy();
  console.log("clicked");
  this.playerText = this.add.text(400, 200, "pick one:", mageStyle);
  this.playerText.setScrollFactor(0);
  var item1 = this.add.text(300, 150, "show doc", mageStyle).setInteractive();
  item1.setScrollFactor(0);
  var item2 = this.add.text(300, 175, "show doc", mageStyle).setInteractive();
  item2.setScrollFactor(0);
  var pick1 = this.add.text(450, 150, "pick", playerStyle).setInteractive();
  pick1.setScrollFactor(0);
  var pick2 = this.add.text(450, 175, "pick", playerStyle).setInteractive();
  pick2.setScrollFactor(0);
  item1.on('pointerdown', function(){
    window.open("https://history.aip.org/history/exhibits/gap/PDF/michelson.pdf");
  });
  item2.on('pointerdown', function(){
    window.open("https://www.thoughtco.com/the-michelson-morley-experiment-2699379");
  });
  pick1.on('pointerdown', function(){
    right.play();
    score += 100;
    message = "door is unlocked.";
    scoreText.setText(score);
    messageText.setText(message);
    item1.destroy();
    item2.destroy();
    pick1.destroy();
    pick2.destroy();
    canWalk = true;
  });
  pick2.on('pointerdown', function(){
    wrong.play();
    score += 50;
    message = "door is unlocked.";
    scoreText.setText(score);
    messageText.setText(message);
    item1.destroy();
    item2.destroy();
    pick1.destroy();
    pick2.destroy();
    canWalk = true;
  });
  doorClose = false;
  this.playerText.destroy();
}

function dialogBox51(){
  canWalk = false;
  this.playerText.destroy();
  mage5.disableBody(true, false);
  this.playerText = this.add.text(400, 150, "hello mr. mage.", playerStyle);
  this.playerText.setScrollFactor(0);
  this.nextPage = this.add.text(400, 175, ">", mageStyle).setInteractive();
  this.nextPage.setScrollFactor(0);
  this.nextPage.on('pointerdown', dialogBox52, this);
}

function dialogBox52(){
  this.nextPage.destroy();
  this.playerText.destroy();
  console.log("clicked");
  this.playerText = this.add.text(400, 150, "what do you want?", mageStyle);
  this.playerText.setScrollFactor(0);
  this.nextPage = this.add.text(400, 175, ">", playerStyle).setInteractive();
  this.nextPage.setScrollFactor(0);
  this.nextPage.on('pointerdown', dialogBox53, this);
}

function dialogBox53(){
  this.nextPage.destroy();
  this.playerText.destroy();
  console.log("clicked");
  this.playerText = this.add.text(400, 150, "what should I use?", playerStyle);
  this.playerText.setScrollFactor(0);
  this.nextPage = this.add.text(400, 175, ">", mageStyle).setInteractive();
  this.nextPage.setScrollFactor(0);
  this.nextPage.on('pointerdown', dialogBox54, this);
}

function dialogBox54(){
  this.nextPage.destroy();
  this.playerText.destroy();
  console.log("clicked");
  this.playerText = this.add.text(400, 200, "pick one:", mageStyle);
  this.playerText.setScrollFactor(0);
  var item1 = this.add.text(100, 150, "only books and db articles.", mageStyle);
  item1.setScrollFactor(0);
  var item2 = this.add.text(100, 175, "it depends on the need.", mageStyle);
  item2.setScrollFactor(0);
  var pick1 = this.add.text(450, 150, "pick", playerStyle).setInteractive();
  pick1.setScrollFactor(0);
  var pick2 = this.add.text(450, 175, "pick", playerStyle).setInteractive();
  pick2.setScrollFactor(0);
  pick1.on('pointerdown', function(){
    wrong.play();
    score += 50;
    message = "door is unlocked.";
    scoreText.setText(score);
    messageText.setText(message);
    item1.destroy();
    item2.destroy();
    pick1.destroy();
    pick2.destroy();
    canWalk = true;
  });
  pick2.on('pointerdown', function(){
    right.play();
    score += 100;
    message = "door is unlocked.";
    scoreText.setText(score);
    messageText.setText(message);
    item1.destroy();
    item2.destroy();
    pick1.destroy();
    pick2.destroy();
    canWalk = true;
  });
  doorClose = false;
  this.playerText.destroy();
}

function goThrough(player, doors){
  if(!doorClose){
    doors.disableBody(true, true);
    doorClose = true;
    this.playerText.destroy();
    messageText.setText('');
  }
  else{
    this.tweens.add({
    targets: player,
    duration: 1000,
    scaleX: .1,
    scaleY: .1,
    yoyo: true,
  });
    //substract a life
    die.play();
    lives -= 1;
    console.log(lives);
    //display lives
    livesText.setText(lives);
    //restart game
    player.setPosition(20, 10);
  }
  scoreText.setText(score);
}

function theEnd(){
  goal.disableBody(true, true);
  //end message
  console.log("the end");
  //end game
  endText = this.add.text(50, 50, end, mageStyle);
  endText.setScrollFactor(0);
  canWalk = false;
}

//game configuration
let config = {
  type: Phaser.AUTO,//phaser decides how to render game
  width: 640,
  height: 384,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {y: 400},
      debug: false,
    }
  },
  scene: gameScene//newly created scene
};

let game = new Phaser.Game(config);

/*MIT License

Copyright (c) [2019] [Sergio Lopez]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.*/