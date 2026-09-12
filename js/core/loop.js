// loop.js - Game Loop Otimizado e Seguro

// ============================================
// 1. INICIALIZAÇÃO SEGURA DE SUBSISTEMAS
// ============================================
console.log('🎮 Inicializando Modern Breakout...');

function initializeGame() {
    try {
        // ✅ Verifica se Game.data existe
        if (!Game.data) {
            console.error('❌ Game.data não existe!');
            return false;
        }
        
        // Ordem correta de inicialização
        console.log('📦 Carregando subsistemas...');
        
        // ✅ NOVOS: Audio, PowerUps, Stats, Achievements, Leaderboard, LevelGen
        Game.audio = new AudioManager();
        if (Game.settings) { Game.audio.setEnabled(Game.settings.data.audio); Game.audio.setMix(Game.settings.data.masterVolume/100,Game.settings.data.musicVolume/100,Game.settings.data.sfxVolume/100); }
        console.log('✅ Audio carregado');
        
        Game.stats = new Statistics();
        console.log('✅ Statistics carregado');
        
        Game.achievements = new AchievementSystem();
        console.log('✅ Achievements carregado');
        
        Game.leaderboard = new Leaderboard();
        console.log('✅ Leaderboard carregado');
        
        Game.levelGenerator = new LevelGenerator();
        console.log('✅ LevelGenerator carregado');
        
        Game.powerUpManager = new PowerUpManager();
        console.log('✅ PowerUpManager carregado');
        
        Game.economy = new Economy();
        console.log('✅ Economy carregado');
        
        // ✅ FIX: SkinManager existia (skins_manager.js) mas nunca era
        // instanciado — a feature inteira de skins estava morta/inacessível.
        Game.skinManager = new SkinManager();
        console.log('✅ SkinManager carregado');
        
        Game.particles = new ParticleSystem();
        console.log('✅ Particles carregado');

        Game.bossSystem = new BossSystem();
        Game.hazards = new WorldHazardSystem();
        Game.weapons = new WeaponSystem();
        Game.challenges = new ChallengeSystem();
        console.log('✅ BossSystem/WorldHazards/Weapons/Challenges carregados');
        
        Game.hud = new HUD();
        console.log('✅ HUD carregado');
        
        Game.brickManager = new BrickManager();
        console.log('✅ BrickManager carregado');
        
        Game.paddle = new Paddle();
        console.log('✅ Paddle carregado');
        
        Game.ball = new Ball();
        console.log('✅ Ball carregado');
        if (Game.skinManager) {
            Game.paddle.applySkin(Game.skinManager.currentPaddleSkin || 'default');
            Game.ball.applySkin(Game.skinManager.currentBallSkin || 'default');
        }
        
        Game.ui = new UI();
        console.log('✅ UI carregado');
        
        // Carrega nível inicial
        Game.brickManager.loadLevel(Game.data.level);
        
        // ✅ FIX BUG #8: Marca como inicializado
        Game.initialized = true;
        
        console.log('🎮 Jogo inicializado com sucesso!');
        return true;
        
    } catch (error) {
        console.error('❌ ERRO CRÍTICO na inicialização:', error);
        alert('Erro ao inicializar o jogo. Por favor, recarregue a página.\n\nDetalhes: ' + error.message);
        return false;
    }
}

// ============================================
// 2. CONTROLES GLOBAIS DO JOGO
// ============================================
let gameKeyHandler = (e) => {
    if (!Game.initialized) return;
    
    // ESC - Volta ao menu de estados especiais
    if (e.key === 'Escape') {
        if (Game.state === 'ACHIEVEMENTS' || 
            Game.state === 'LEADERBOARD' || 
            Game.state === 'STATISTICS' ||
            Game.state === 'LEVEL_SELECT' ||
            Game.state === 'CAMPAIGN' ||
            Game.state === 'UPGRADE_TREE' ||
            Game.state === 'SHOP') {
            Game.state = 'MENU';
            e.preventDefault();
            return;
        }
    }
    
    // R - Reset de estatísticas (só na tela de stats)
    if (e.key === 'r' || e.key === 'R') {
        if (Game.state === 'STATISTICS' && Game.stats) {
            if (confirm('Tem certeza que deseja resetar TODAS as estatísticas?')) {
                Game.stats.reset();
            }
            e.preventDefault();
            return;
        }
    }
    
    // Pausa
    if (Game.state === 'PLAYING') {
        if (e.key === 'p' || e.key === 'P') {
            Game.state = 'PAUSED';
            return;
        }
        
        // Lançamento da bola
        if ((e.code === 'Space' || e.key === ' ') && Game.ball && !Game.ball.active) {
            Game.ball.launch();
            e.preventDefault();
        }
    } 
    // Despausar
    else if (Game.state === 'PAUSED') {
        if (e.key === 'p' || e.key === 'P') {
            Game.state = 'PLAYING';
        }
    }
};

