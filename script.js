const cells = document.querySelectorAll('.cell');
const message = document.getElementById('message');
const restartButton = document.getElementById('restart');
const difficultySelect = document.getElementById('difficulty');

let board = Array(9).fill(null);
let currentPlayer = 'X';
let gameActive = true;
let difficulty = 'easy'; // Default difficulty level

const winningCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
];

// Function to check winner
function checkWinner() {
  for (let combo of winningCombos) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      gameActive = false;
      message.textContent = `${board[a]} wins!`;
      highlightWinningCells(combo);
      return;
    }
  }
  if (!board.includes(null)) {
    gameActive = false;
    message.textContent = `It's a draw!`;
  }
}

// Highlight winning cells
function highlightWinningCells(combo) {
  combo.forEach(index => {
    cells[index].style.backgroundColor = '#74ebd5';
  });
}

// AI logic to make a move based on difficulty
function aiMove() {
  if (!gameActive) return;

  if (difficulty === 'easy') {
    // Pick a random empty cell
    let emptyCells = board.map((val, index) => (val === null ? index : null)).filter(val => val !== null);
    let randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    makeMove(randomIndex, 'O');
  } else if (difficulty === 'medium') {
    // Block player if possible, otherwise random
    for (let combo of winningCombos) {
      const [a, b, c] = combo;
      if (board[a] === 'X' && board[b] === 'X' && !board[c]) return makeMove(c, 'O');
      if (board[a] === 'X' && board[c] === 'X' && !board[b]) return makeMove(b, 'O');
      if (board[b] === 'X' && board[c] === 'X' && !board[a]) return makeMove(a, 'O');
    }
    let emptyCells = board.map((val, index) => (val === null ? index : null)).filter(val => val !== null);
    let randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    makeMove(randomIndex, 'O');
  } else if (difficulty === 'hard') {
    // Try to win, block player, then random
    for (let combo of winningCombos) {
      const [a, b, c] = combo;
      if (board[a] === 'O' && board[b] === 'O' && !board[c]) return makeMove(c, 'O');
      if (board[a] === 'O' && board[c] === 'O' && !board[b]) return makeMove(b, 'O');
      if (board[b] === 'O' && board[c] === 'O' && !board[a]) return makeMove(a, 'O');
    }
    for (let combo of winningCombos) {
      const [a, b, c] = combo;
      if (board[a] === 'X' && board[b] === 'X' && !board[c]) return makeMove(c, 'O');
      if (board[a] === 'X' && board[c] === 'X' && !board[b]) return makeMove(b, 'O');
      if (board[b] === 'X' && board[c] === 'X' && !board[a]) return makeMove(a, 'O');
    }
    let emptyCells = board.map((val, index) => (val === null ? index : null)).filter(val => val !== null);
    let randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    makeMove(randomIndex, 'O');
  }
}

// Make a move
function makeMove(index, player) {
  board[index] = player;
  cells[index].textContent = player;
  cells[index].classList.add('taken');
  checkWinner();
  if (gameActive && player === 'O') currentPlayer = 'X';
}

// Handle cell click
function handleCellClick(event) {
  const index = event.target.getAttribute('data-index');
  if (board[index] || !gameActive) return;

  makeMove(index, currentPlayer);
  if (gameActive) {
    currentPlayer = 'O';
    setTimeout(aiMove, 500);
  }
}

// Restart game
function restartGame() {
  board.fill(null);
  gameActive = true;
  currentPlayer = 'X';
  message.textContent = '';
  cells.forEach(cell => {
    cell.textContent = '';
    cell.classList.remove('taken');
    cell.style.backgroundColor = '#f7f7f7';
  });
}

// Update difficulty
function updateDifficulty() {
  difficulty = difficultySelect.value;
}

// Event listeners
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartButton.addEventListener('click', restartGame);
difficultySelect.addEventListener('change', updateDifficulty);