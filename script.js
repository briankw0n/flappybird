function isMobileDevice() {
  return /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

if (isMobileDevice()) {
  boardWidth = window.innerWidth;
  boardHeight = window.innerHeight;
}

// bird
let birdWidth = 34; // width/height ratio = 408/228 = 17/12
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;

let bird = {
  x: birdX,
  y: birdY,
  width: birdWidth,
  height: birdHeight
}

// pipes
let pipeArray = [];
let pipeWidth = 64; // width/height ratio =  384/3072 = 1/8
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

// physics
let velocityX = -2; // pipes moving left speed
let velocityY = 0; // bird jump speed
let gravity = 0.4;

if (isMobileDevice()) {
  velocityX = -6;
  gravity = 1.0;
}

let gameOver = false;
let score = 0;
var highscore = 0;

window.onload = function() {
  board = document.getElementById("board");
  board.height = boardHeight;
  board.width = boardWidth;
  context = board.getContext("2d"); // used for drawing on the board

  // draw bird
  // context.fillStyle = "green";
  // context.fillRect(bird.x, bird.y, birdWidth, birdHeight);

  // load images
  birdImg = new Image();
  birdImg.src = "flappybird.png";
  birdImg.onload = function() {
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
  }

  topPipeImg = new Image();
  topPipeImg.src = "toppipe.png";

  bottomPipeImg = new Image();
  bottomPipeImg.src = "bottompipe.png";

  requestAnimationFrame(update);
  // setInterval(placePipes, 1500); // every 1.5 seconds
  
  if (isMobileDevice()) {
    setInterval(placePipes, 2000); // every 1 second
  } else {
    setInterval(placePipes, 1500); // every 1.5 seconds
  }

  document.addEventListener("keydown", moveBird);
  document.addEventListener("touchstart", moveBird);
}

function update() {
  requestAnimationFrame(update);
  if (gameOver) {
    return;
  }
  context.clearRect(0, 0, board.width, board.height);

  // bird
  velocityY += gravity;
  // bird.y += velocityY;
  bird.y = Math.max(bird.y + velocityY, 0); // apply gravity to current bird.y, limit the bird.y to top of the canvas
  context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
  
  if (bird.y > board.height) {
    gameOver = true;
  }

  // pipes
  for (let i = 0; i < pipeArray.length; i++) {
    let pipe = pipeArray[i];
    pipe.x += velocityX;
    context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height,);
  
    if (!pipe.passed && bird.x > pipe.x + pipe.width) {
      score += 0.5; // 0.5 because there are 2 pipes, so 0.5 * 2 = 1, 1 for each set of pipes
      pipe.passed = true;
    }

    if (detectCollision(bird, pipe)) {
      gameOver = true;
    }
  }

  // clear pipes
  while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
    pipeArray.shift(); // removes first element from array
  }

  // score
  context.fillStyle = "white";
  context.font = "30px 'Press Start 2P', cursive";
  // context.fillText(score, 170, 150);

  if (score > 9) {
    let scoreOffset = Math.floor(Math.log10(Math.abs(score)));
    console.log("test: ", scoreOffset);
    let scorePosition = 170 + (-20  * (scoreOffset));
    context.fillText(score, scorePosition, 150);
  } else {
    context.fillText(score, 170, 150);
  }
  
  if (gameOver) {
    if (score > highscore) {
      highscore = score;
    }
    // context.fillText("GAME OVER", 5, 90);
    context.fillText("SCORE", 110, 110);
    context.fillText("BEST", 125, 190);
    // context.fillText(highscore, 170, 230);

    if (highscore > 9) {
      let highscoreOffset = Math.floor(Math.log10(Math.abs(highscore)));
      let highscorePosition = 170 + (-20  * (highscoreOffset));
      context.fillText(highscore, highscorePosition, 230);
    } else {
      context.fillText(highscore, 170, 230);
    }
  }
}

function placePipes() {
  if (gameOver) {
    return;
  }
  // (0-1) * pipeHeight / 2
  // 0 -> -128 (pipeHeight / 4)
  // 1 -> -128 - 256 (pipeHeight / 4 - pipeHeight / 2) = -3/4 pipeHeight
  let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * pipeHeight / 2;
  let openingSpace = board.height / 4;

  let topPipe = {
    img: topPipeImg,
    x: pipeX,
    y: randomPipeY,
    width: pipeWidth,
    height: pipeHeight,
    passed: false
  }
  pipeArray.push(topPipe);

  let bottomPipe = {
    img: bottomPipeImg,
    x: pipeX,
    y: randomPipeY + pipeHeight + openingSpace,
    width: pipeWidth,
    height: pipeHeight,
    passed: false
  }
  pipeArray.push(bottomPipe);
}

function moveBird(e) {
  if (e.code === "Space" || e.type === "touchstart") {
    // jump
    velocityY = -7;

    if (isMobileDevice()) {
      velocityY = -10;
    }

    // reset game
    if (gameOver) {
      bird.y = birdY;
      pipeArray = [];
      score = 0;
      gameOver = false;
    }
  }
}

function detectCollision(a, b) {
  return a.x < b.x + b.width &&
         a.x + a.width > b.x &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y;
}
