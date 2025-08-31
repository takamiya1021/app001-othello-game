// ゲーム状態の管理
const BOARD_SIZE = 8;
const EMPTY = 0;
const BLACK = 1;
const WHITE = 2;

let board = [];
let currentPlayer = BLACK;
let gameActive = true;
let validMoves = [];

// DOM要素の取得
const gameBoard = document.getElementById('game-board');
const blackCountElement = document.getElementById('black-count');
const whiteCountElement = document.getElementById('white-count');
const currentTurnElement = document.getElementById('current-turn');
const messageElement = document.getElementById('message');
const resetBtn = document.getElementById('reset-btn');
const passBtn = document.getElementById('pass-btn');

// 方向ベクトル（8方向）
const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
];

// ゲームの初期化
function initGame() {
    board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(EMPTY));
    
    // 初期配置
    const mid = BOARD_SIZE / 2;
    board[mid - 1][mid - 1] = WHITE;
    board[mid - 1][mid] = BLACK;
    board[mid][mid - 1] = BLACK;
    board[mid][mid] = WHITE;
    
    currentPlayer = BLACK;
    gameActive = true;
    messageElement.textContent = '';
    messageElement.className = 'message';
    
    createBoard();
    updateBoard();
    updateValidMoves();
}

// ボードの作成
function createBoard() {
    gameBoard.innerHTML = '';
    
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener('click', handleCellClick);
            gameBoard.appendChild(cell);
        }
    }
}

// セルクリックの処理
function handleCellClick(event) {
    if (!gameActive) return;
    
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    
    if (isValidMove(row, col, currentPlayer)) {
        makeMove(row, col, currentPlayer);
        switchPlayer();
    }
}

// 移動の実行
function makeMove(row, col, player) {
    board[row][col] = player;
    
    // 石をひっくり返す
    for (const [dr, dc] of directions) {
        const flipped = getFlippedStones(row, col, dr, dc, player);
        for (const [r, c] of flipped) {
            board[r][c] = player;
            animateFlip(r, c);
        }
    }
    
    updateBoard();
}

// 石をひっくり返すアニメーション
function animateFlip(row, col) {
    const cells = gameBoard.children;
    const index = row * BOARD_SIZE + col;
    const stone = cells[index].querySelector('.stone');
    if (stone) {
        stone.classList.add('flip');
        setTimeout(() => {
            stone.classList.remove('flip');
        }, 500);
    }
}

// 有効な手かどうかをチェック
function isValidMove(row, col, player) {
    if (board[row][col] !== EMPTY) return false;
    
    for (const [dr, dc] of directions) {
        if (getFlippedStones(row, col, dr, dc, player).length > 0) {
            return true;
        }
    }
    
    return false;
}

// ひっくり返せる石を取得
function getFlippedStones(row, col, dr, dc, player) {
    const flipped = [];
    let r = row + dr;
    let c = col + dc;
    const opponent = player === BLACK ? WHITE : BLACK;
    
    while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
        if (board[r][c] === EMPTY) {
            return [];
        } else if (board[r][c] === opponent) {
            flipped.push([r, c]);
        } else {
            return flipped;
        }
        r += dr;
        c += dc;
    }
    
    return [];
}

// プレイヤーの切り替え
function switchPlayer() {
    currentPlayer = currentPlayer === BLACK ? WHITE : BLACK;
    updateValidMoves();
    
    // 有効な手がない場合
    if (validMoves.length === 0) {
        // 相手に有効な手があるかチェック
        currentPlayer = currentPlayer === BLACK ? WHITE : BLACK;
        updateValidMoves();
        
        if (validMoves.length === 0) {
            // 両者とも有効な手がない → ゲーム終了
            endGame();
        } else {
            // パスする
            messageElement.textContent = `${currentPlayer === BLACK ? '黒' : '白'}は置ける場所がありません。パスします。`;
            passBtn.disabled = false;
        }
    } else {
        passBtn.disabled = true;
    }
    
    updateTurnDisplay();
}

// 有効な手の更新
function updateValidMoves() {
    validMoves = [];
    const cells = gameBoard.children;
    
    // 全てのセルから valid-move クラスを削除
    for (let i = 0; i < cells.length; i++) {
        cells[i].classList.remove('valid-move');
    }
    
    // 有効な手を探して表示
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (isValidMove(row, col, currentPlayer)) {
                validMoves.push([row, col]);
                const index = row * BOARD_SIZE + col;
                cells[index].classList.add('valid-move');
            }
        }
    }
}

// ボードの表示更新
function updateBoard() {
    const cells = gameBoard.children;
    let blackCount = 0;
    let whiteCount = 0;
    
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const index = row * BOARD_SIZE + col;
            const cell = cells[index];
            
            // 既存の石を削除
            cell.innerHTML = '';
            
            if (board[row][col] !== EMPTY) {
                const stone = document.createElement('div');
                stone.className = 'stone';
                
                if (board[row][col] === BLACK) {
                    stone.classList.add('black');
                    blackCount++;
                } else {
                    stone.classList.add('white');
                    whiteCount++;
                }
                
                cell.appendChild(stone);
            }
        }
    }
    
    // スコアの更新
    blackCountElement.textContent = blackCount;
    whiteCountElement.textContent = whiteCount;
}

// ターン表示の更新
function updateTurnDisplay() {
    currentTurnElement.textContent = currentPlayer === BLACK ? '黒' : '白';
}

// ゲーム終了処理
function endGame() {
    gameActive = false;
    const blackCount = parseInt(blackCountElement.textContent);
    const whiteCount = parseInt(whiteCountElement.textContent);
    
    if (blackCount > whiteCount) {
        messageElement.textContent = `🎉 黒の勝利！ (${blackCount} - ${whiteCount})`;
        messageElement.className = 'message winner';
    } else if (whiteCount > blackCount) {
        messageElement.textContent = `🎉 白の勝利！ (${whiteCount} - ${blackCount})`;
        messageElement.className = 'message winner';
    } else {
        messageElement.textContent = `引き分け！ (${blackCount} - ${whiteCount})`;
        messageElement.className = 'message draw';
    }
}

// パスボタンの処理
passBtn.addEventListener('click', () => {
    messageElement.textContent = '';
    passBtn.disabled = true;
});

// リセットボタンの処理
resetBtn.addEventListener('click', initGame);

// ゲーム開始
initGame();