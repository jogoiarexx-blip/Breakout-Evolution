// ui.js - Interface de Menus Otimizada
class UI {
    constructor() {
        this.menuOption = 0;
        this.shopOption = 0;
        this.levelSelectOption = 0;
        this.lastInputTime = 0;
        this.inputDelay = 150; // ms entre inputs
        
        // Armazena handler para cleanup
        this.keyHandler = null;
        this.setupInput();
    }

    setupInput() {
        // Remove handler anterior se existir
        if (this.keyHandler) {
            window.removeEventListener('keydown', this.keyHandler);
        }
        
        this.keyHandler = (e) => {
            const now = Date.now();
            if (now - this.lastInputTime < this.inputDelay) return;
            
            switch(Game.state) {
                case 'MENU':
                    this.handleMenuInput(e);
                    break;
                case 'SHOP':
                    this.handleShopInput(e);
                    break;
                case 'LEVEL_SELECT':
                    this.handleLevelSelectInput(e);
                    break;
                case 'SETTINGS':
                    this.handleSettingsInput(e);
                    break;
                case 'PAUSED':
                    this.handlePausedInput(e);
                    break;
                case 'GAME_OVER':
                    this.handleGameOverInput(e);
                    break;
            }
            
            this.lastInputTime = now;
        };
        
        window.addEventListener('keydown', this.keyHandler);
    }

