// ui.js - Interface de Menus Otimizada
class UI {
    constructor() {
        this.menuOption = 0;
        this.shopOption = 0;
        this.levelSelectOption = 0;
        this.campaignWorld = 0;
        this.treeOption = 0;
        this.pendingLevel = 1;
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
                case 'CAMPAIGN':
                    this.handleCampaignInput(e);
                    break;
                case 'LEVEL_SELECT':
                    this.handleLevelSelectInput(e);
                    break;
                case 'UPGRADE_TREE':
                    this.handleUpgradeTreeInput(e);
                    break;
                case 'PRE_LEVEL':
                    this.handlePreLevelInput(e);
                    break;
                case 'SETTINGS':
                    this.handleSettingsInput(e);
                    break;
                case 'PAUSED':
                    this.handlePausedInput(e);
                    break;
                case 'WORLD_REWARD':
                    this.handleWorldRewardInput(e);
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
        const maxOptions = 9, cols = 3;
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.menuOption = Math.max(0, this.menuOption - 1);
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.menuOption = Math.min(maxOptions - 1, this.menuOption + 1);
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') this.menuOption = Math.max(0, this.menuOption - cols);
        if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') this.menuOption = Math.min(maxOptions - 1, this.menuOption + cols);
        if (e.key === 'Enter' || e.code === 'Space') this.selectMenuOption();
    }

    selectMenuOption() {
        switch(this.menuOption) {
            case 0: Game.state='CAMPAIGN'; this.campaignWorld=Math.min(4,Game.worlds?.worldIndex(Game.data.level||1)||0); break;
            case 1: Game.state='SHOP'; this.shopOption=0; break;
            case 2: Game.state='UPGRADE_TREE'; this.treeOption=0; break;
            case 3: Game.state='ACHIEVEMENTS'; break;
            case 4: Game.state='LEADERBOARD'; break;
            case 5: Game.state='STATISTICS'; break;
            case 6: Game.state='SETTINGS'; this.settingsOption=0; break;
            case 7: this.showControls(); break;
            case 8: this.showCredits(); break;
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
            const rewards = JSON.parse(BreakoutStorage.getItem('breakout_boss_rewards_v043') || '{}');
            bossLifeBonus = Object.keys(rewards).filter(k => rewards[k] && Number(k.split('_')[1]) % 10 === 0).length;
        } catch (e) {}
        const metaLives=Game.meta?Game.meta.effects().extraLives:0;
        const economyLives=Game.economy?Game.economy.getEffect('extraLife'):0;
        Game.data.maxLives = Math.min(10, difficulty.lives + bossLifeBonus + metaLives + economyLives);
        Game.data.lives = Game.data.maxLives;
        
        // ✅ STATS: Registra início de jogo
        if (Game.stats) {
            Game.stats.recordGameStart();
        }
        
        const prepare = () => { Game.brickManager.loadLevel(startLevel); Game.paddle.reset(); Game.paddle.applyUpgrades(); Game.ball.reset(); if(Game.runModifiers?.effects().startLaser) setTimeout(()=>Game.weapons?.activate(8000),250); };
        if (Game.levelLoader) { Game.levelLoader.load(startLevel, prepare); } else { prepare(); Game.state = 'PLAYING'; }
        
        if (Game.hud) {
            Game.hud.combo = 0;
            Game.hud.maxCombo = 0;
            Game.hud.displayScore = 0;
        }
        
        // ✅ POWER-UPS: Limpa power-ups ativos
        if (Game.powerUpManager) Game.powerUpManager.clear();
        if (Game.weapons) Game.weapons.clear();
        
        // ✅ FIX: Cancela timers de power-ups de duração pendentes da partida anterior
        if (Game.activePowerUpTimers) {
            Object.values(Game.activePowerUpTimers).forEach(t => clearTimeout(t));
            Game.activePowerUpTimers = {};
        }
        
        if (!Game.levelLoader) Game.state = 'PLAYING';
    }