window.addEventListener('keydown', gameKeyHandler);

// ============================================
// 3. GAME LOOP PRINCIPAL COM FIXED TIMESTEP
// ============================================
let lastTime = performance.now();
let deltaTime = 0;
let fps = 0;
let frameCount = 0;
let fpsUpdateTime = 0;

// Fixed timestep para física consistente
const TARGET_FPS = 60;
const FIXED_TIMESTEP = 1 / TARGET_FPS;
let accumulator = 0;

function gameLoop(currentTime) {
    if (!Game.initialized) {
        requestAnimationFrame(gameLoop);
        return;
    }
    
    // Calcula delta time em segundos
    deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;
    
    // Limita delta time para evitar grandes saltos (ex: tab inativa)
    if (deltaTime > 0.25) deltaTime = 0.25;
    
    // FPS counter também alimenta o modo gráfico Automático
    frameCount++;
    if (currentTime - fpsUpdateTime > 1000) {
        fps = frameCount;
        frameCount = 0;
        fpsUpdateTime = currentTime;
        if (Game.settings) Game.settings.observeFPS(fps);
    }
    
    // Fixed timestep para física consistente
    accumulator += deltaTime;
    
    while (accumulator >= FIXED_TIMESTEP) {
        // Update com timestep fixo
        try {
            updateGameLogic(FIXED_TIMESTEP);
        } catch (error) {
            console.error('❌ Erro no update:', error);
            // Tenta recuperar para o menu
            if (Game.state !== 'MENU') {
                Game.state = 'MENU';
            }
        }
        accumulator -= FIXED_TIMESTEP;
    }
    
    // ========================================
    // RENDER
    // ========================================
    try {
        clearScreen();
        renderCurrentState();
    } catch (error) {
        console.error('❌ Erro no render:', error);
        try{
            const ctx=Game.ctx;
            Game.renderer?.beginFrame();
            ctx.fillStyle='#07101b';ctx.fillRect(0,0,Game.width,Game.height);
            ctx.textAlign='center';ctx.fillStyle='#ff6b6b';ctx.font='700 20px Arial';ctx.fillText('ERRO DE RENDERIZAÇÃO',Game.width/2,Game.height/2-20);
            ctx.fillStyle='#cbd5df';ctx.font='14px Arial';ctx.fillText(String(error?.message||error).slice(0,90),Game.width/2,Game.height/2+10);
            ctx.fillText('Recarregue a página. O jogo tentou recuperar o menu.',Game.width/2,Game.height/2+36);
        }catch(_){ }
        Game.state='MENU';
    }
    
    // Debug info
    if (CONFIG.SYSTEM.DEBUG) {
        drawDebugInfo();
    }
    
    // Próximo frame
    requestAnimationFrame(gameLoop);
}

// ============================================
// FUNÇÕES DE UPDATE
// ============================================
function updateGameLogic(dt) {
    switch (Game.state) {
        case 'PLAYING':
            updateGame(dt);
            break;
        case 'BOSS_INTRO':
            if (Game.bossSystem) Game.bossSystem.update(dt);
            break;
        case 'MENU':
            updateMenu(dt);
            break;
        case 'SETTINGS':
        case 'CAMPAIGN':
        case 'LEVEL_SELECT':
        case 'UPGRADE_TREE':
        case 'PRE_LEVEL':
        case 'LOADING':
            break;
        // Outros estados não precisam de update
    }
}