    handleMenuInput(e) {
        const maxOptions = 8; // menu principal
        
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
            this.menuOption = Math.max(0, this.menuOption - 1);
        }
        if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
            this.menuOption = Math.min(maxOptions - 1, this.menuOption + 1);
        }
        if (e.key === 'Enter' || e.code === 'Space') {
            this.selectMenuOption();
        }
    }

    selectMenuOption() {
        switch(this.menuOption) {
            case 0: // Jogar
                Game.state = 'LEVEL_SELECT';
                this.levelSelectOption = Math.max(0, Math.min((Game.progression?.maxSelectable()||1)-1, (Game.data.level||1)-1));
                break;
            case 1: // Loja
                Game.state = 'SHOP';
                this.shopOption = 0;
                break;
            case 2: // Conquistas
                Game.state = 'ACHIEVEMENTS';
                break;
            case 3: // Placar
                Game.state = 'LEADERBOARD';
                break;
            case 4: // Estatísticas
                Game.state = 'STATISTICS';
                break;
            case 5: // Configurações
                Game.state = 'SETTINGS';
                this.settingsOption = 0;
                break;
            case 6: // Controles
                this.showControls();
                break;
            case 7: // Créditos
                this.showCredits();
                break;
        }
    }

    startGame(startLevel = 1) {
        // ✅ Valida que componentes existem
        if (!Game.brickManager || !Game.ball || !Game.paddle) {
            console.error('❌ Game components not initialized!');
            alert('Erro ao iniciar jogo. Por favor, recarregue a página.');
            return;
        }
        
        // ✅ Verifica se Game.data existe
        if (!Game.data) {
            console.error('❌ Game.data não existe!');
            alert('Erro ao iniciar jogo. Por favor, recarregue a página.');
            return;
        }
        
        // Reset do jogo
        Game.data.score = 0;
        Game.data.level = startLevel;
        
        // Dificuldade selecionada altera vidas e física
        const difficulty = Game.settings ? Game.settings.difficulty() : CONFIG.DIFFICULTY.NORMAL;
        let bossLifeBonus = 0;
        try {
            const rewards = JSON.parse(localStorage.getItem('breakout_boss_rewards_v043') || '{}');
            bossLifeBonus = Object.keys(rewards).filter(k => rewards[k] && Number(k.split('_')[1]) % 10 === 0).length;
        } catch (e) {}
        Game.data.maxLives = Math.min(8, difficulty.lives + bossLifeBonus);
        Game.data.lives = Game.data.maxLives;
        
        // ✅ STATS: Registra início de jogo
        if (Game.stats) {
            Game.stats.recordGameStart();
        }
        
        const prepare = () => { Game.brickManager.loadLevel(startLevel); Game.ball.reset(); Game.paddle.reset(); };
        if (Game.levelLoader) { Game.levelLoader.load(startLevel, prepare); } else { prepare(); Game.state = 'PLAYING'; }
        
        if (Game.hud) {
            Game.hud.combo = 0;
            Game.hud.maxCombo = 0;
            Game.hud.displayScore = 0;
        }
        
        // ✅ POWER-UPS: Limpa power-ups ativos
        if (Game.powerUpManager) {
            Game.powerUpManager.clear();
        }
        
        // ✅ FIX: Cancela timers de power-ups de duração pendentes da partida anterior
        if (Game.activePowerUpTimers) {
            Object.values(Game.activePowerUpTimers).forEach(t => clearTimeout(t));
            Game.activePowerUpTimers = {};
        }
        
        if (!Game.levelLoader) Game.state = 'PLAYING';
    }

    handleLevelSelectInput(e) {
        const max = Math.min(25, Game.progression?.maxSelectable() || 1);
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.levelSelectOption=Math.max(0,this.levelSelectOption-1);
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.levelSelectOption=Math.min(max-1,this.levelSelectOption+1);
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') this.levelSelectOption=Math.max(0,this.levelSelectOption-5);
        if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') this.levelSelectOption=Math.min(max-1,this.levelSelectOption+5);
        if (e.key === 'Enter' || e.code === 'Space') this.startGame(this.levelSelectOption+1);
        if (e.key === 'Escape') Game.state='MENU';
    }

    drawLevelSelect() {
        const ctx=Game.ctx;ctx.fillStyle='rgba(3,8,16,.78)';ctx.fillRect(0,0,Game.width,Game.height);
        ctx.textAlign='center';ctx.font='800 36px Orbitron,Arial';ctx.fillStyle='#e9fbff';ctx.fillText('SELEÇÃO DE FASE',Game.width/2,66);
        ctx.font='14px Rajdhani,Arial';ctx.fillStyle='#7fa4b7';ctx.fillText('Conclua fases para desbloquear as próximas',Game.width/2,92);
        const max=Math.min(25,Game.progression?.maxSelectable()||1), cols=5, boxW=124,boxH=70,gap=12,startX=66,startY=132;
        for(let i=0;i<25;i++){
            const level=i+1,row=Math.floor(i/cols),col=i%cols,x=startX+col*(boxW+gap),y=startY+row*(boxH+gap),unlocked=level<=max,sel=this.levelSelectOption===i;
            const world=Game.worlds?.get(level), special=Game.worlds?.isBoss(level)?'BOSS':(Game.worlds?.isMiniBoss(level)?'MINI':'');
            ctx.fillStyle=sel?'rgba(0,210,255,.18)':unlocked?'rgba(8,18,30,.82)':'rgba(4,7,12,.72)';ctx.fillRect(x,y,boxW,boxH);
            ctx.strokeStyle=sel?'#00d2ff':unlocked?(world?.accent||'#456'):'#1a2733';ctx.lineWidth=sel?2:1;ctx.strokeRect(x,y,boxW,boxH);
            ctx.textAlign='left';ctx.font='700 15px Orbitron,Arial';ctx.fillStyle=unlocked?'#e8f5fb':'#40515c';ctx.fillText(unlocked?`FASE ${String(level).padStart(2,'0')}`:'🔒 BLOQUEADA',x+10,y+23);
            ctx.font='600 11px Rajdhani,Arial';ctx.fillStyle=unlocked?(world?.accent||'#789'):'#33434d';ctx.fillText(unlocked?(special||`MUNDO ${Game.worlds?.worldIndex(level)+1}`):'—',x+10,y+44);
            if(Game.progression?.data.completed?.includes(level)){ctx.textAlign='right';ctx.fillStyle='#77ffb0';ctx.fillText('✓',x+boxW-10,y+23);}
        }
        const lvl=this.levelSelectOption+1,w=Game.worlds?.get(lvl);ctx.textAlign='center';ctx.font='700 16px Orbitron,Arial';ctx.fillStyle=w?.accent||'#00d2ff';ctx.fillText(w?`${w.name} — ${w.subtitle}`:'',Game.width/2,565);
        ctx.font='12px Rajdhani,Arial';ctx.fillStyle='#617889';ctx.fillText('SETAS/WASD navegar • ENTER jogar • ESC voltar',Game.width/2,590);
    }

    handleShopInput(e) {
        // ✅ Verifica se Game.economy existe
        if (!Game.economy) {
            console.error('Game.economy não existe!');
            return;
        }
        
        const upgrades = Object.keys(Game.economy.upgrades);
        const maxOptions = upgrades.length;
        
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
            this.shopOption = Math.max(0, this.shopOption - 1);
        }
        if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
            this.shopOption = Math.min(maxOptions - 1, this.shopOption + 1);
        }
        if (e.key === 'Escape') {
            Game.state = 'MENU';
            this.menuOption = 0;
        }
        if (e.key === 'Enter' || e.code === 'Space') {
            this.buyUpgrade(upgrades[this.shopOption]);
        }
    }

    buyUpgrade(key) {
        if (!Game.economy) {
            console.error('Game.economy não existe!');
            return;
        }
        
        if (Game.economy.buy(key)) {
            // Sucesso
            Game.particles.emit(Game.width / 2, Game.height / 2, 30, '#FFD700');
        } else {
            // Falha - moedas insuficientes ou max level
            const upgrade = Game.economy.upgrades[key];
            if (upgrade.level >= upgrade.maxLevel) {
                // Já está no máximo
                Game.particles.emit(Game.width / 2, Game.height / 2, 20, '#888');
            } else {
                // Moedas insuficientes
                Game.particles.emit(Game.width / 2, Game.height / 2, 20, '#f44336');
            }
        }
    }

    handlePausedInput(e) {
        if (e.key === 'p' || e.key === 'P') {
            Game.state = 'PLAYING';
        }
        if (e.key === 'Escape') {
            Game.state = 'MENU';
        }
    }

    handleGameOverInput(e) {
        if (e.key === 'r' || e.key === 'R') {
            this.startGame();
        }
        if (e.key === 'Escape') {
            Game.state = 'MENU';
        }
    }

    showControls() {
        alert(
            '🎮 CONTROLES 🎮\n\n' +
            '⌨️ MOVIMENTO:\n' +
            '• Setas ← → ou teclas A/D\n' +
            '• Siga o mouse\n\n' +
            '🎯 AÇÕES:\n' +
            '• ESPAÇO - Lançar bola\n' +
            '• P - Pausar\n' +
            '• ESC - Menu\n\n' +
            '💰 SISTEMA:\n' +
            '• Quebre tijolos para ganhar moedas\n' +
            '• Use moedas para comprar upgrades\n' +
            '• Mantenha combos para bônus!'
        );
    }

    showCredits() {
        alert(
            '🎮 MODERN BREAKOUT 🎮\n\n' +
            'Desenvolvido com JavaScript Puro\n' +
            'Canvas API & HTML5\n\n' +
            '✨ Features:\n' +
            '• Sistema de Upgrades\n' +
            '• Combo System\n' +
            '• Particle Effects\n' +
            '• Progressive Difficulty\n\n' +
            'Breakout Evolution v0.4.3'
        );
    }

    handleSettingsInput(e) {
        const max = 4;
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') this.settingsOption = Math.max(0, (this.settingsOption || 0) - 1);
        if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') this.settingsOption = Math.min(max - 1, (this.settingsOption || 0) + 1);
        const dir = (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') ? -1 : (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') ? 1 : 0;
        if (dir && Game.settings) {
            if (this.settingsOption === 0) Game.settings.cycle('graphics', dir);
            if (this.settingsOption === 1) Game.settings.cycle('difficulty', dir);
            if (this.settingsOption === 2) Game.settings.toggleAudio();
        }
        if (e.key === 'Enter' || e.code === 'Space') {
            if (this.settingsOption === 0) Game.settings.cycle('graphics', 1);
            else if (this.settingsOption === 1) Game.settings.cycle('difficulty', 1);
            else if (this.settingsOption === 2) Game.settings.toggleAudio();
            else Game.state = 'MENU';
        }
        if (e.key === 'Escape') Game.state = 'MENU';
    }

    drawMenu() {
        const ctx = Game.ctx, t = Date.now()/1000;
        const g = ctx.createLinearGradient(0,0,Game.width,Game.height);
        g.addColorStop(0,'rgba(7,16,29,.72)'); g.addColorStop(.52,`rgba(13,55,82,${.30 + Math.sin(t)*.04})`); g.addColorStop(1,'rgba(6,8,18,.78)');
        ctx.fillStyle=g;ctx.fillRect(0,0,Game.width,Game.height);
        if (!Game.settings || Game.settings.effectiveGraphics !== 'LOW') {
            ctx.strokeStyle='rgba(0,210,255,.10)';ctx.lineWidth=1;
            for(let x=0;x<Game.width;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,Game.height);ctx.stroke();}
            for(let y=0;y<Game.height;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(Game.width,y);ctx.stroke();}
        }
        ctx.textAlign='center';ctx.font='900 58px Orbitron, Arial';ctx.fillStyle='#dff8ff';
        if(!Game.settings || Game.settings.shadows()){ctx.shadowBlur=24;ctx.shadowColor='#00d2ff';}
        ctx.fillText('BREAKOUT',Game.width/2,98);ctx.shadowBlur=0;
        ctx.font='700 18px Orbitron, Arial';ctx.fillStyle='#00d2ff';ctx.fillText('EVOLUTION',Game.width/2,130);ctx.font='600 11px Orbitron, Arial';ctx.fillStyle='#ffd166';ctx.fillText('v0.4.3',Game.width/2,149);
        ctx.font='14px Rajdhani, Arial';ctx.fillStyle='#7f9aaa';ctx.fillText('ARCADE • UPGRADES • POWER-UPS',Game.width/2,172);
        const options=['▶  JOGAR','◆  LOJA','★  CONQUISTAS','▣  PLACAR','⌁  ESTATÍSTICAS','⚙  CONFIGURAÇÕES','⌨  CONTROLES','ⓘ  CRÉDITOS'];
        const cols=2,startX=Game.width/2-174,startY=224,w=330,h=48,gapX=18,gapY=14;
        options.forEach((text,i)=>{const col=i%cols,row=Math.floor(i/cols),x=startX+col*(w+gapX),y=startY+row*(h+gapY),sel=i===this.menuOption;
            ctx.fillStyle=sel?'rgba(0,210,255,.16)':'rgba(5,12,22,.72)';ctx.fillRect(x,y,w,h);ctx.strokeStyle=sel?'#00d2ff':'rgba(104,146,170,.28)';ctx.lineWidth=sel?2:1;ctx.strokeRect(x,y,w,h);
            ctx.textAlign='left';ctx.font=sel?'700 18px Orbitron, Arial':'600 17px Rajdhani, Arial';ctx.fillStyle=sel?'#ffd166':'#c9d5df';ctx.fillText(text,x+18,y+30);
        });
        this.drawMenuFooter();
    }

    drawMenuFooter() {
        const ctx=Game.ctx, y=Game.height-92;
        ctx.fillStyle='rgba(2,6,12,.82)';ctx.fillRect(28,y,Game.width-56,64);ctx.strokeStyle='rgba(0,210,255,.22)';ctx.strokeRect(28,y,Game.width-56,64);
        ctx.textAlign='left';ctx.font='600 14px Rajdhani, Arial';ctx.fillStyle='#ffd166';ctx.fillText(`MOEDAS  ${Game.data.coins}`,48,y+25);
        ctx.fillStyle='#9eb1c0';ctx.fillText(`RECORDE  ${Game.data.highScore||0}`,48,y+47);
        const d=Game.settings?Game.settings.difficulty().label:'Normal', q=Game.settings?Game.settings.graphicsLabel():'MEDIUM';
        ctx.textAlign='right';ctx.fillStyle='#8fa8b8';ctx.fillText(`DIFICULDADE  ${d.toUpperCase()}`,Game.width-48,y+25);ctx.fillText(`GRÁFICOS  ${q}`,Game.width-48,y+47);
        ctx.textAlign='center';ctx.fillStyle='#52697a';ctx.font='12px Rajdhani, Arial';ctx.fillText('↑↓ navegar  •  ENTER selecionar',Game.width/2,Game.height-9);
    }

    drawSettings() {
        const ctx=Game.ctx;ctx.fillStyle='#07101b';ctx.fillRect(0,0,Game.width,Game.height);ctx.textAlign='center';ctx.font='800 38px Orbitron,Arial';ctx.fillStyle='#00d2ff';ctx.fillText('CONFIGURAÇÕES',Game.width/2,86);
        const vals=[Game.settings.graphicsLabel(),Game.settings.difficulty().label,Game.settings.data.audio?'LIGADO':'DESLIGADO','VOLTAR'];
        const labels=['QUALIDADE GRÁFICA','DIFICULDADE','ÁUDIO',''];
        for(let i=0;i<4;i++){const y=172+i*82,sel=(this.settingsOption||0)===i;ctx.fillStyle=sel?'rgba(0,210,255,.15)':'rgba(255,255,255,.025)';ctx.fillRect(150,y,500,60);ctx.strokeStyle=sel?'#00d2ff':'#243446';ctx.strokeRect(150,y,500,60);ctx.font='600 15px Orbitron,Arial';ctx.fillStyle='#91a9b9';ctx.textAlign='left';ctx.fillText(labels[i],174,y+25);ctx.font='700 17px Orbitron,Arial';ctx.textAlign='right';ctx.fillStyle=sel?'#ffd166':'#d5e1e8';ctx.fillText(i<3?`◀  ${vals[i]}  ▶`:vals[i],626,y+37);}
        ctx.textAlign='center';ctx.font='14px Rajdhani,Arial';ctx.fillStyle='#718899';ctx.fillText('AUTO monitora o dispositivo e pode reduzir efeitos para manter FPS estável.',Game.width/2,535);ctx.fillText('ESC voltar',Game.width/2,566);
    }

    drawShop() {
        const ctx = Game.ctx;
        
        // Background
        ctx.fillStyle = '#0f0f15';
        ctx.fillRect(0, 0, Game.width, Game.height);

        // Header
        this.drawShopHeader();
        
        // ✅ Verifica se Game.economy existe
        if (!Game.economy) {
            ctx.fillStyle = '#ff4444';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Erro: Sistema de economia não carregado', Game.width / 2, Game.height / 2);
            return;
        }
        
        // Lista de upgrades
        const upgrades = Game.economy.getAllUpgrades();
        const startY = 130;
        const itemHeight = 90;
        
        upgrades.forEach((upgrade, i) => {
            const y = startY + i * itemHeight;
            this.drawUpgradeItem(upgrade, i, y);
        });
        
        // Footer
        this.drawShopFooter();
    }

    drawShopHeader() {
        const ctx = Game.ctx;
        
        // Título
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#FFD700';
        ctx.fillText('🛒 LOJA', Game.width / 2, 60);
        ctx.shadowBlur = 0;
        
        // Saldo
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#4CAF50';
        
        // ✅ Verifica Game.data
        const coins = Game.data ? Game.data.coins : 0;
        ctx.fillText(`💰 Saldo: $${coins}`, Game.width / 2, 95);
    }

    drawUpgradeItem(upgrade, index, y) {
        const ctx = Game.ctx;
        const isSelected = index === this.shopOption;
        const boxPadding = 30;
        const boxWidth = Game.width - boxPadding * 2;
        const boxHeight = 75;
        
        // Background
        if (isSelected) {
            ctx.fillStyle = 'rgba(0, 210, 255, 0.15)';
        } else {
            ctx.fillStyle = 'rgba(50, 50, 60, 0.3)';
        }
        ctx.fillRect(boxPadding, y - 10, boxWidth, boxHeight);
        
        // Borda
        ctx.strokeStyle = isSelected ? '#00d2ff' : 'rgba(100, 100, 120, 0.5)';
        ctx.lineWidth = isSelected ? 3 : 1;
        ctx.strokeRect(boxPadding, y - 10, boxWidth, boxHeight);
        
        // Nome do upgrade
        ctx.textAlign = 'left';
        ctx.fillStyle = isSelected ? '#00d2ff' : '#fff';
        ctx.font = isSelected ? 'bold 24px Arial' : 'bold 20px Arial';
        ctx.fillText(upgrade.name, boxPadding + 20, y + 15);
        
        // Descrição
        ctx.font = '14px Arial';
        ctx.fillStyle = '#aaa';
        ctx.fillText(upgrade.description, boxPadding + 20, y + 38);
        
        // Nível
        ctx.font = '16px Arial';
        ctx.fillStyle = '#888';
        const levelText = `Nível ${upgrade.level}/${upgrade.maxLevel}`;
        ctx.fillText(levelText, boxPadding + 20, y + 58);
        
        // Barra de progresso do nível
        const barWidth = 100;
        const barHeight = 6;
        const barX = boxPadding + 150;
        const barY = y + 50;
        
        ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(barX, barY, barWidth * (upgrade.level / upgrade.maxLevel), barHeight);
        
        // Custo/Status
        ctx.textAlign = 'right';
        
        if (upgrade.level >= upgrade.maxLevel) {
            ctx.fillStyle = '#4CAF50';
            ctx.font = 'bold 20px Arial';
            ctx.fillText('✓ MÁXIMO', Game.width - boxPadding - 20, y + 30);
        } else {
            const canAfford = upgrade.canBuy;
            ctx.fillStyle = canAfford ? '#FFD700' : '#f44336';
            ctx.font = 'bold 24px Arial';
            ctx.fillText(`$${upgrade.cost}`, Game.width - boxPadding - 20, y + 30);
            
            // Indicador de disponibilidade
            if (canAfford && isSelected) {
                ctx.fillStyle = '#4CAF50';
                ctx.font = '14px Arial';
                ctx.fillText('ENTER para comprar', Game.width - boxPadding - 20, y + 50);
            }
        }
    }

    drawShopFooter() {
        const ctx = Game.ctx;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, Game.height - 50, Game.width, 50);
        
        ctx.textAlign = 'center';
        ctx.fillStyle = '#666';
        ctx.font = '16px Arial';
        ctx.fillText(
            '↑↓ Navegar | ENTER Comprar | ESC Voltar',
            Game.width / 2,
            Game.height - 20
        );
    }

    drawPaused() {
        if (Game.hud) {
            Game.hud.drawPauseMenu();
        }
    }

    drawGameOver() {
        if (Game.hud) {
            Game.hud.drawGameOverScreen();
        }
    }

    destroy() {
        if (this.keyHandler) {
            window.removeEventListener('keydown', this.keyHandler);
        }
    }
}
