const coinSound = document.getElementById('coin')
const deadSound = document.getElementById('dead')

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: "arcade",
        arcade: {
            gravity: {y: 300},
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let score = 0
let scoreText
let gameOver = false

let game = new Phaser.Game(config);

function preload ()
{
    this.load.image('sky', "../assets/sky.png")
    this.load.image('ground', "../assets/platform.png")
    this.load.image("star", "../assets/star.png")
    this.load.image("bomb", "../assets/bomb.png")
    this.load.spritesheet("dude", "../assets/dude.png", {frameWidth: 32, frameHeight: 48})
}

function create ()
{
    this.add.image(400, 300, 'sky')
   // this.add.image(400, 300, 'star')

    platform = this.physics.add.staticGroup()
    platform.create(400, 568, "ground").setScale(2).refreshBody()
    platform.create(600, 400, "ground")
    platform.create(50, 250, "ground")
    platform.create(750, 220, "ground")

    player = this.physics.add.sprite(100, 450, "dude")
    player.setCollideWorldBounds(true)
    player.setBounce(0.2)

    this.anims.create({
        key: "left",
        frames: this.anims.generateFrameNumbers("dude", {start: 0, end: 3}),
        frameRate: 8,
        repeat: -1
    })

    this.anims.create({
        key: "turn",
        frames: [{key: "dude", frame: 4}],
        frameRate: 8,
        repeat: -1
    })

    this.anims.create({
        key: "right",
        frames: this.anims.generateFrameNumbers("dude", {start: 5, end: 8}),
        frameRate: 8,
        repeat: -1
    })


    this.physics.add.collider(player, platform)

    cursors = this.input.keyboard.createCursorKeys();

    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: {x: 12, y: 0, stepX: 70}
    })

    stars.children.iterate(function(child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8))
    })

    this.physics.add.collider(stars, platform)
    this.physics.add.overlap(player, stars, collectStars, null, true)

    scoreText = this.add.text(16, 16, 'Score: 0', {fontSize: '32px', fill: '#000'})

    bombs = this.physics.add.group()
    this.physics.add.collider(bombs, platform)
    this.physics.add.collider(player, bombs, hitBomb, null, this)
}

function update ()
{
    if(gameOver) {
        return
    }

    if(cursors.left.isDown) {
        player.setVelocityX(-160)
        player.anims.play("left", true)
    } else if(cursors.right.isDown) {
        player.setVelocityX(160)
        player.anims.play("right", true)
    } else {
        player.setVelocityX(0)
        player.anims.play("turn", true)
    }

    if(cursors.space.isDown && player.body.touching.down) {
        player.setVelocityY(-330)
    }
}

function collectStars(player, star) {
    star.disableBody(true, true)
    score += 10
    scoreText.setText(`Score: ${score}`)

    playCoinSound()

    if(stars.countActive(true) === 0) {
        stars.children.iterate(function(child) {
            child.enableBody(true, child.x, 0, true, true)
        })

        let x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400)

        let bomb = bombs.create(x, 16,'bomb')
        bomb.setBounce(1)
        bomb.setCollideWorldBounds(true)
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20)
    }

}

function hitBomb(player, bomb) {
    this.physics.pause()
    player.setTint(0xff0000)
    player.anims.play('turn')
    playDeadSound()
    gameOver = true
}

function playCoinSound() {
    coinSound.play()
}

function playDeadSound() {
    deadSound.play()
}