function updateGame(dt) {
    // ✅ FIX BUG #1: Adiciona verificações robustas (incluindo economy)
    if (!Game.paddle || !Game.ball || !Game.brickManager || 
        !Game.particles || !Game.hud || !Game.economy) {
        console.warn('⚠️ Componentes não inicializados!');
        return;
    }
    
    Game.paddle.update();
    
    // ✅ Passa paddle para ball.update
    Game.ball.update(Game.paddle);
    
    // ✅ FIX BUG #3: Atualiza e colide extraBalls (multiball)
    if (Game.extraBalls && Game.extraBalls.length > 0) {
        for (let i = Game.extraBalls.length - 1; i >= 0; i--) {
            const extraBall = Game.extraBalls[i];
            
            if (!extraBall.active) {
                Game.extraBalls.splice(i, 1);
                continue;
            }
            
            // Update da extra ball
            extraBall.x += extraBall.speedX * (Game.timeScale || 1.0);
            extraBall.y += extraBall.speedY * (Game.timeScale || 1.0);
            
            // Colisões com paredes
            if (extraBall.x + extraBall.radius > Game.width || extraBall.x - extraBall.radius < 0) {
                extraBall.speedX *= -1;
            }
            if (extraBall.y - extraBall.radius < 0) {
                extraBall.speedY *= -1;
            }
            
            // Colisão com paddle
            if (Game.paddle && extraBall.y + extraBall.radius > Game.paddle.y &&
                extraBall.x > Game.paddle.x && extraBall.x < Game.paddle.x + Game.paddle.width) {
                extraBall.speedY = -Math.abs(extraBall.speedY);
                extraBall.y = Game.paddle.y - extraBall.radius;
            }
            
            // Colisão com bricks
            Game.brickManager.bricks.forEach(brick => {
                if (brick.destroyed) return;
                
                const dx = Math.abs(extraBall.x - (brick.x + brick.width / 2));
                const dy = Math.abs(extraBall.y - (brick.y + brick.height / 2));
                
                if (dx < (brick.width / 2 + extraBall.radius) && 
                    dy < (brick.height / 2 + extraBall.radius)) {
                    extraBall.speedY *= -1;
                    brick.hit();
                }
            });
            
            // Remove se sair pela base
            if (extraBall.y > Game.height + 50) {
                Game.extraBalls.splice(i, 1);
            }
        }
    }
    
    // ✅ Passa ball para checkCollision
    Game.brickManager.checkCollision(Game.ball);
    
    Game.brickManager.update();
    if (Game.bossSystem) Game.bossSystem.update(dt);
    if (Game.hazards) Game.hazards.update(dt);
    if (Game.weapons) Game.weapons.update(dt);
    Game.particles.update();
    Game.hud.update();
    
    // ✅ NOVO: Atualiza power-ups
    if (Game.powerUpManager) {
        Game.powerUpManager.update();
    }
    if (Game.challenges) Game.challenges.update();
    
    // ✅ NOVO: Atualiza achievements (verifica conquistas)
    if (Game.achievements) {
        Game.achievements.update();
    }
}

function updateMenu(dt) {
    // Partículas decorativas no menu
    const ambientChance = Game.settings ? ({LOW:0,MEDIUM:0.02,HIGH:0.05}[Game.settings.effectiveGraphics] || 0) : 0.05;
    if (Game.particles && Math.random() < ambientChance) {
        Game.particles.emit(
            Math.random() * Game.width,
            0,
            3,
            `hsl(${Math.random() * 360}, 70%, 60%)`
        );
    }
    if (Game.particles) {
        Game.particles.update();
    }
}

// ============================================
// FUNÇÕES DE RENDER
// ============================================
function clearScreen() {
    if(Game.renderer)Game.renderer.beginFrame();
    const ctx=Game.ctx; ctx.clearRect(0,0,Game.width,Game.height);
    const img=(Game.state==='MENU'||Game.state==='CAMPAIGN'||Game.state==='LEVEL_SELECT'||Game.state==='UPGRADE_TREE'||Game.state==='PRE_LEVEL'||Game.state==='SETTINGS'||Game.state==='SHOP'||Game.state==='ACHIEVEMENTS'||Game.state==='LEADERBOARD'||Game.state==='STATISTICS') ? Game.assets?.image('menu') : Game.assets?.backgroundForLevel(Game.data.level);
    if(img){Game.assets.drawCover(ctx,img,0,0,Game.width,Game.height,.98);ctx.fillStyle='rgba(2,6,14,.34)';ctx.fillRect(0,0,Game.width,Game.height);}
    else{const gradient=ctx.createLinearGradient(0,0,0,Game.height);gradient.addColorStop(0,'#0a0a0f');gradient.addColorStop(1,'#1a1a2e');ctx.fillStyle=gradient;ctx.fillRect(0,0,Game.width,Game.height);}
}

