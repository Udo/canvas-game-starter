class NonogramGame {

    constructor() {
        this.gridSize = 10;
        this.cellSize = 40;
        this.grid = [];
        this.solution = [];
        this.rowHints = [];
        this.colHints = [];
        this.isComplete = false;
        this.mistakes = 0;
        this.maxMistakes = 3;
        
        this.initializeGame();
    }
    
    initializeGame() {
        this.grid = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(0)); // 0 = empty, 1 = filled, -1 = marked as empty
        this.generateSolution();
        this.calculateHints();
    }
    
    generateSolution() {
        const patterns = [

            [
                [0,0,1,1,0,0,1,1,0,0],
                [0,1,1,1,1,1,1,1,1,0],
                [1,1,1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1,1,1],
                [0,1,1,1,1,1,1,1,1,0],
                [0,0,1,1,1,1,1,1,0,0],
                [0,0,0,1,1,1,1,0,0,0],
                [0,0,0,0,1,1,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0]
            ],

            [
                [0,0,0,1,1,1,1,0,0,0],
                [0,0,1,1,1,1,1,1,0,0],
                [0,1,1,1,1,1,1,1,1,0],
                [1,1,1,1,1,1,1,1,1,1],
                [1,0,1,1,1,1,1,1,0,1],
                [1,0,1,0,1,1,0,1,0,1],
                [1,0,1,0,1,1,0,1,0,1],
                [1,0,1,1,0,0,1,1,0,1],
                [1,0,0,0,0,0,0,0,0,1],
                [1,1,1,1,1,1,1,1,1,1]
            ]
        ];
        
        this.solution = patterns[Math.floor(Math.random() * patterns.length)];
    }
    
    calculateHints() {

        this.rowHints = [];
        for (let row = 0; row < this.gridSize; row++) {
            let hints = [];
            let count = 0;
            for (let col = 0; col < this.gridSize; col++) {
                if (this.solution[row][col] === 1) {
                    count++;
                } else {
                    if (count > 0) {
                        hints.push(count);
                        count = 0;
                    }
                }
            }
            if (count > 0) hints.push(count);
            if (hints.length === 0) hints.push(0);
            this.rowHints.push(hints);
        }
        
        this.colHints = [];
        for (let col = 0; col < this.gridSize; col++) {
            let hints = [];
            let count = 0;
            for (let row = 0; row < this.gridSize; row++) {
                if (this.solution[row][col] === 1) {
                    count++;
                } else {
                    if (count > 0) {
                        hints.push(count);
                        count = 0;
                    }
                }
            }
            if (count > 0) hints.push(count);
            if (hints.length === 0) hints.push(0);
            this.colHints.push(hints);
        }
    }
    
    toggleCell(row, col, rightClick = false) {
        if (this.isComplete) return;
        
        if (rightClick) {
            this.grid[row][col] = this.grid[row][col] === -1 ? 0 : -1;
        } else {
            this.grid[row][col] = this.grid[row][col] === 1 ? 0 : 1;
        }
        
        this.checkForErrors();
        this.checkForCompletion();
    }
    
    checkForErrors() {
        let errorCount = 0;
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row][col] === 1 && this.solution[row][col] === 0) {
                    errorCount++;
                }
            }
        }
        this.mistakes = errorCount;
    }
    
    checkForCompletion() {
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.solution[row][col] === 1 && this.grid[row][col] !== 1) {
                    return false;
                }
                if (this.solution[row][col] === 0 && this.grid[row][col] === 1) {
                    return false;
                }
            }
        }
        this.isComplete = true;
        return true;
    }
    
    reset() {
        this.grid = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(0));
        this.isComplete = false;
        this.mistakes = 0;
    }
    
    newGame() {
        this.generateSolution();
        this.calculateHints();
        this.reset();
    }
    
    showSolution() {
        this.grid = this.solution.map(row => [...row]);
        this.isComplete = true;
    }
}

// Game instance
let nonogramGame;
let stage;
let gridContainer;
let hintContainers = { rows: [], cols: [] };
let cellGraphics = [];

// Initialize game when DOM loads
function initNonogram() {
    nonogramGame = new NonogramGame();
    updateDisplay();
}

