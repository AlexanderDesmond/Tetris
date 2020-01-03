const CANVAS = document.querySelector("canvas");
const CONTEXT = CANVAS.getContext("2d");

CANVAS.width = 480;
CANVAS.height = 800;
CONTEXT.scale(20, 20);

// Handle collision.
function collide(arena, player) {
  const [m, o] = [player.matrix, player.position];
  for (let y = 0; y < m.length; y++) {
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

// Create a new tetronimo (Tetis piece).
function createPiece(type) {
  if (type === "I") {
    return [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ];
  } else if (type === "O") {
    return [
      [1, 1],
      [1, 1]
    ];
  } else if (type === "T") {
    return [
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0]
    ];
  } else if (type === "J") {
    return [
      [0, 0, 0],
      [1, 1, 1],
      [0, 0, 1]
    ];
  } else if (type === "L") {
    return [
      [0, 0, 0],
      [1, 1, 1],
      [1, 0, 0]
    ];
  } else if (type === "S") {
    return [
      [0, 0, 0],
      [0, 1, 1],
      [1, 1, 0]
    ];
  } else if (type === "Z") {
    return [
      [0, 0, 0],
      [1, 1, 0],
      [0, 1, 1]
    ];
  }
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
    playerReset();
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

// Select the next piece.
function playerReset() {
  const pieces = "IOTJLSZ";
  player.matrix = createPiece(pieces[(pieces.length * Math.random()) | 0]);
  player.position.y = 0;
  player.position.x =
    ((arena[0].length / 2) | 0) - ((player.matrix[0].length / 2) | 0);

  // Game over when a piece reaches the top of the arena.
  if (collide(arena, player)) {
    arena.forEach(row => row.fill(0));
  }
}

// Rotate the current piece.
function playerRotate(direction) {
  const position = player.position.x;
  let offset = 1;
  rotate(player.matrix, direction);

  // Prevent piece from rotating past the game board.
  while (collide(arena, player)) {
    player.position.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));

    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -direction);
      player.position.x = position;
      return;
    }
  }
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
  matrix: createPiece("T")
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
