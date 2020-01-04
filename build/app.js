class Player {
    constructor(position = { x: 0, y: 0 }, matrix = null, score = 0) {
        this.position = position;
        this.matrix = matrix;
        this.score = score;
    }
}
class Tetris {
    constructor(canvas) {
        this._canvas = canvas;
        this._context = canvas.getContext("2d");
        this._canvas.width = 480;
        this._canvas.height = 800;
        this._context.scale(20, 20);
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
        this.arena = this.createMatrix(24, 40);
        this.player = new Player();
        this.dropCounter = 0;
        this.dropInterval = 1000;
        this.lastTime = 0;
    }
    createMatrix(width, height) {
        const matrix = [];
        while (height !== 0) {
            matrix.push(new Array(width).fill(0));
            height--;
        }
        return matrix;
    }
    start() {
        this.playerReset();
        this.updateScore();
        this.update();
    }
    playerReset() {
        const pieces = "IOTJLSZ";
        this.player.matrix = this.createPiece(pieces[(pieces.length * Math.random()) | 0]);
        this.player.position.y = 0;
        this.player.position.x =
            ((this.arena[0].length / 2) | 0) -
                ((this.player.matrix[0].length / 2) | 0);
        if (this.collide(this.arena, this.player)) {
            this.arena.forEach(row => row.fill(0));
            this.player.score = 0;
            this.updateScore();
        }
    }
    updateScore() {
        document.getElementById("score").innerText = this.player.score.toString();
    }
    update(time = 0) {
        const deltaTime = time - this.lastTime;
        this.lastTime = time;
        this.dropCounter += deltaTime;
        if (this.dropCounter > this.dropInterval) {
            this.playerDrop();
        }
        this.draw();
        requestAnimationFrame(this.update.bind(this));
    }
    createPiece(type) {
        if (type === "I") {
            return [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ];
        }
        else if (type === "O") {
            return [
                [2, 2],
                [2, 2]
            ];
        }
        else if (type === "T") {
            return [
                [0, 0, 0],
                [3, 3, 3],
                [0, 3, 0]
            ];
        }
        else if (type === "J") {
            return [
                [0, 0, 0],
                [4, 4, 4],
                [0, 0, 4]
            ];
        }
        else if (type === "L") {
            return [
                [0, 0, 0],
                [5, 5, 5],
                [5, 0, 0]
            ];
        }
        else if (type === "S") {
            return [
                [0, 0, 0],
                [0, 6, 6],
                [6, 6, 0]
            ];
        }
        else if (type === "Z") {
            return [
                [0, 0, 0],
                [7, 7, 0],
                [0, 7, 7]
            ];
        }
    }
    collide(arena, player) {
        const [m, o] = [player.matrix, player.position];
        for (let y = 0; y < m.length; y++) {
            for (let x = 0; x < m[y].length; x++) {
                if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0)
                    return true;
            }
        }
        return false;
    }
    playerDrop() {
        this.player.position.y++;
        if (this.collide(this.arena, this.player)) {
            this.player.position.y--;
            this.merge(this.arena, this.player);
            this.playerReset();
            this.arenaSweep();
            this.updateScore();
        }
        this.dropCounter = 0;
    }
    merge(arena, player) {
        player.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    arena[y + player.position.y][x + player.position.x] = value;
                }
            });
        });
    }
    arenaSweep() {
        let rowCount = 1;
        outer: for (let y = this.arena.length - 1; y > 0; --y) {
            for (let x = 0; x < this.arena[y].length; ++x) {
                if (this.arena[y][x] === 0) {
                    continue outer;
                }
            }
            const row = this.arena.splice(y, 1)[0].fill(0);
            this.arena.unshift(row);
            ++y;
            this.player.score += rowCount * 10;
            rowCount *= 2;
        }
    }
    draw() {
        this._context.fillStyle = "black";
        this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);
        this.drawMatrix(this.arena, { x: 0, y: 0 });
        this.drawMatrix(this.player.matrix, this.player.position);
    }
    drawMatrix(matrix, offset) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this._context.fillStyle = this.colours[value];
                    this._context.fillRect(x + offset.x, y + offset.y, 1, 1);
                }
            });
        });
    }
    playerMove(direction) {
        this.player.position.x += direction;
        if (this.collide(this.arena, this.player)) {
            this.player.position.x -= direction;
        }
    }
    playerRotate(direction) {
        const position = this.player.position.x;
        let offset = 1;
        this.rotate(this.player.matrix, direction);
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
    rotate(matrix, direction) {
        for (let y = 0; y < matrix.length; y++) {
            for (let x = 0; x < y; x++) {
                [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
            }
        }
        if (direction > 0) {
            matrix.forEach(row => row.reverse());
        }
        else {
            matrix.reverse();
        }
    }
}
const CANVAS = document.querySelector("canvas");
const tetris = new Tetris(CANVAS);
tetris.start();
document.addEventListener("keydown", event => {
    if (event.keyCode === 37 || event.keyCode === 65) {
        tetris.playerMove(-1);
    }
    else if (event.keyCode === 39 || event.keyCode === 68) {
        tetris.playerMove(1);
    }
    else if (event.keyCode === 40 || event.keyCode === 83) {
        tetris.playerDrop();
    }
    else if (event.keyCode === 81) {
        tetris.playerRotate(-1);
    }
    else if (event.keyCode === 69) {
        tetris.playerRotate(1);
    }
});
//# sourceMappingURL=app.js.map