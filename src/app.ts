// Class to hold the current active tetronimo.
class Player {
  position: { x: number; y: number };
  matrix: any[];
  score: number;

  constructor(
    position = { x: 0, y: 0 },
    matrix: any[] = null,
    score: number = 0
  ) {
    this.position = position;
    this.matrix = matrix;
    this.score = score;
  }
}

// Class for the game.
class Tetris {
  _canvas: HTMLCanvasElement;
  _context: CanvasRenderingContext2D;

  colours: string[];
  arena: any[];
  player: Player;

  dropCounter: number;
  dropInterval: number;
  lastTime: number;

  constructor(canvas: HTMLCanvasElement) {
    this._canvas = canvas;
    this._context = canvas.getContext("2d");
    this._canvas.width = 480;
    this._canvas.height = 800;
    this._context.scale(20, 20);

    // Holds the colours for the tetronimos.
    this.colours = [
      null,
      "blue",
      "red",
      "purple",
      "green",
      "yellow",
      "orange",
      "aqua"
    ];
    // Creates the game board.
    this.arena = this.createMatrix(24, 40);
    this.player = new Player();

    this.dropCounter = 0;
    this.dropInterval = 1000;
    this.lastTime = 0;
  }

  // Create a matrix
  createMatrix(width: number, height: number) {
    const matrix = [];
    while (height !== 0) {
      matrix.push(new Array(width).fill(0));

      height--;
    }

    return matrix;
  }

  // Start the game.
  start() {
    this.playerReset();
    this.updateScore();
    this.update();
  }

  // Select the next piece.
  playerReset() {
    const pieces: string = "IOTJLSZ";
    this.player.matrix = this.createPiece(
      pieces[(pieces.length * Math.random()) | 0]
    );
    this.player.position.y = 0;
    this.player.position.x =
      ((this.arena[0].length / 2) | 0) -
      ((this.player.matrix[0].length / 2) | 0);

    // Game over when a piece reaches the top of the arena.
    if (this.collide(this.arena, this.player)) {
      this.arena.forEach(row => row.fill(0));
      this.player.score = 0;
      this.updateScore();
    }
  }

  // Update the score.
  updateScore() {
    document.getElementById("score").innerText = this.player.score.toString();
  }

  //let dropCounter = 0;
  //let dropInterval = 1000;
  //let lastTime = 0;
  update(time: number = 0) {
    const deltaTime: number = time - this.lastTime;
    this.lastTime = time;

    // Drops the current piece by one place every second.
    this.dropCounter += deltaTime;
    if (this.dropCounter > this.dropInterval) {
      this.playerDrop();
    }

    this.draw();
    requestAnimationFrame(this.update.bind(this));
  }

  // Create a tetronimo (tetris piece).
  createPiece(type: string) {
    if (type === "I") {
      return [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ];
    } else if (type === "O") {
      return [
        [2, 2],
        [2, 2]
      ];
    } else if (type === "T") {
      return [
        [0, 0, 0],
        [3, 3, 3],
        [0, 3, 0]
      ];
    } else if (type === "J") {
      return [
        [0, 0, 0],
        [4, 4, 4],
        [0, 0, 4]
      ];
    } else if (type === "L") {
      return [
        [0, 0, 0],
        [5, 5, 5],
        [5, 0, 0]
      ];
    } else if (type === "S") {
      return [
        [0, 0, 0],
        [0, 6, 6],
        [6, 6, 0]
      ];
    } else if (type === "Z") {
      return [
        [0, 0, 0],
        [7, 7, 0],
        [0, 7, 7]
      ];
    }
  }

  // Handle collision.
  collide(arena: any[], player: Player) {
    const [m, o] = [player.matrix, player.position];
    for (let y = 0; y < m.length; y++) {
      for (let x = 0; x < m[y].length; x++) {
        if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0)
          return true;
      }
    }
    return false;
  }

  // Handle the tetronimo's downward movement.
  playerDrop() {
    this.player.position.y++; // Move piece down.

    // If the current active piece hits the bottom of the board or another piece,
    // place it take control of the next piece
    if (this.collide(this.arena, this.player)) {
      this.player.position.y--;
      this.merge(this.arena, this.player);
      this.playerReset();
      this.arenaSweep();
      this.updateScore();
    }
    this.dropCounter = 0;
  }

  // Add the current active tetronimo to the arena.
  merge(arena: any[], player: Player) {
    player.matrix.forEach((row, y) => {
      row.forEach((value: number, x: number) => {
        if (value !== 0) {
          arena[y + player.position.y][x + player.position.x] = value;
        }
      });
    });
  }

  // Remove the lowest row on the board if it is completely full.
  arenaSweep() {
    let rowCount: number = 1;
    outer: for (let y = this.arena.length - 1; y > 0; --y) {
      for (let x = 0; x < this.arena[y].length; ++x) {
        if (this.arena[y][x] === 0) {
          continue outer;
        }
      }

      const row = this.arena.splice(y, 1)[0].fill(0);
      this.arena.unshift(row);
      ++y;

      // Adjust score.
      this.player.score += rowCount * 10;
      rowCount *= 2;
    }
  }

  // Handle the drawing.
  draw() {
    this._context.fillStyle = "black";
    this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);

    // Draw the arena.
    this.drawMatrix(this.arena, { x: 0, y: 0 });
    // Draw the tetronimo.
    this.drawMatrix(this.player.matrix, this.player.position);
  }

  // Draw the game board and pieces.
  drawMatrix(matrix: any[], offset: any) {
    matrix.forEach((row, y) => {
      row.forEach((value: number, x: number) => {
        if (value !== 0) {
          this._context.fillStyle = this.colours[value];
          this._context.fillRect(x + offset.x, y + offset.y, 1, 1);
        }
      });
    });
  }

  // Handle the movement of the current active tetronimo.
  playerMove(direction: number) {
    this.player.position.x += direction;

    // Prevent the piece from moving off the board.
    if (this.collide(this.arena, this.player)) {
      this.player.position.x -= direction;
    }
  }

  // Handle the rotation of the current active tetronimo.
  playerRotate(direction: number) {
    const position: number = this.player.position.x;
    let offset: number = 1;
    this.rotate(this.player.matrix, direction);

    // Prevent piece from rotating past the game board.
    while (this.collide(this.arena, this.player)) {
      this.player.position.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));

      if (offset > this.player.matrix[0].length) {
        this.rotate(this.player.matrix, -direction);
        this.player.position.x = position;
        return;
      }
    }
  }

  // Handle rotation.
  rotate(matrix: any[], direction: number) {
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
}

const CANVAS = document.querySelector("canvas");
const tetris = new Tetris(CANVAS);

tetris.start();

// Handles arrow keys for piece placement.
document.addEventListener("keydown", event => {
  if (event.keyCode === 37 || event.keyCode === 65) {
    tetris.playerMove(-1); // Move piece to the left
  } else if (event.keyCode === 39 || event.keyCode === 68) {
    tetris.playerMove(1); // Move piece to the right;
  } else if (event.keyCode === 40 || event.keyCode === 83) {
    tetris.playerDrop(); // Move piece down.
  } else if (event.keyCode === 81) {
    tetris.playerRotate(-1); // Rotate counter-clockwise.
  } else if (event.keyCode === 69) {
    tetris.playerRotate(1); // Rotate clockwise.
  }
});
