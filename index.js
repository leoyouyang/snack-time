// Set up the canvas
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Set up the canvas background
let canvasImg = new Image();
canvasImg.src = "images/canvas.jpg";
canvasImg.setAttribute("crossorigin", "anonymous");
canvasImg.onload = render;

// Load add-on background images
let bg0Img = new Image();
bg0Img.src = "images/bg0.png";
bg0Img.setAttribute("crossorigin", "anonymous");

let bg1Img = new Image();
bg1Img.src = "images/bg1.png";
bg1Img.setAttribute("crossorigin", "anonymous");

let bg2Img = new Image();
bg2Img.src = "images/bg2.png";
bg2Img.setAttribute("crossorigin", "anonymous");

let bg3Img = new Image();
bg3Img.src = "images/bg3.png";
bg3Img.setAttribute("crossorigin", "anonymous");

let bg4Img = new Image();
bg4Img.src = "images/bg4.png";
bg4Img.setAttribute("crossorigin", "anonymous");

let bg = [];
bg.push(bg0Img, bg1Img, bg2Img, bg3Img, bg4Img);
let bgIdx = 0;

let undoStack = [];

// Set up clearCanvas function
function clearCanvas() {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(canvasImg, 0, 0, canvas.width, canvas.height);
}

// Render the canvas with the background image
function render() {
  clearCanvas();
  if (canvas.width >= canvas.height) {
    let bgImgXOffset = (canvas.width - canvas.height) / 2;
    ctx.drawImage(bg[bgIdx], bgImgXOffset, 0, canvas.height, canvas.height);
  } else {
    let bgImgYOffset = (canvas.height - canvas.width) / 2;
    ctx.drawImage(bg[bgIdx], 0, bgImgYOffset, canvas.width, canvas.width);
  }
  undoStack = [];
}

// Initialize the brush
// brushmode: 0-Pringles  1-Cheetos  2-Doritos
let brushMode = 0;
let penDown = false;
let lastX = 0;
let lastY = 0;

// Set up brush buttons
let pringlesButton = document.getElementById("pringles");
let cheetosButton = document.getElementById("cheetos");
let doritosButton = document.getElementById("doritos");
let clearButton = document.getElementById("clear");

pringlesButton.addEventListener("click", function () {
  brushMode = 0;
  resetSelectedButtons();
  this.classList.add("selected");
});

cheetosButton.addEventListener("click", function () {
  brushMode = 1;
  resetSelectedButtons();
  this.classList.add("selected");
});

doritosButton.addEventListener("click", function () {
  brushMode = 2;
  resetSelectedButtons();
  this.classList.add("selected");
});

function resetSelectedButtons() {
  document.getElementById("pringles").classList.remove("selected");
  document.getElementById("cheetos").classList.remove("selected");
  document.getElementById("doritos").classList.remove("selected");
}

// Set up the Clear button
clearButton.addEventListener("click", function () {
  render();
});

// Set up the Undo button
let undoButton = document.getElementById("undo");

pushState();
function pushState() {
  undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  if (undoStack.length > 30) {
    undoStack.shift();
  }
}

undoButton.addEventListener("click", function () {
  if (undoStack.length > 1) {
    undoStack.pop();
    let lastElement = undoStack[undoStack.length - 1];
    ctx.putImageData(lastElement, 0, 0);
  } else if (undoStack.length === 1) {
    render();
  }
});

// Set up the Save button
let saveButton = document.getElementById("save");
saveButton.addEventListener("click", function () {
  let imageURL = canvas.toDataURL("image/png");
  saveButton.href = imageURL;
});

// Set up background switch buttons
let leftButton = document.getElementById("left");
leftButton.addEventListener("click", function () {
  if (bgIdx > 0) {
    bgIdx -= 1;
  } else {
    bgIdx = 4;
  }
  render();
});

let rightButton = document.getElementById("right");
rightButton.addEventListener("click", function () {
  if (bgIdx < 4) {
    bgIdx += 1;
  } else {
    bgIdx = 0;
  }
  render();
});

// Main brush functions
function normRandom(size) {
  return (Math.random() - 0.5) * size;
}

function paintStart(x, y) {
  penDown = true;
  lastX = x;
  lastY = y;
}

function paintMove(x, y) {
  ctx.beginPath();
  let interpolatedPoints = pointsAlongLine(x, y, lastX, lastY, 10);
  let randomness = 15;

  if (brushMode === 0) {
    // Pringles
    interpolatedPoints.forEach(function (p) {
      ctx.fillStyle = `hsl(${Math.random() * 10 + 45}, 100%, 60%)`;
      ctx.ellipse(
        p.x + normRandom(randomness),
        p.y + normRandom(randomness),
        25,
        30,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });
  } else if (brushMode === 1) {
    // Cheetos
    interpolatedPoints.forEach(function (p) {
      for (let i = 0; i < 100; i++) {
        ctx.fillStyle = `hsl(${Math.random() * 60}, 100%, 60%)`;
        ctx.fillRect(
          p.x + normRandom(randomness),
          p.y + normRandom(randomness),
          2,
          2
        );
      }
    });
  } else if (brushMode === 2) {
    // Doritos
    let height = 60 * Math.cos(Math.PI / 6);
    interpolatedPoints.forEach(function (p) {
      ctx.fillStyle = `hsl(${Math.random() * 20 + 30}, 100%, 60%)`;
      ctx.beginPath();
      ctx.moveTo(
        p.x + normRandom(randomness) - 30,
        p.y + normRandom(randomness) + 30
      );
      ctx.lineTo(
        p.x + normRandom(randomness) + 30,
        p.y + normRandom(randomness) + 30
      );
      ctx.lineTo(
        p.x + normRandom(randomness),
        p.y + normRandom(randomness) + 30 - height
      );
      ctx.closePath();
      ctx.fill();
    });
  }
  lastX = x;
  lastY = y;
}

function paintEnd(x, y) {
  pushState();
}

// Set up EventListener for the brush
canvas.addEventListener("mousedown", function (evt) {
  let x = evt.clientX;
  let y = evt.clientY;
  paintStart(x, y);
});

canvas.addEventListener("touchstart", function (evt) {
  let touches = Array.from(evt.touches);
  let touch = touches[0];
  paintStart(touch.clientX, touch.clientY);
});

canvas.addEventListener("mouseup", function (evt) {
  penDown = false;
  let x = evt.clientX;
  let y = evt.clientY;
  paintEnd(x, y);
});

canvas.addEventListener("mouseout", function (evt) {
  penDown = false;
});

canvas.addEventListener("mousemove", function (evt) {
  if (penDown === false) {
    return;
  }
  let x = evt.clientX;
  let y = evt.clientY;
  paintMove(x, y);
});

canvas.addEventListener("touchmove", function (evt) {
  evt.preventDefault();
  let touches = Array.from(evt.touches);
  let touch = touches[0];
  let x = touch.clientX;
  let y = touch.clientY;
  paintMove(x, y);
});

canvas.addEventListener("touchend", function (evt) {
  let x = lastX;
  let y = lastY;
  paintEnd(x, y);
});
