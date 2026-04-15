class NonogramGameRenderer {
    constructor(cellSize = 40) {
        this.cellSize = cellSize;
        this.logic = new NonogramLogic();
        this.gameState = this.logic.getGameState();
    }
    
    handleCellClick(row, col, rightClick = false) {
        const result = this.logic.toggleCell(row, col, rightClick);
        if (result.success) {
            this.gameState = this.logic.getGameState();
            return result;
        }
        return result;
    }
    
    reset() {
        this.logic.reset();
        this.gameState = this.logic.getGameState();
    }
    
    newGame() {
        this.logic.newGame();
        this.gameState = this.logic.getGameState();
    }
    
    showSolution() {
        this.logic.showSolution();
        this.gameState = this.logic.getGameState();
    }
    
    getGameState() {
        return this.gameState;
    }
    
    isCellCorrect(row, col) {
        return this.logic.isCellCorrect(row, col);
    }
}

let nonogramGame, stage, gridContainer;
let hintContainers = { rows: [], cols: [] };
let cellGraphics = [];

function initNonogram() {
    nonogramGame = new NonogramGameRenderer();
    updateDisplay();
}

function createGrid(stage) {
    if (gridContainer) gridContainer.destroy();
    
    gridContainer = new PIXI.Container();
    stage.layers.get('game').addChild(gridContainer);
    
    hintContainers.rows.forEach(container => container.destroy());
    hintContainers.cols.forEach(container => container.destroy());
    hintContainers.rows = [];
    hintContainers.cols = [];
    
    cellGraphics = [];
    
    const gameState = nonogramGame.getGameState();
    const hintSpaceX = 120, hintSpaceY = 80;
    const startX = hintSpaceX, startY = hintSpaceY;
    
    createHints(gameState, startX, startY, stage);
    createCells(gameState, startX, startY);
}

function createHints(gameState, startX, startY, stage) {
    const textStyle = { fontSize: 16, fill: 0xFFFFFF, fontFamily: 'Arial' };
    
    for (let row = 0; row < gameState.gridSize; row++) {
        const hintContainer = new PIXI.Container();
        const hints = gameState.rowHints[row];
        
        hints.forEach((hint, i) => {
            const hintText = new PIXI.Text(hint.toString(), textStyle);
            hintText.x = (hints.length - 1 - i) * 25;
            hintText.y = row * nonogramGame.cellSize + startY + 10;
            hintContainer.addChild(hintText);
        });
        
        hintContainer.x = startX - 100;
        stage.layers.get('ui').addChild(hintContainer);
        hintContainers.rows.push(hintContainer);
    }
    
    for (let col = 0; col < gameState.gridSize; col++) {
        const hintContainer = new PIXI.Container();
        const hints = gameState.colHints[col];
        
        hints.forEach((hint, i) => {
            const hintText = new PIXI.Text(hint.toString(), textStyle);
            hintText.x = col * nonogramGame.cellSize + startX + 10;
            hintText.y = (hints.length - 1 - i) * 20;
            hintContainer.addChild(hintText);
        });
        
        hintContainer.y = startY - 60;
        stage.layers.get('ui').addChild(hintContainer);
        hintContainers.cols.push(hintContainer);
    }
}

function createCells(gameState, startX, startY) {
    for (let row = 0; row < gameState.gridSize; row++) {
        cellGraphics[row] = [];
        for (let col = 0; col < gameState.gridSize; col++) {
            const cell = new PIXI.Graphics();
            updateCellDisplay(cell, row, col);
            
            cell.x = col * nonogramGame.cellSize + startX;
            cell.y = row * nonogramGame.cellSize + startY;
            cell.interactive = true;
            cell.buttonMode = true;
            cell.userData = { row, col };
            
            const handleClick = (rightClick) => (event) => {
                const result = nonogramGame.handleCellClick(row, col, rightClick);
                if (result.success) updateDisplay();
                if (rightClick) event.preventDefault();
                event.stopPropagation();
            };
            
            cell.on('click', handleClick(false));
            cell.on('rightclick', handleClick(true));
            
            cell.on('mouseover', () => {
                const gameState = nonogramGame.getGameState();
                if (gameState.grid[row][col] === 0) cell.alpha = 0.8;
            });
            
            cell.on('mouseout', () => cell.alpha = 1.0);
            
            gridContainer.addChild(cell);
            cellGraphics[row][col] = cell;
        }
    }
}

function updateCellDisplay(cell, row, col) {
    cell.clear();
    
    const gameState = nonogramGame.getGameState();
    const cellState = gameState.grid[row][col];
    const isCorrect = nonogramGame.isCellCorrect(row, col);
    
    cell.lineStyle(2, 0x666666);
    
    const colors = {
        correct: 0x4CAF50,
        incorrect: 0xF44336,
        marked: 0x9E9E9E,
        empty: 0x222222
    };
    
    let fillColor = colors.empty;
    if (cellState === 1) fillColor = isCorrect ? colors.correct : colors.incorrect;
    else if (cellState === -1) fillColor = colors.marked;
    
    cell.beginFill(fillColor);
    cell.drawRect(0, 0, nonogramGame.cellSize - 2, nonogramGame.cellSize - 2);
    cell.endFill();
    
    if (cellState === -1) {
        cell.lineStyle(3, 0xFFFFFF);
        const margin = 8;
        const size = nonogramGame.cellSize - margin - 2;
        cell.moveTo(margin, margin);
        cell.lineTo(size, size);
        cell.moveTo(size, margin);
        cell.lineTo(margin, size);
    }
}

function updateDisplay() {
    const gameState = nonogramGame.getGameState();
    
    for (let row = 0; row < gameState.gridSize; row++) {
        for (let col = 0; col < gameState.gridSize; col++) {
            if (cellGraphics[row]?.[col]) {
                updateCellDisplay(cellGraphics[row][col], row, col);
            }
        }
    }
    updateGameStatus();
}

function updateGameStatus() {
    const statusElement = document.getElementById('game-status');
    if (!statusElement) return;
    
    const gameState = nonogramGame.getGameState();
    
    const statusMessages = {
        complete: `
            <div style="color: #4CAF50; font-size: 24px;">🎉 COMPLETED! 🎉</div>
            <div>Mistakes: ${gameState.mistakes}</div>
        `,
        gameOver: `
            <div style="color: #F44336; font-size: 20px;">❌ GAME OVER ❌</div>
            <div>Too many mistakes!</div>
            <div>Mistakes: ${gameState.mistakes}/${gameState.maxMistakes}</div>
        `,
        playing: `
            <div>Mistakes: ${gameState.mistakes}/${gameState.maxMistakes}</div>
            <div style="font-size: 14px; margin-top: 8px;">
                Left click: Fill/Empty<br>
                Right click: Mark/Unmark
            </div>
        `
    };
    
    let status = 'playing';
    if (gameState.isComplete) status = 'complete';
    else if (gameState.isGameOver) status = 'gameOver';
    
    statusElement.innerHTML = statusMessages[status];
}

function newGame() {
    nonogramGame.newGame();
    createGrid(stage);
    updateDisplay();
}

function resetGame() {
    nonogramGame.reset();
    updateDisplay();
}

function showSolution() {
    nonogramGame.showSolution();
    updateDisplay();
}
