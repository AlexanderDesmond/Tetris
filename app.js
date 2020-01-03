const CANVAS = document.querySelector("canvas");
const CONTEXT = CANVAS.getContext("2d");

CANVAS.width = 480;
CANVAS.height = 800;
CONTEXT.scale(20, 20);

const matrix = [
  [0, 0, 0],
  [1, 1, 1],
  [0, 1, 0]
];

// Handle collision.
function collide(arena, player) {
  const [m, o] = [player.matrix, player.position];
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < m[y].length; x++) {
      if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0)
        return true;
    }
  }
  return false;
}

// Create a game piece.
function createMatrix(width, height) {
  const matrix = [];
  while (height !== 0) {
    matrix.push(new Array(width).fill(0));

    height--;
  }

  return matrix;
}

function draw() {
  CONTEXT.fillStyle = "black";
  CONTEXT.fillRect(0, 0, CANVAS.width, CANVAS.height);

  drawMatrix(arena, { x: 0, y: 0 });
  drawMatrix(player.matrix, player.position);
}

// Draw a game piece.
function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        CONTEXT.fillStyle = "red";
        CONTEXT.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

// Add the current piece to the (arena) game board.
function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.position.y][x + player.position.x] = value;
      }
    });
  });
}

// Handles the dropping of the current piece.
function playerDrop() {
  player.position.y++; // Move piece down.

  // If the current active piece hits the bottom of the board or another piece,
  // place it take control of the next piece
  if (collide(arena, player)) {
    player.position.y--;
    merge(arena, player);
    player.position.y = 0;
  }
  dropCounter = 0;
}

// Handles moving left and right
function playerMove(direction) {
  player.position.x += direction;

  // Prevent the piece from moving off the board.
  if (collide(arena, player)) {
    player.position.x -= direction;
  }
}

// Rotate the current piece.
function playerRotate(direction) {
  rotate(player.matrix, direction);
}

// Handle rotation of a piece.
function rotate(matrix, direction) {
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < y; x++) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }

  if (direction > 0) {
    matrix.forEach(row => row.reverse());
  } else {
    matrix.reverse();
  }
}

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;

  // Drops the current piece by one place every second.
  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    playerDrop();
  }

  draw();
  requestAnimationFrame(update);
}

// Creates the game board.
const arena = createMatrix(24, 40);

// Holds the position and shape of the current piece.
const player = {
  position: { x: 5, y: 5 },
  matrix: matrix
};

// Handles arrow keys for piece placement.
document.addEventListener("keydown", event => {
  if (event.keyCode === 37 || event.keyCode === 65) {
    playerMove(-1); // Move piece to the left
  } else if (event.keyCode === 39 || event.keyCode === 68) {
    playerMove(1); // Move piece to the right;
  } else if (event.keyCode === 40 || event.keyCode === 83) {
    playerDrop(); // Move piece down.
  } else if (event.keyCode === 81) {
    playerRotate(-1); // Rotate counter-clockwise.
  } else if (event.keyCode === 69) {
    playerRotate(1); // Rotate clockwise.
  }
});

update();