function renderCurrentState() {
    switch (Game.state) {
        case 'MENU':
            renderMenu();
            break;
        case 'SHOP':
            renderShop();
            break;
        case 'CAMPAIGN':
            if (Game.ui) Game.ui.drawCampaign();
            break;
        case 'LEVEL_SELECT':
            if (Game.ui) Game.ui.drawLevelSelect();
            break;
        case 'UPGRADE_TREE':
            if (Game.ui) Game.ui.drawUpgradeTree();
            break;
        case 'PRE_LEVEL':
            if (Game.ui) Game.ui.drawPreLevel();
            break;
        case 'SETTINGS':
            if (Game.ui) Game.ui.drawSettings();
            break;
        case 'LOADING':
            renderGame();
            break;
        case 'ACHIEVEMENTS':
            if (Game.achievements) {
                Game.achievements.drawAchievementsScreen(Game.ctx);
            }
            break;
        case 'LEADERBOARD':
            if (Game.leaderboard) {
                Game.leaderboard.draw(Game.ctx);
            }
            break;
        case 'STATISTICS':
            if (Game.stats) {
                Game.stats.drawStatsScreen(Game.ctx);
            }
            break;
        case 'PLAYING':
            renderGame();
            break;
        case 'BOSS_INTRO':
            renderGame();
            break;
        case 'PAUSED':
            renderGame();
            if (Game.ui) Game.ui.drawPaused();
            break;
        case 'WORLD_REWARD':
            renderGame();
            if (Game.ui) Game.ui.drawWorldReward();
            break;
        case 'GAME_OVER':
            renderGame();
            if (Game.ui) Game.ui.drawGameOver();
            break;
        default:
            console.warn(`Estado desconhecido: ${Game.state}`);
            Game.state = 'MENU';
    }
}


function drawWorldAtmosphere() {
    const ctx=Game.ctx, world=Game.worlds?.get(Game.data.level);
    if(!world)return;
    const q=Game.settings?.effectiveGraphics||'MEDIUM';
    ctx.save();
    const vignette=ctx.createRadialGradient(Game.width/2,Game.height*.45,80,Game.width/2,Game.height*.45,500);
    vignette.addColorStop(0,'rgba(0,0,0,0)');vignette.addColorStop(1,q==='LOW'?'rgba(0,0,0,.18)':'rgba(0,0,0,.34)');
    ctx.fillStyle=vignette;ctx.fillRect(0,0,Game.width,Game.height);
    if(q!=='LOW'){
        ctx.globalAlpha=q==='HIGH'?.11:.06;ctx.fillStyle=world.accent;
        for(let y=80;y<Game.height;y+=q==='HIGH'?26:42)ctx.fillRect(0,y,Game.width,1);
    }
    ctx.globalAlpha=1;ctx.strokeStyle=world.accent;ctx.globalAlpha=.18;ctx.strokeRect(8,58,Game.width-16,Game.height-70);ctx.globalAlpha=.72;ctx.fillStyle=world.accent;ctx.font='600 10px Orbitron,Arial';ctx.textAlign='right';ctx.fillText(Game.hazards?.label()||'',Game.width-18,82);ctx.restore();
}

