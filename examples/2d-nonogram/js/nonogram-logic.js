class NonogramLogic {
    constructor(gridSize = 10, maxMistakes = 3) {
        this.gridSize = gridSize;
        this.maxMistakes = maxMistakes;
        this.grid = [];
        this.solution = [];
        this.rowHints = [];
        this.colHints = [];
        this.isComplete = false;
        this.mistakes = 0;
        this.initializeGame();
    }
    
    initializeGame() {
        this.grid = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(0));
        this.generateSolution();
        this.calculateHints();
        this.isComplete = false;
        this.mistakes = 0;
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
        this.rowHints = this.getHintsForLines(this.solution);
        this.colHints = this.getHintsForLines(this.transposeMatrix(this.solution));
    }
    
    getHintsForLines(matrix) {
        return matrix.map(line => {
            const hints = [];
            let count = 0;
            line.forEach(cell => {
                if (cell === 1) {
                    count++;
                } else {
                    if (count > 0) {
                        hints.push(count);
                        count = 0;
                    }
                }
            });
            if (count > 0) hints.push(count);
            return hints.length === 0 ? [0] : hints;
        });
    }
    
    transposeMatrix(matrix) {
        return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
    }
    
    toggleCell(row, col, rightClick = false) {
        if (this.isComplete || row < 0 || row >= this.gridSize || col < 0 || col >= this.gridSize) {
            return { success: false, reason: 'invalid_move' };
        }
        
        const previousState = this.grid[row][col];
        
        if (rightClick) {
            this.grid[row][col] = this.grid[row][col] === -1 ? 0 : -1;
        } else {
            this.grid[row][col] = this.grid[row][col] === 1 ? 0 : 1;
        }
        
        this.checkForErrors();
        const wasComplete = this.isComplete;
        this.checkForCompletion();
        
        return {
            success: true,
            previousState,
            newState: this.grid[row][col],
            mistakeCount: this.mistakes,
            isComplete: this.isComplete,
            justCompleted: !wasComplete && this.isComplete
        };
    }
    
    checkForErrors() {
        this.mistakes = this.grid.flat().reduce((count, cell, index) => {
            const row = Math.floor(index / this.gridSize);
            const col = index % this.gridSize;
            return count + (cell === 1 && this.solution[row][col] === 0 ? 1 : 0);
        }, 0);
    }
    
    checkForCompletion() {
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.solution[row][col] === 1 && this.grid[row][col] !== 1) return false;
                if (this.solution[row][col] === 0 && this.grid[row][col] === 1) return false;
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
        this.mistakes = 0;
    }
    
    getGameState() {
        return {
            gridSize: this.gridSize,
            grid: this.grid.map(row => [...row]),
            solution: this.solution.map(row => [...row]),
            rowHints: this.rowHints.map(hints => [...hints]),
            colHints: this.colHints.map(hints => [...hints]),
            isComplete: this.isComplete,
            mistakes: this.mistakes,
            maxMistakes: this.maxMistakes,
            isGameOver: this.mistakes >= this.maxMistakes
        };
    }
    
    isCellCorrect(row, col) {
        if (row < 0 || row >= this.gridSize || col < 0 || col >= this.gridSize) return false;
        const cellState = this.grid[row][col];
        const solutionState = this.solution[row][col];
        return (cellState === 1 && solutionState === 1) || (cellState !== 1 && solutionState === 0);
    }
    
    getHints() {
        return {
            rows: this.rowHints.map(hints => [...hints]),
            cols: this.colHints.map(hints => [...hints])
        };
    }
}
