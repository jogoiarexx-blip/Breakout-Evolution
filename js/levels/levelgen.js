// levelgen.js - Gerador Procedural de Níveis
class LevelGenerator {
    constructor() {
        this.patterns = [
            'rainbow', 'checkerboard', 'spiral', 'diamond', 
            'pyramid', 'cross', 'walls', 'random', 'circle',
            'zigzag', 'fortress', 'honeycomb'
        ];
    }
    
    // Gera nível baseado no número e dificuldade
    generate(levelNumber) {
        const difficulty = this.calculateDifficulty(levelNumber);
        
        // Encontros especiais: mini-boss a cada 5 e boss a cada 10
        if (levelNumber % 10 === 0) return this.generateBossLevel(levelNumber);
        if (levelNumber % 5 === 0) return this.generateMiniBossLevel(levelNumber);
        
        // Escolhe padrão baseado no nível
        const patternIndex = (levelNumber - 1) % this.patterns.length;
        const pattern = this.patterns[patternIndex];
        
        console.log(`🎨 Gerando nível ${levelNumber} - Padrão: ${pattern} - Dificuldade: ${difficulty}`);
        
        switch(pattern) {
            case 'rainbow':
                return this.generateRainbow(difficulty);
            case 'checkerboard':
                return this.generateCheckerboard(difficulty);
            case 'spiral':
                return this.generateSpiral(difficulty);
            case 'diamond':
                return this.generateDiamond(difficulty);
            case 'pyramid':
                return this.generatePyramid(difficulty);
            case 'cross':
                return this.generateCross(difficulty);
            case 'walls':
                return this.generateWalls(difficulty);
            case 'random':
                return this.generateRandom(difficulty);
            case 'circle':
                return this.generateCircle(difficulty);
            case 'zigzag':
                return this.generateZigzag(difficulty);
            case 'fortress':
                return this.generateFortress(difficulty);
            case 'honeycomb':
                return this.generateHoneycomb(difficulty);
            default:
                return this.generateRainbow(difficulty);
        }
    }
    
    calculateDifficulty(levelNumber) {
        // Dificuldade aumenta gradualmente
        return Math.min(Math.floor(levelNumber / 3) + 1, 10);
    }
    
    getBrickType(difficulty, forceSpecial = false) {
        if (forceSpecial) return Math.random() < .6 ? 'coin' : 'explosive';
        if (Game.worlds) return Game.worlds.chooseBrick(Game.data?.level || 1, difficulty);
        const types = ['normal', 'strong', 'metal', 'diamond'];
        const specialRoll = Math.random();
        if (specialRoll < 0.08) return specialRoll < 0.05 ? 'coin' : 'explosive';
        const maxType = Math.min(Math.floor(difficulty / 2.5), types.length - 1);
        return types[Math.floor(Math.random() * (maxType + 1))];
    }
    
    // ========================================
    // PADRÕES DE NÍVEIS
    // ========================================
    