function renderGame() {
    // ✅ Verifica componentes antes de renderizar
    if (!Game.brickManager || !Game.particles || 
        !Game.paddle || !Game.ball || !Game.hud) {
        return;
    }
    
    // Ordem de renderização (back to front)
    drawWorldAtmosphere();
    if (Game.hazards) Game.hazards.draw();
    Game.brickManager.draw();
    Game.particles.draw();
    Game.paddle.draw();
    Game.ball.draw();
    
    // ✅ FIX BUG #3: Desenha extra balls (multiball)
    if (Game.extraBalls && Game.extraBalls.length > 0) {
        const ctx = Game.ctx;
        Game.extraBalls.forEach(extraBall => {
            if (extraBall.active) {
                // Brilho
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#00d2ff';
                
                // Bola
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(extraBall.x, extraBall.y, extraBall.radius, 0, Math.PI * 2);
                ctx.fill();
                
                // Border
                ctx.strokeStyle = '#00d2ff';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                ctx.shadowBlur = 0;
            }
        });
    }
    
    // ✅ NOVO: Desenha power-ups
    if (Game.powerUpManager) { Game.powerUpManager.draw(); }
    if (Game.weapons) Game.weapons.draw();
    
    Game.hud.draw();
    if (Game.bossSystem) Game.bossSystem.draw();
    if (Game.challenges) Game.challenges.drawHUD();
    
    // ✅ NOVO: Desenha notificações de conquistas (por cima de tudo)
    if (Game.achievements) {
        Game.achievements.draw(Game.ctx);
    }
}

function renderMenu() {
    if (Game.ui) {
        Game.ui.drawMenu();
    }
    
    if (Game.particles) {
        Game.particles.draw();
    }
}

function renderShop() {
    if (Game.ui) {
        Game.ui.drawShop();
    }
}

// ============================================
// DEBUG INFO
// ============================================
function drawDebugInfo() {
    const ctx = Game.ctx;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 70, 220, 160);
    
    ctx.fillStyle = '#0f0';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    
    const debugInfo = [
        `FPS: ${fps}`,
        `State: ${Game.state}`,
        `Lives: ${Game.data.lives}/${Game.data.maxLives}`,
        `Ball: ${Game.ball?.active ? 'Active' : 'Inactive'}`,
        `Speed: ${Game.ball ? Math.sqrt(Game.ball.speedX**2 + Game.ball.speedY**2).toFixed(2) : 0}`,
        `Bricks: ${Game.brickManager?.getActiveBricksCount() || 0}`,
        `Particles: ${Game.particles?.particles.length || 0}`,
        `Pool Free: ${Game.particles?.pool.filter(p => !p.active).length || 0}`,
        `Combo: ${Game.hud?.combo || 0}x`,
        `Delta: ${(deltaTime * 1000).toFixed(2)}ms`,
        `Accumulator: ${(accumulator * 1000).toFixed(2)}ms`
    ];
    
    debugInfo.forEach((line, i) => {
        ctx.fillText(line, 15, 85 + i * 14);
    });
}

// ============================================
// TRATAMENTO DE ERROS GLOBAL
// ============================================
window.addEventListener('error', (e) => {
    console.error('🔴 Erro fatal:', e.error);
    
    // Tenta recuperar para o menu
    if (Game.state !== 'MENU') {
        Game.state = 'MENU';
        if (Game.hud) Game.hud.addNotification('ERRO RECUPERADO — MENU RESTAURADO', '#ff6b6b', 3);
    }
});

// ============================================
// CLEANUP AO SAIR
// ============================================
window.addEventListener('beforeunload', () => {
    console.log('💾 Salvando progresso...');
    
    if (Game.economy) {
        Game.economy.save();
    }
    
    // Cleanup de event listeners
    if (gameKeyHandler) {
        window.removeEventListener('keydown', gameKeyHandler);
    }
    
    if (Game.paddle) Game.paddle.destroy();
    if (Game.ui) Game.ui.destroy();
});

// ============================================
// INICIAR GAME
// ============================================
if (initializeGame()) {
    console.log('🚀 Iniciando game loop...');
    requestAnimationFrame(gameLoop);
    
    // Mensagem de boas-vindas
    setTimeout(() => {
        if (Game.state === 'MENU') {
            console.log('%c🎮 BREAKOUT EVOLUTION v0.5.4', 'color: #00d2ff; font-size: 20px; font-weight: bold');
            console.log('%cControles:', 'color: #FFD700; font-weight: bold');
            console.log('  Movimento: ← → ou A D ou Mouse');
            console.log('  Lançar: SPACE');
            console.log('  Pausar: P');
            console.log('  Menu: ESC');
            console.log('\n%c⚠️ DEBUG MODE:', 'color: #ff0; font-weight: bold');
            console.log('  CONFIG.SYSTEM.DEBUG =', CONFIG.SYSTEM.DEBUG);
        }
    }, 1000);
} else {
    console.error('💥 Falha na inicialização do jogo');
}