function createGrid(stage) {
    if (gridContainer) {
        gridContainer.destroy();
    }
    
    gridContainer = new PIXI.Container();
    stage.layers.get('game').addChild(gridContainer);
    
    hintContainers.rows.forEach(container => container.destroy());
    hintContainers.cols.forEach(container => container.destroy());
    hintContainers.rows = [];
    hintContainers.cols = [];
    
    cellGraphics = [];
    
    const hintSpaceX = 120;
    const hintSpaceY = 80;
    const startX = hintSpaceX;
    const startY = hintSpaceY;
    
    for (let row = 0; row < nonogramGame.gridSize; row++) {
        const hintContainer = new PIXI.Container();
        const hints = nonogramGame.rowHints[row];
        
        for (let i = 0; i < hints.length; i++) {
            const hintText = new PIXI.Text(hints[i].toString(), {
                fontSize: 16,
                fill: 0xFFFFFF,
                fontFamily: 'Arial'
            });
            hintText.x = (hints.length - 1 - i) * 25;
            hintText.y = row * nonogramGame.cellSize + startY + 10;
            hintContainer.addChild(hintText);
        }
        
        hintContainer.x = startX - 100;
        stage.layers.get('ui').addChild(hintContainer);
        hintContainers.rows.push(hintContainer);
    }
    
    for (let col = 0; col < nonogramGame.gridSize; col++) {
        const hintContainer = new PIXI.Container();
        const hints = nonogramGame.colHints[col];
        
        for (let i = 0; i < hints.length; i++) {
            const hintText = new PIXI.Text(hints[i].toString(), {
                fontSize: 16,
                fill: 0xFFFFFF,
                fontFamily: 'Arial'
            });
            hintText.x = col * nonogramGame.cellSize + startX + 10;
            hintText.y = (hints.length - 1 - i) * 20;
            hintContainer.addChild(hintText);
        }
        
        hintContainer.y = startY - 60;
        stage.layers.get('ui').addChild(hintContainer);
        hintContainers.cols.push(hintContainer);
    }
    
    for (let row = 0; row < nonogramGame.gridSize; row++) {
        cellGraphics[row] = [];
        for (let col = 0; col < nonogramGame.gridSize; col++) {
            const cell = new PIXI.Graphics();
            updateCellDisplay(cell, row, col);
            
            cell.x = col * nonogramGame.cellSize + startX;
            cell.y = row * nonogramGame.cellSize + startY;
            
            cell.interactive = true;
            cell.buttonMode = true;
            
            cell.userData = { row, col };
            
            cell.on('click', (event) => {
                nonogramGame.toggleCell(row, col, false);
                updateDisplay();
                event.stopPropagation();
            });
            
            cell.on('rightclick', (event) => {
                nonogramGame.toggleCell(row, col, true);
                updateDisplay();
                event.preventDefault();
                event.stopPropagation();
            });
            
            cell.on('mouseover', () => {
                if (nonogramGame.grid[row][col] === 0) {
                    cell.alpha = 0.8;
                }
            });
            
            cell.on('mouseout', () => {
                cell.alpha = 1.0;
            });
            
            gridContainer.addChild(cell);
            cellGraphics[row][col] = cell;
        }
    }
}

function updateCellDisplay(cell, row, col) {
    cell.clear();
    
    const cellState = nonogramGame.grid[row][col];
    const isCorrect = nonogramGame.solution[row][col];
    
    cell.lineStyle(2, 0x666666);
    
    if (cellState === 1) {
        // Filled cell
        if (isCorrect === 1) {
            cell.beginFill(0x4CAF50); // Green for correct
        } else {
            cell.beginFill(0xF44336); // Red for incorrect
        }
    } else if (cellState === -1) {
        // Marked as empty
        cell.beginFill(0x9E9E9E); // Gray
    } else {
        // Empty cell
        cell.beginFill(0x222222); // Dark
    }
    
    cell.drawRect(0, 0, nonogramGame.cellSize - 2, nonogramGame.cellSize - 2);
    cell.endFill();
    
    // Add X for marked cells
    if (cellState === -1) {
        cell.lineStyle(3, 0xFFFFFF);
        const margin = 8;
        cell.moveTo(margin, margin);
        cell.lineTo(nonogramGame.cellSize - margin - 2, nonogramGame.cellSize - margin - 2);
        cell.moveTo(nonogramGame.cellSize - margin - 2, margin);
        cell.lineTo(margin, nonogramGame.cellSize - margin - 2);
    }
}

function updateDisplay() {
    for (let row = 0; row < nonogramGame.gridSize; row++) {
        for (let col = 0; col < nonogramGame.gridSize; col++) {
            if (cellGraphics[row] && cellGraphics[row][col]) {
                updateCellDisplay(cellGraphics[row][col], row, col);
            }
        }
    }
    updateGameStatus();
}

function updateGameStatus() {
    const statusElement = document.getElementById('game-status');
    if (statusElement) {
        if (nonogramGame.isComplete) {
            statusElement.innerHTML = `
                <div style="color: #4CAF50; font-size: 24px;">🎉 COMPLETED! 🎉</div>
                <div>Mistakes: ${nonogramGame.mistakes}</div>
            `;
        } else if (nonogramGame.mistakes >= nonogramGame.maxMistakes) {
            statusElement.innerHTML = `
                <div style="color: #F44336; font-size: 20px;">❌ GAME OVER ❌</div>
                <div>Too many mistakes!</div>
                <div>Mistakes: ${nonogramGame.mistakes}/${nonogramGame.maxMistakes}</div>
            `;
        } else {
            statusElement.innerHTML = `
                <div>Mistakes: ${nonogramGame.mistakes}/${nonogramGame.maxMistakes}</div>
                <div style="font-size: 14px; margin-top: 8px;">
                    Left click: Fill/Empty<br>
                    Right click: Mark/Unmark
                </div>
            `;
        }
    }
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
