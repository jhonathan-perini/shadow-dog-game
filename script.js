const canvas = document.getElementById("canvas")
const ctx = canvas.getContext('2d')

let player;
let gravity;
let keys = {}
let gameOver = document.getElementById('game-over')
let tryAgain = document.getElementById('try-again')
let startScreen = document.getElementById('start')
let score;
let scoreText;
let highscore;
let highscoreText;
const playerImage = new Image()
const enemyImage = new Image()
const frameWidth = 575
const frameHeight= 523
const frameWidthEnemy = 60
const frameHeightEnemy= 40
let playerState = 'run'
let gameFrame = 0
let velocity = 3
let animations = []
let speed;
let enemys = []

tryAgain.addEventListener('click', (e) => {
    startGame()
})

document.addEventListener('keydown', (e) => {
    keys[e.code] = true
})

document.addEventListener('keyup', (e) => {
    keys[e.code] = false
})

playerImage.src = 'shadow_dog.png'
enemyImage.src = 'enemy_fly.png'

let states = [
    {
        name: 'idle',
        frames: 7
    },
    {
        name: 'jump',
        frames: 7
    },
    {
        name: 'fall',
        frames: 7
    },
    {
        name: 'run',
        frames: 9
    },
    {
        name: 'notUsed',
        frames: 9
    },
    {
        name: 'notused2',
        frames: 9
    },
    {
        name: 'test',
        frames: 7
    },
    {
        name: 'test2',
        frames: 7
    },
    {
        name: 'death',
        frames: 12
    }
]

states.forEach((state, index) => {
    let frames = {
        loc: []
    }
    for(let j=0; j< state.frames; j++){
        let positionX = j * frameWidth
        let positionY = index * frameHeight
        frames.loc.push({x: positionX, y: positionY})
    }
    animations[state.name] = frames
})

class Text {
    constructor (t, xAxis, yAxis, align, color, size) {
        this.t = t;
        this.xAxis = xAxis;
        this.yAxis = yAxis;
        this.align = align;
        this.color = color;
        this.size = size;
    }

    Draw () {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.font = this.size + "px sans-serif";
        ctx.textAlign = this.align;
        ctx.fillText(this.t, this.xAxis, this.yAxis);
        ctx.closePath();
    }
}

class Player {
    constructor(xAxis, yAxis, width, height, color) {
        this.xAxis = xAxis
        this.yAxis = yAxis
        this.width = width
        this.height = height
        this.color = color

        this.dy = 0
        this.grounded = false
        this.jumpTimer = 0
        this.jumpForce = 15
    }

    draw(){
    ctx.beginPath()
        ctx.fillStyle = this.color
        // ctx.fillRect(this.xAxis, this.yAxis - 30, this.width, this.height)
        let position = Math.floor(gameFrame/velocity) % animations[playerState].loc.length
        let frameX = frameWidth * position
        let frameY = animations[playerState].loc[position].y
        ctx.drawImage(playerImage, frameX , frameY , frameWidth, frameHeight, this.xAxis, this.yAxis - 30, this.width, this.height )
        gameFrame++;
        ctx.closePath()
    }

    animate(){
        if(keys['Space']){
            this.jump()
        } else {
            this.jumpTimer = 0
        }

        this.yAxis += this.dy
        if(this.yAxis + this.height < canvas.height){
            this.dy += gravity;
            this.grounded = false;
        } else {
            this.dy = 0
            this.grounded = true;
            this.yAxis = canvas.height - this.height
        }

        this.draw()
    }

    jump(){
        if(this.grounded && this.jumpTimer === 0){

            this.jumpTimer = 1
            this.dy = -this.jumpForce
        } else if (this.jumpTimer > 0 && this.jumpTimer < 15){
            this.jumpTimer++
            this.dy = -this.jumpForce - (this.jumpTimer / 50)
        }
    }
}

let step = 0.003
let FrameXEnemy = 0

class Enemy {
    constructor(xAxis, yAxis, width, height, color) {
        this.xAxis = xAxis
        this.yAxis = yAxis
        this.width = width
        this.height = height
        this.color = color
        this.dx = -speed
    }

    update(){
        this.xAxis += this.dx
        this.draw()
        this.dx = -speed
    }

    draw(){
        ctx.beginPath();
        ctx.drawImage(enemyImage, FrameXEnemy * frameWidthEnemy, 0, frameWidthEnemy, frameHeightEnemy, this.xAxis, this.yAxis - 20, this.width, this.height)
        if(gameFrame % 4 === 0){
            if(FrameXEnemy < 5) FrameXEnemy++
            else FrameXEnemy = 0
        }

        ctx.closePath();
    }
}

function spawn(){
    let size = 60
    let object = new Enemy(canvas.width + size, canvas.height - size - 15, size, 40, 'red')
    enemys.push(object)
}

class Background {
    constructor(){
        this.image = document.getElementById('background')
        this.x = 0
        this.y = 0
        this.width = 840
        this.height = 500
        this.speed = 5
    }

    draw(ctx){
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height)
        ctx.drawImage(this.image, this.x + this.width -1, this.y, this.width, this.height)
    }

    update(){
        this.speed += step/2
        this.x -= this.speed
        if(this.x < 0 - this.width) this.x = 0

    }
}
let background

function startGame(){
    canvas.width = 800
    canvas.height = 500
    ctx.font = '20px sans-serif'
    gravity = 1
    speed = 3
    step = 0.003
    score = 0;
    highscore = 0;
    playerState= 'run'
    gameOver.style.display = 'none'
    startScreen.style.display = 'block'
    setTimeout(()=> {
        startScreen.style.display = 'none'
    }, 2500)
    if (localStorage.getItem('highscore')) {
        highscore = localStorage.getItem('highscore');
    }
    background = new Background()
    player = new Player(25, 50, frameWidth/5, frameHeight/5, 'black')

    scoreText = new Text("Score: " + score, 25, 25, "left", "#212121", "20");
    highscoreText = new Text("Highscore: " + highscore, canvas.width - 25, 25, "right", "#212121", "20");
    requestAnimationFrame(updateFrame)

}

let initialTimer = 200
let spawnTimer = initialTimer

function updateFrame(){
   if(step !== 0) requestAnimationFrame(updateFrame)

    ctx.clearRect(0,0, canvas.width, canvas.height)
    spawnTimer--;
speed +=step

    if(step !== 0) score++;
    scoreText.t = "Score: " + score;

    if (score > highscore) {
        highscore = score;
        highscoreText.t = "Highscore: " + highscore;
    }
    background.draw(ctx)
    background.update()
    player.animate()
    if(spawnTimer <= 0){
        spawn()
        spawnTimer = initialTimer - speed * 8

        if(spawnTimer < 60){
            spawnTimer = 60
        }
    }

    for(let i=0; i < enemys.length; i++){
        let o = enemys[i]

        if(o.xAxis + o.width < 0){
            enemys.splice(i, 1)
        }

        if(player.xAxis < o.xAxis + o.width &&
            player.xAxis + player.width > o.xAxis+20 &&
            player.yAxis < o.yAxis + o.height &&
            player.yAxis + player.height > o.yAxis +50
        ){
            enemys = []
            spawnTimer = initialTimer
            speed = 0
            step = 0
            playerState = 'death'
            score = 0;
            window.localStorage.setItem('highscore', highscore);

            gameOver.style.display = 'block'
        }
        o.update()
    }
    highscoreText.Draw();
    scoreText.Draw();
}

startGame()