    handleCampaignInput(e) {
        if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A') this.campaignWorld=Math.max(0,this.campaignWorld-1);
        if(e.key==='ArrowRight'||e.key==='d'||e.key==='D') this.campaignWorld=Math.min(4,this.campaignWorld+1);
        if(e.key==='Enter'||e.code==='Space'){
            const first=this.campaignWorld*5+1, max=Math.min(25,Game.progression?.maxSelectable()||1);
            this.levelSelectOption=Math.min(max-1,Math.max(first-1,0)); Game.state='LEVEL_SELECT';
        }
        if(e.key==='t'||e.key==='T'){this.treeOption=0;Game.state='UPGRADE_TREE';}
        if(e.key==='Escape')Game.state='MENU';
    }

    drawCampaign(){
        const c=Game.ctx;c.save();c.fillStyle='rgba(2,7,15,.80)';c.fillRect(0,0,Game.width,Game.height);
        c.textAlign='center';c.font='900 34px Orbitron,Arial';c.fillStyle='#eafaff';c.fillText('CAMPANHA',Game.width/2,54);
        const total=Game.progression?.totalStars()||0, pct=Game.progression?.completionPercent()||0;
        c.font='600 14px Rajdhani,Arial';c.fillStyle='#9bb5c6';c.fillText(`${total}/75 ESTRELAS  •  ${pct}% CONCLUÍDO  •  RANK ${Game.progression?.starRank()||'RECRUTA'}`,Game.width/2,80);
        const y=122,w=136,h=330,gap=10,start=40;
        for(let i=0;i<5;i++){
            const world=Game.worlds.worlds[i],x=start+i*(w+gap),sel=i===this.campaignWorld,stars=Game.progression?.worldStars(i+1)||0,unlocked=(Game.progression?.maxSelectable()||1)>i*5;
            c.fillStyle=sel?'rgba(0,210,255,.16)':unlocked?'rgba(5,14,25,.86)':'rgba(3,6,11,.82)';c.fillRect(x,y,w,h);
            c.strokeStyle=sel?world.accent:unlocked?'rgba(130,170,195,.32)':'#182531';c.lineWidth=sel?3:1;c.strokeRect(x,y,w,h);
            c.fillStyle=unlocked?world.accent:'#425462';c.fillRect(x,y,w,8);
            c.font='800 16px Orbitron,Arial';c.fillStyle=unlocked?'#f1fbff':'#536470';c.textAlign='center';c.fillText(`MUNDO ${i+1}`,x+w/2,y+42);
            c.font='700 12px Rajdhani,Arial';c.fillStyle=unlocked?world.accent:'#465761';c.fillText(world.name,x+w/2,y+66);
            c.font='600 11px Rajdhani,Arial';c.fillStyle='#8aa0b0';c.fillText(world.subtitle,x+w/2,y+87);
            c.font='900 24px Arial';c.fillStyle=unlocked?'#ffd45a':'#37444c';c.fillText('★'.repeat(Math.round(stars/5)).padEnd(3,'☆'),x+w/2,y+137);
            c.font='700 13px Orbitron,Arial';c.fillStyle=unlocked?'#d9e8ef':'#4a5962';c.fillText(`${stars}/15`,x+w/2,y+163);
            c.font='600 12px Rajdhani,Arial';c.fillStyle='#78909f';c.fillText(`FASES ${i*5+1}-${i*5+5}`,x+w/2,y+200);
            const boss=(i+1)*5;c.font='700 12px Orbitron,Arial';c.fillStyle=world.accent;c.fillText(boss%10===0?'BOSS PRINCIPAL':'MINI-BOSS',x+w/2,y+230);
            c.font='900 34px Arial';c.fillStyle=unlocked?world.accent:'#34434c';c.fillText(boss%10===0?'◆':'◇',x+w/2,y+276);
            c.font='600 11px Rajdhani,Arial';c.fillStyle=Game.progression?.worldCompleted(i+1)?'#7dffcf':'#738997';const ach=Game.progression?.worldAchievement(i+1);c.fillText(unlocked?`${ach?.icon||'◇'} ${ach?.name||'EM PROGRESSO'}`:'BLOQUEADO',x+w/2,y+311);
        }
        c.fillStyle='rgba(0,0,0,.5)';c.fillRect(110,478,580,68);c.strokeStyle='rgba(255,255,255,.1)';c.strokeRect(110,478,580,68);
        c.font='700 13px Orbitron,Arial';c.fillStyle='#ffd166';c.fillText(`PONTOS DE ESTRELA DISPONÍVEIS: ${Game.meta?.available()||0}`,Game.width/2,503);
        c.font='600 12px Rajdhani,Arial';c.fillStyle='#78909f';c.fillText('←→ escolher mundo • ENTER fases • T árvore de melhorias • ESC menu',Game.width/2,529);c.restore();
    }

