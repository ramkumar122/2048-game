document.addEventListener("DOMContentLoaded", () => {
    const board = document.getElementById('game-board');
    const restartButton = document.getElementById('restart-button');
    const scoreDisplay = document.getElementById('score');
    const bestScoreDisplay = document.getElementById('best-score');
    const gameOverDisplay = document.getElementById('game-over');
    let tiles = [];
    let score = 0;
    let bestScore = localStorage.getItem('bestScore') || 0;

    function createBoard() {
        for (let i = 0; i < 16; i++) {
            let tile = document.createElement('div');
            tile.classList.add('tile');
            board.appendChild(tile);
            tiles.push(tile);
        }
        addNewTile();
        addNewTile();
        updateScore();
    }

    function addNewTile() {
        let emptyTiles = tiles.filter(tile => !tile.textContent);
        if (emptyTiles.length === 0) return;
        let randomTile = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
        randomTile.textContent = Math.random() > 0.5 ? 2 : 4;
        randomTile.dataset.value = randomTile.textContent;
    }

    function moveTiles(direction) {
        let moved = false;
        let combined = Array(16).fill(false);

        function move(row) {
            let newRow = row.filter(num => num);
            while (newRow.length < 4) newRow.push(0);
            return newRow;
        }

        function combine(row) {
            for (let i = 0; i < 3; i++) {
                if (row[i] !== 0 && row[i] === row[i + 1] && !combined[i]) {
                    row[i] *= 2;
                    row[i + 1] = 0;
                    score += row[i];
                    combined[i] = true;
                    moved = true;
                }
            }
            return row;
        }

        for (let i = 0; i < 4; i++) {
            let row;
            if (direction === 'up' || direction === 'down') {
                row = [
                    parseInt(tiles[i].textContent) || 0,
                    parseInt(tiles[i + 4].textContent) || 0,
                    parseInt(tiles[i + 8].textContent) || 0,
                    parseInt(tiles[i + 12].textContent) || 0
                ];
                if (direction === 'down') row = row.reverse();
            } else {
                row = [
                    parseInt(tiles[i * 4].textContent) || 0,
                    parseInt(tiles[i * 4 + 1].textContent) || 0,
                    parseInt(tiles[i * 4 + 2].textContent) || 0,
                    parseInt(tiles[i * 4 + 3].textContent) || 0
                ];
                if (direction === 'right') row = row.reverse();
            }

            let originalRow = [...row];
            row = move(row);
            row = combine(row);
            row = move(row);

            if (direction === 'down') row = row.reverse();
            if (direction === 'right') row = row.reverse();

            for (let j = 0; j < 4; j++) {
                let value = row[j] === 0 ? '' : row[j];
                if (direction === 'up' || direction === 'down') {
                    tiles[i + j * 4].textContent = value;
                    tiles[i + j * 4].dataset.value = value;
                } else {
                    tiles[i * 4 + j].textContent = value;
                    tiles[i * 4 + j].dataset.value = value;
                }
            }

            if (originalRow.toString() !== row.toString()) {
                moved = true;
            }
        }

        if (moved) {
            addNewTile();
            updateScore();
            checkGameOver();
        }
    }

    function control(e) {
        if (e.key === "ArrowRight") {
            moveTiles('right');
        } else if (e.key === "ArrowLeft") {
            moveTiles('left');
        } else if (e.key === "ArrowUp") {
            moveTiles('up');
        } else if (e.key === "ArrowDown") {
            moveTiles('down');
        }
    }

    function handleTouchStart(e) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    }

    function handleTouchMove(e) {
        e.preventDefault(); // Prevent scrolling
    }

    function handleTouchEnd(e) {
        endX = e.changedTouches[0].clientX;
        endY = e.changedTouches[0].clientY;
        handleSwipe();
    }

    function handleSwipe() {
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);

        if (absDeltaX > absDeltaY) {
            if (deltaX > 0) {
                moveTiles('right');
            } else {
                moveTiles('left');
            }
        } else {
            if (deltaY > 0) {
                moveTiles('down');
            } else {
                moveTiles('up');
            }
        }
    }

    function updateScore() {
        scoreDisplay.textContent = `Score: ${score}`;
        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem('bestScore', bestScore);
        }
        bestScoreDisplay.textContent = `Best: ${bestScore}`;
    }

    function checkGameOver() {
        let movesAvailable = false;

        function canCombine(row) {
            for (let i = 0; i < row.length - 1; i++) {
                if (row[i] === row[i + 1]) {
                    return true;
                }
            }
            return false;
        }

        for (let i = 0; i < 4; i++) {
            let row = [
                parseInt(tiles[i * 4].textContent) || 0,
                parseInt(tiles[i * 4 + 1].textContent) || 0,
                parseInt(tiles[i * 4 + 2].textContent) || 0,
                parseInt(tiles[i * 4 + 3].textContent) || 0
            ];
            let col = [
                parseInt(tiles[i].textContent) || 0,
                parseInt(tiles[i + 4].textContent) || 0,
                parseInt(tiles[i + 8].textContent) || 0,
                parseInt(tiles[i + 12].textContent) || 0
            ];

            if (canCombine(row) || canCombine(col)) {
                movesAvailable = true;
                break;
            }
        }

        if (!movesAvailable && tiles.filter(tile => !tile.textContent).length === 0) {
            gameOverDisplay.classList.remove('hidden');
        }
    }

    function restartGame() {
        tiles.forEach(tile => {
            tile.textContent = '';
            tile.removeAttribute('data-value');
        });
        score = 0;
        gameOverDisplay.classList.add('hidden');
        addNewTile();
        addNewTile();
        updateScore();
    }

    document.addEventListener('keyup', control);
    board.addEventListener('touchstart', handleTouchStart, { passive: true });
    board.addEventListener('touchmove', handleTouchMove, { passive: false });
    board.addEventListener('touchend', handleTouchEnd, { passive: true });
    restartButton.addEventListener('click', restartGame);

    createBoard();
});
