import React, { Component } from 'react';
import _ from 'lodash';
import './App.css';

const GAME_LOOP_INTERVAL = 400;
const NUM_ORIENTATIONS = 4;
const ROWS = 12;
const COLS = 10;
const pixelStyle = {
  height: `${100/ROWS}vh`,
  width: `${100/COLS}%`,
};

const tShaped = [
[
  [false, true, false],
  [true, true, true],
],
[
  [true, false],
  [true, true],
  [true, false],
],
[
  [false, false, false],
  [true, true, true],
  [false, true, false],
],
[
  [false, true],
  [true, true],
  [false, true],
],
];

const lShaped = [
[
  [true, false],
  [true, false],
  [true, true],
],
[
  [false, false, false],
  [true, true, true],
  [true, false, false],
],
[
  [true, true],
  [false, true],
  [false, true],
],
[
  [false, false, true],
  [true, true, true],
],
];

const sShaped = [
[
  [true, false],
  [true, true],
  [false, true],
],
[
  [false, true, true],
  [true, true, false],
],
];

const SHAPES = [tShaped, lShaped, sShaped];

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activePiece: null,
      board: Array(ROWS).fill(null).map(_ => Array(COLS).fill(false)),
    };
  }

  componentDidMount() {
    this.attachEventListeners();
    this.spawnPiece();
    this.startGameLoop();
  }

  startGameLoop() {
    this.timer = setInterval(() => {
      if (!this.state.activePiece) {
        return;
      }

      const { x, y } = this.state.activePiece;
      const board = this.combinedBoard();
      if (this.checkNextStateForCollision(x, y + 1)) {
        this.setState({
          board: this.boardAfterClearingLines(board),
          activePiece: null,
        });

        this.spawnPiece();
        return;
      }

      this.setState({
        activePiece: {
          ...this.state.activePiece,
          y: this.state.activePiece.y + 1,
        },
      });
    }, GAME_LOOP_INTERVAL);
  }

  spawnPiece() {
    const shapeIndex = _.random(0, SHAPES.length - 1);
    const orientation = _.random(0, SHAPES[shapeIndex].length - 1);
    const piece = SHAPES[shapeIndex][orientation];
    this.setState({
      activePiece: {
        shapeIndex,
        x: _.random(0, COLS - piece[0].length),
        y: 0,
        orientation,
      },
    });
  }

  attachEventListeners() {
    document.addEventListener('keydown', (event) => {
      if (!this.state.activePiece) {
        return;
      }
      const { x, y, shapeIndex, orientation } = this.state.activePiece;
      switch (event.code) {
        case 'ArrowLeft':
        case 'ArrowRight':
          if (this.checkNextStateForCollision(x + (event.code === 'ArrowLeft' ? -1 : 1), y)) {
            return;
          }
          this.setState({
            activePiece: {
              ...this.state.activePiece,
              x: Math.max(0, Math.min(COLS - 1, (this.state.activePiece.x + (event.code === 'ArrowLeft' ? -1 : 1)))),
            },
          });
          break;
        case 'ArrowUp':
          // TODO: Check that rotated piece is valid (does not collide).
          const shape = SHAPES[shapeIndex];
          this.setState({
            activePiece: {
              ...this.state.activePiece,
              orientation: (this.state.activePiece.orientation + 1) % shape.length,
            },
          });
          break;
        case 'ArrowDown':
          this.setState({
            activePiece: {
              ...this.state.activePiece,
              y: Math.min(ROWS - 1, (this.state.activePiece.y + 1)),
            },
          });
          break;
        default:
          break;
      }
    });
  }

  checkNextStateForCollision(x, y) {
    const { orientation, shapeIndex } = this.state.activePiece;
    const board = this.state.board;
    const piece = SHAPES[shapeIndex][orientation];
    // Wall collisions.
    if (y + piece.length - 1 >= ROWS || x + piece[0].length - 1 >= COLS || x < 0) {
      return true;
    }
    // Block collisions.
    for (let i = 0; i < piece.length; i++) {
      const pieceRow = piece[i];
      for (let j = 0; j < pieceRow.length; j++) {
        if (board[y + i][x + j] && piece[i][j]) {
          return true;
        }
      }
    }

    return false;
  }

  boardAfterClearingLines(board) {
    const boardWithRemovedLines = board.filter(row => !_.every(row, cell => cell));
    const length = ROWS - boardWithRemovedLines.length;
    return [...Array(length).fill(null).map(_ => Array(COLS).fill(false)), ...boardWithRemovedLines];
  }

  combinedBoard() {
    const board = _.cloneDeep(this.state.board);

    if (this.state.activePiece) {
      const { x, y, orientation, shapeIndex } = this.state.activePiece;
      const piece = SHAPES[shapeIndex][orientation];
      for (let i = 0; i < piece.length; i++) {
        const pieceRow = piece[i];
        for (let j = 0; j < pieceRow.length; j++) {
          board[y + i][x + j] = board[y + i][x + j] || piece[i][j];
        }
      }
    }

    return board;
  }

  render() {
    const board = this.combinedBoard();

    return (
      <div>
        <div className="game-board">
          {board.map(row =>
            row.map(cell =>
              <div className={`game-pixel ${cell ? 'filled' : ''}`} style={pixelStyle} />
            )
          )}
        </div>
      </div>
    );
  }
}

export default App;