    handleUpgradeTreeInput(e){
        const max=Game.meta?.nodes.length||1;
        if(e.key==='ArrowUp'||e.key==='w'||e.key==='W')this.treeOption=Math.max(0,this.treeOption-1);
        if(e.key==='ArrowDown'||e.key==='s'||e.key==='S')this.treeOption=Math.min(max-1,this.treeOption+1);
        if(e.key==='Enter'||e.code==='Space'){const n=Game.meta?.nodes[this.treeOption];if(n&&Game.meta.buy(n.id)){Game.paddle?.applyUpgrades();Game.hud?.addNotification('MELHORIA DESBLOQUEADA','#7dffcf',2);} }
        if(e.key==='Escape')Game.state='MENU';
    }

    drawUpgradeTree(){
        const c=Game.ctx;c.save();c.fillStyle='rgba(3,8,16,.91)';c.fillRect(0,0,Game.width,Game.height);c.textAlign='center';
        c.font='900 32px Orbitron,Arial';c.fillStyle='#eaffff';c.fillText('ÁRVORE DE ESTRELAS',Game.width/2,52);
        c.font='600 14px Rajdhani,Arial';c.fillStyle='#ffd166';c.fillText(`TOTAL ${Game.meta?.totalStars()||0}  •  DISPONÍVEIS ${Game.meta?.available()||0}  •  INVESTIDOS ${Game.meta?.data.spent||0}`,Game.width/2,79);
        (Game.meta?.nodes||[]).forEach((n,i)=>{const y=112+i*82,sel=i===this.treeOption,lv=Game.meta.level(n.id),cost=Game.meta.nextCost(n.id);c.fillStyle=sel?'rgba(0,210,255,.14)':'rgba(255,255,255,.035)';c.fillRect(90,y,620,64);c.strokeStyle=sel?'#00d2ff':'#243646';c.strokeRect(90,y,620,64);c.textAlign='left';c.font='700 15px Orbitron,Arial';c.fillStyle=sel?'#fff':'#bfd0da';c.fillText(n.name,110,y+23);c.font='600 13px Rajdhani,Arial';c.fillStyle='#8098a8';c.fillText(n.desc,110,y+46);c.textAlign='right';c.font='700 14px Orbitron,Arial';c.fillStyle=lv>=n.max?'#7dffcf':(Game.meta.available()>=cost?'#ffd166':'#ff6b6b');c.fillText(lv>=n.max?`NÍVEL ${lv}/${n.max}  MÁXIMO`:`NÍVEL ${lv}/${n.max}  •  ${cost} ★`,690,y+36);});
        c.textAlign='center';c.font='600 12px Rajdhani,Arial';c.fillStyle='#718899';c.fillText('↑↓ selecionar • ENTER investir pontos • ESC voltar',Game.width/2,566);c.restore();
    }

    handlePreLevelInput(e){
        if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A')Game.runModifiers?.cycle(-1);
        if(e.key==='ArrowRight'||e.key==='d'||e.key==='D')Game.runModifiers?.cycle(1);
        if(e.key==='Enter'||e.code==='Space')this.startGame(this.pendingLevel||1);
        if(e.key==='Escape')Game.state='LEVEL_SELECT';
    }