    generateRainbow(difficulty) {
        const layout = [];
        const rows = 6 + Math.floor(difficulty / 2);
        const cols = 10;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                layout.push({
                    row, col,
                    type: this.getBrickType(difficulty)
                });
            }
        }
        
        return layout;
    }
    
    generateCheckerboard(difficulty) {
        const layout = [];
        const rows = 8;
        const cols = 10;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                // Padrão xadrez
                if ((row + col) % 2 === 0) {
                    layout.push({
                        row, col,
                        type: this.getBrickType(difficulty)
                    });
                }
            }
        }
        
        return layout;
    }
    
    generateSpiral(difficulty) {
        const layout = [];
        const centerX = 5;
        const centerY = 4;
        const maxRadius = 6;
        
        for (let angle = 0; angle < Math.PI * 8; angle += 0.3) {
            const radius = (angle / (Math.PI * 8)) * maxRadius;
            const col = Math.round(centerX + Math.cos(angle) * radius);
            const row = Math.round(centerY + Math.sin(angle) * radius);
            
            if (col >= 0 && col < 10 && row >= 0 && row < 10) {
                // Evita duplicatas
                const exists = layout.find(b => b.row === row && b.col === col);
                if (!exists) {
                    layout.push({
                        row, col,
                        type: this.getBrickType(difficulty)
                    });
                }
            }
        }
        
        return layout;
    }
    
    generateDiamond(difficulty) {
        const layout = [];
        const centerX = 5;
        const centerY = 4;
        const size = 5;
        
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
                const dist = Math.abs(col - centerX) + Math.abs(row - centerY);
                if (dist <= size) {
                    layout.push({
                        row, col,
                        type: this.getBrickType(difficulty)
                    });
                }
            }
        }
        
        return layout;
    }
    
    generatePyramid(difficulty) {
        const layout = [];
        const rows = 9;
        
        for (let row = 0; row < rows; row++) {
            const bricksInRow = 10 - row;
            const offset = Math.floor(row / 2);
            
            for (let i = 0; i < bricksInRow; i++) {
                layout.push({
                    row,
                    col: offset + i,
                    type: this.getBrickType(difficulty)
                });
            }
        }
        
        return layout;
    }
    
    generateCross(difficulty) {
        const layout = [];
        const centerCol = 5;
        const centerRow = 4;
        
        // Linha vertical
        for (let row = 0; row < 10; row++) {
            layout.push({
                row,
                col: centerCol,
                type: this.getBrickType(difficulty)
            });
        }
        
        // Linha horizontal
        for (let col = 0; col < 10; col++) {
            if (col !== centerCol) {
                layout.push({
                    row: centerRow,
                    col,
                    type: this.getBrickType(difficulty)
                });
            }
        }
        
        return layout;
    }
    
    generateWalls(difficulty) {
        const layout = [];
        
        // Paredes laterais
        for (let row = 0; row < 10; row++) {
            layout.push({ row, col: 0, type: this.getBrickType(difficulty) });
            layout.push({ row, col: 9, type: this.getBrickType(difficulty) });
        }
        
        // Algumas fileiras no meio
        for (let row = 2; row < 8; row += 2) {
            for (let col = 2; col < 8; col++) {
                layout.push({
                    row, col,
                    type: this.getBrickType(difficulty)
                });
            }
        }
        
        return layout;
    }
    
    generateCircle(difficulty) {
        const layout = [];
        const centerX = 5;
        const centerY = 5;
        const radius = 4;
        
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
                const dist = Math.sqrt(
                    Math.pow(col - centerX, 2) + 
                    Math.pow(row - centerY, 2)
                );
                
                if (dist <= radius && dist >= radius - 2) {
                    layout.push({
                        row, col,
                        type: this.getBrickType(difficulty)
                    });
                }
            }
        }
        
        return layout;
    }
    
    generateZigzag(difficulty) {
        const layout = [];
        
        for (let row = 0; row < 8; row++) {
            const offset = row % 2 === 0 ? 0 : 3;
            for (let col = offset; col < offset + 7; col++) {
                if (col < 10) {
                    layout.push({
                        row, col,
                        type: this.getBrickType(difficulty)
                    });
                }
            }
        }
        
        return layout;
    }
    
    generateFortress(difficulty) {
        const layout = [];
        
        // Torres nas pontas
        for (let row = 0; row < 6; row++) {
            layout.push({ row, col: 0, type: 'metal' });
            layout.push({ row, col: 1, type: 'metal' });
            layout.push({ row, col: 8, type: 'metal' });
            layout.push({ row, col: 9, type: 'metal' });
        }
        
        // Muralha
        for (let col = 2; col < 8; col++) {
            layout.push({ row: 0, col, type: 'strong' });
            layout.push({ row: 3, col, type: this.getBrickType(difficulty) });
        }
        
        return layout;
    }
    
    generateHoneycomb(difficulty) {
        const layout = [];
        
        for (let row = 0; row < 9; row++) {
            const offset = row % 2 === 0 ? 0 : 0.5;
            for (let col = 0; col < 10; col++) {
                if ((col + Math.floor(offset)) < 10) {
                    layout.push({
                        row,
                        col: col + Math.floor(offset),
                        type: this.getBrickType(difficulty)
                    });
                }
            }
        }
        
        return layout;
    }
    
    generateRandom(difficulty) {
        const layout = [];
        const brickCount = 30 + Math.floor(difficulty * 5);
        
        for (let i = 0; i < brickCount; i++) {
            const row = Math.floor(Math.random() * 8);
            const col = Math.floor(Math.random() * 10);
            
            // Evita duplicatas
            const exists = layout.find(b => b.row === row && b.col === col);
            if (!exists) {
                layout.push({
                    row, col,
                    type: this.getBrickType(difficulty)
                });
            }
        }
        
        return layout;
    }
    
    // ========================================
    // BOSS LEVELS
    // ========================================
    
    generateMiniBossLevel(levelNumber) {
        const layout=[];
        const hp=8+Math.floor(levelNumber/5)*3;
        // núcleo compacto + guardas laterais
        const core=[{row:2,col:4},{row:2,col:5},{row:3,col:4},{row:3,col:5}];
        core.forEach(p=>layout.push({...p,type:'strong',isBoss:true,isMiniBoss:true,bossHealth:hp}));
        for(let c=1;c<9;c+=2) layout.push({row:0,col:c,type:c%4===1?'metal':'explosive'});
        for(let c=0;c<10;c++) if(c!==4&&c!==5) layout.push({row:5,col:c,type:this.getBrickType(this.calculateDifficulty(levelNumber))});
        return layout;
    }

    generateBossLevel(levelNumber) {
        const bossNumber = levelNumber / 10;
        console.log(`👾 BOSS LEVEL ${bossNumber}!`);
        
        const layout = [];
        
        // Boss é um brick gigante no centro
        const bossRow = 2;
        const bossCol = 3;
        const bossWidth = 4;
        const bossHeight = 3;
        
        // Corpo do boss
        for (let row = bossRow; row < bossRow + bossHeight; row++) {
            for (let col = bossCol; col < bossCol + bossWidth; col++) {
                layout.push({
                    row, col,
                    type: 'diamond',
                    isBoss: true,
                    bossHealth: 20 + (bossNumber * 10)
                });
            }
        }
        
        // Minions ao redor
        const minionPositions = [
            {row: 0, col: 1}, {row: 0, col: 8},
            {row: 5, col: 0}, {row: 5, col: 9},
            {row: 7, col: 2}, {row: 7, col: 7}
        ];
        
        minionPositions.forEach(pos => {
            layout.push({
                row: pos.row,
                col: pos.col,
                type: 'metal'
            });
        });
        
        return layout;
    }
}