    drawPreLevel(){
        const c=Game.ctx,l=this.pendingLevel||1,w=Game.worlds?.get(l),m=Game.runModifiers?.current();c.save();c.fillStyle='rgba(2,7,15,.9)';c.fillRect(0,0,Game.width,Game.height);c.textAlign='center';
        c.font='900 30px Orbitron,Arial';c.fillStyle=w?.accent||'#00d2ff';c.fillText(`FASE ${String(l).padStart(2,'0')}`,Game.width/2,76);c.font='700 16px Orbitron,Arial';c.fillStyle='#eaf7ff';c.fillText(w?.name||'',Game.width/2,105);
        c.font='600 13px Rajdhani,Arial';c.fillStyle='#7895a7';c.fillText('ESCOLHA UM MODIFICADOR PARA ESTA TENTATIVA',Game.width/2,150);
        c.fillStyle='rgba(255,255,255,.05)';c.fillRect(145,188,510,210);c.strokeStyle=m?.accent||'#00d2ff';c.lineWidth=2;c.strokeRect(145,188,510,210);
        c.font='900 26px Orbitron,Arial';c.fillStyle=m?.accent||'#fff';c.fillText(`◀  ${m?.name||'PADRÃO'}  ▶`,Game.width/2,248);
        c.font='600 17px Rajdhani,Arial';c.fillStyle='#d5e5ed';c.fillText(m?.desc||'',Game.width/2,293);
        const stars=Game.progression?.stars(l)||0;c.font='900 30px Arial';c.fillStyle='#ffd45a';c.fillText('★'.repeat(stars)+'☆'.repeat(3-stars),Game.width/2,347);
        c.font='600 13px Rajdhani,Arial';c.fillStyle='#7895a7';c.fillText('Melhor resultado desta fase',Game.width/2,374);
        c.font='700 13px Orbitron,Arial';c.fillStyle='#7dffcf';c.fillText('ENTER INICIAR',Game.width/2,462);c.font='600 12px Rajdhani,Arial';c.fillStyle='#718899';c.fillText('←→ trocar modificador • ESC voltar às fases',Game.width/2,493);c.restore();
    }

    handleLevelSelectInput(e) {
        const max = Math.min(25, Game.progression?.maxSelectable() || 1);
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.levelSelectOption=Math.max(0,this.levelSelectOption-1);
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.levelSelectOption=Math.min(max-1,this.levelSelectOption+1);
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') this.levelSelectOption=Math.max(0,this.levelSelectOption-5);
        if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') this.levelSelectOption=Math.min(max-1,this.levelSelectOption+5);
        if (e.key === 'Enter' || e.code === 'Space') { this.pendingLevel=this.levelSelectOption+1; Game.state='PRE_LEVEL'; }
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
            if(Game.progression?.data.completed?.includes(level)){ctx.textAlign='right';ctx.fillStyle='#77ffb0';ctx.fillText('✓',x+boxW-10,y+23);const st=Game.progression.stars(level);ctx.font='700 12px Arial';ctx.fillStyle='#ffd45a';ctx.fillText('★'.repeat(st)+'☆'.repeat(3-st),x+boxW-10,y+48);}
        }
        const lvl=this.levelSelectOption+1,w=Game.worlds?.get(lvl);ctx.textAlign='center';ctx.font='700 16px Orbitron,Arial';ctx.fillStyle=w?.accent||'#00d2ff';ctx.fillText(w?`${w.name} — ${w.subtitle}`:'',Game.width/2,565);
        ctx.font='12px Rajdhani,Arial';ctx.fillStyle='#617889';ctx.fillText('SETAS/WASD navegar • ENTER jogar • ESC voltar',Game.width/2,590);
    }

    handleWorldRewardInput(e) {
        if (e.key === 'Enter' || e.code === 'Space') {
            const r=Game.pendingReward;if(!r)return;
            const next=r.nextLevel; if(r.level>=25){Game.pendingReward=null;Game.state='MENU';this.menuOption=0;return;} Game.pendingReward=null;
            const go=()=>{Game.brickManager.loadLevel(next);Game.ball.reset();if(Game.paddle)Game.paddle.reset();Game.brickManager.levelCompleting=false;};
            if(Game.levelLoader) Game.levelLoader.load(next,go); else {go();Game.state='PLAYING';}
        }
        if (e.key === 'Escape') { Game.pendingReward=null; Game.state='MENU'; }
    }

    drawWorldReward() {
        const r=Game.pendingReward;if(!r)return;const ctx=Game.ctx,w=Game.worlds?.get(r.level);
        ctx.save();ctx.fillStyle='rgba(2,6,14,.88)';ctx.fillRect(0,0,Game.width,Game.height);
        ctx.textAlign='center';ctx.font='900 38px Orbitron,Arial';ctx.fillStyle=w?.accent||'#00d2ff';ctx.fillText('MUNDO CONCLUÍDO',Game.width/2,105);
        ctx.font='700 20px Orbitron,Arial';ctx.fillStyle='#fff';ctx.fillText(w?.name||('Mundo '+r.world),Game.width/2,145);
        ctx.font='900 54px Arial';ctx.fillStyle='#ffd45a';ctx.fillText('★'.repeat(r.stars)+'☆'.repeat(3-r.stars),Game.width/2,225);
        ctx.font='700 17px Rajdhani,Arial';ctx.fillStyle='#b9d5e5';ctx.fillText(r.challengeDone?'DESAFIO CONCLUÍDO: '+r.challenge:'DESAFIO NÃO CONCLUÍDO: '+r.challenge,Game.width/2,265);
        ctx.fillStyle='rgba(255,255,255,.06)';ctx.fillRect(190,300,420,125);ctx.strokeStyle='rgba(255,255,255,.16)';ctx.strokeRect(190,300,420,125);
        ctx.font='700 18px Orbitron,Arial';ctx.fillStyle='#7dffcf';ctx.fillText('RECOMPENSAS',Game.width/2,332);
        ctx.font='600 18px Rajdhani,Arial';ctx.fillStyle='#fff';ctx.fillText(`+${r.coins} moedas`,Game.width/2,365);ctx.fillText(r.firstClaim?'Bônus de primeira conquista aplicado':'Recompensa do mundo já coletada antes',Game.width/2,394);const ach=Game.progression?.worldAchievement(r.world);ctx.font='700 13px Orbitron,Arial';ctx.fillStyle=w?.accent||'#ffd166';ctx.fillText(`SELO: ${ach?.icon||'◇'} ${ach?.name||'CONQUISTADO'}  •  RANK ${Game.progression?.starRank()||'RECRUTA'}`,Game.width/2,422);
        ctx.font='600 13px Rajdhani,Arial';ctx.fillStyle='#7fa4b7';ctx.fillText('ENTER continuar • ESC menu',Game.width/2,490);ctx.restore();
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
            'Breakout Evolution v0.5.4'
        );
    }

    handleSettingsInput(e) {
        const max = 8;
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') this.settingsOption = Math.max(0, (this.settingsOption || 0) - 1);
        if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') this.settingsOption = Math.min(max - 1, (this.settingsOption || 0) + 1);
        const dir = (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') ? -1 : (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') ? 1 : 0;
        if (dir && Game.settings) {
            if (this.settingsOption === 0) Game.settings.cycle('graphics', dir);
            else if (this.settingsOption === 1) Game.settings.cycle('gpu', dir);
            else if (this.settingsOption === 2) Game.settings.cycle('difficulty', dir);
            else if (this.settingsOption === 3) Game.settings.toggleAudio();
            else if (this.settingsOption === 4) Game.settings.adjustVolume('masterVolume', dir);
            else if (this.settingsOption === 5) Game.settings.adjustVolume('musicVolume', dir);
            else if (this.settingsOption === 6) Game.settings.adjustVolume('sfxVolume', dir);
        }
        if (e.key === 'Enter' || e.code === 'Space') {
            if (this.settingsOption === 0) Game.settings.cycle('graphics', 1);
            else if (this.settingsOption === 1) Game.settings.cycle('gpu', 1);
            else if (this.settingsOption === 2) Game.settings.cycle('difficulty', 1);
            else if (this.settingsOption === 3) Game.settings.toggleAudio();
            else if (this.settingsOption === 4) Game.settings.adjustVolume('masterVolume', 1);
            else if (this.settingsOption === 5) Game.settings.adjustVolume('musicVolume', 1);
            else if (this.settingsOption === 6) Game.settings.adjustVolume('sfxVolume', 1);
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
        ctx.font='700 18px Orbitron, Arial';ctx.fillStyle='#00d2ff';ctx.fillText('EVOLUTION',Game.width/2,130);ctx.font='600 11px Orbitron, Arial';ctx.fillStyle='#ffd166';ctx.fillText('v0.5.4',Game.width/2,149);
        ctx.font='14px Rajdhani, Arial';ctx.fillStyle='#7f9aaa';ctx.fillText('ARCADE • UPGRADES • POWER-UPS',Game.width/2,172);
        const options=['▶ CAMPANHA','◆ LOJA','✦ MELHORIAS','★ CONQUISTAS','▣ PLACAR','⌁ ESTATÍSTICAS','⚙ CONFIGURAÇÕES','⌨ CONTROLES','ⓘ CRÉDITOS'];
        const cols=3,startX=48,startY=220,w=226,h=48,gapX=13,gapY=14;
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
        const ctx=Game.ctx;ctx.fillStyle='#07101b';ctx.fillRect(0,0,Game.width,Game.height);ctx.textAlign='center';ctx.font='800 30px Orbitron,Arial';ctx.fillStyle='#00d2ff';ctx.fillText('CONFIGURAÇÕES',Game.width/2,45);
        const vals=[Game.settings.graphicsLabel(),Game.settings.gpuLabel(),Game.settings.difficulty().label,Game.settings.data.audio?'LIGADO':'DESLIGADO',`${Game.settings.data.masterVolume}%`,`${Game.settings.data.musicVolume}%`,`${Game.settings.data.sfxVolume}%`,'VOLTAR'];
        const labels=['QUALIDADE GRÁFICA','ACELERAÇÃO','DIFICULDADE','ÁUDIO','VOLUME GERAL','MÚSICA','EFEITOS',''];
        const startY=65,rowH=54;
        for(let i=0;i<8;i++){const y=startY+i*rowH,sel=(this.settingsOption||0)===i;ctx.fillStyle=sel?'rgba(0,210,255,.15)':'rgba(255,255,255,.025)';ctx.fillRect(150,y,500,42);ctx.strokeStyle=sel?'#00d2ff':'#243446';ctx.strokeRect(150,y,500,42);ctx.font='600 12px Orbitron,Arial';ctx.fillStyle='#91a9b9';ctx.textAlign='left';ctx.fillText(labels[i],174,y+17);ctx.font='700 14px Orbitron,Arial';ctx.textAlign='right';ctx.fillStyle=sel?'#ffd166':'#d5e1e8';ctx.fillText(i<7?`◀  ${vals[i]}  ▶`:vals[i],626,y+27);}
        const status=Game.renderer?Game.renderer.statusLabel():'Canvas 2D';
        ctx.textAlign='center';ctx.font='600 12px Rajdhani,Arial';ctx.fillStyle='#7dffcf';ctx.fillText(`RENDER: ${status}`,Game.width/2,514);
        ctx.fillStyle='#718899';ctx.fillText('Volumes são salvos automaticamente. Áudio funciona como mute geral.',Game.width/2,536);
        ctx.fillText('SETAS/WASD ajustar • ENTER selecionar • ESC voltar',Game.width/2,560);
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
