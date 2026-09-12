// hud.js - HUD profissional do gameplay
class HUD {
    constructor() {
        this.notifications = [];
        this.comboTimer = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.scoreAnimation = 0;
        this.displayScore = 0;
        this.panelHeight = 68;
    }

    addNotification(text, color = '#fff', duration = 2.0) {
        this.notifications.push({
            text,
            color,
            life: duration,
            maxLife: duration,
            y: 0,
            alpha: 1
        });
        if (this.notifications.length > 6) this.notifications.shift();
    }

    incrementCombo() {
        this.combo++;
        this.comboTimer = 90;
        if (this.combo > this.maxCombo) this.maxCombo = this.combo;
        if (Game.stats) Game.stats.recordCombo(this.combo);

        if (this.combo === 5) {
            this.addNotification('COMBO INICIADO!', '#FFD700');
            if (Game.achievements) Game.achievements.check();
        } else if (this.combo === 10) {
            this.addNotification('ÓTIMO COMBO!', '#FF6B6B');
            if (Game.achievements) Game.achievements.check();
        } else if (this.combo === 20) {
            this.addNotification('INCRÍVEL!', '#4ECDC4');
        } else if (this.combo === 50) {
            this.addNotification('LENDÁRIO!!!', '#FF00FF', 3.0);
        }
    }

    resetCombo() {
        if (this.combo > 5) {
            const bonus = this.combo * 5;
            Game.data.score += bonus;
            this.addNotification(`Combo Bônus +${bonus}`, '#FFD700');
        }
        this.combo = 0;
        this.comboTimer = 0;
    }

    update() {
        if (this.comboTimer > 0) this.comboTimer--;
        else if (this.combo > 0) this.resetCombo();

        for (let i = this.notifications.length - 1; i >= 0; i--) {
            const notif = this.notifications[i];
            notif.life -= 0.016;
            if (notif.life < 0.35) notif.alpha = Math.max(0, notif.life / 0.35);
            if (notif.life <= 0) this.notifications.splice(i, 1);
        }

        const targetScore = Number(Game.data?.score || 0);
        if (this.displayScore < targetScore) {
            const diff = targetScore - this.displayScore;
            this.displayScore += Math.max(1, Math.ceil(diff * 0.12));
        } else if (this.displayScore > targetScore) {
            this.displayScore = targetScore;
        }
    }

    draw() {
        if (!Game.ctx) return;
        this.drawTopPanel();
        this.drawNotifications();
    }

    // =========================
    // Helpers
    // =========================
    roundRectPath(ctx, x, y, w, h, r = 12) {
        const rr = Math.min(r, w / 2, h / 2);
        ctx.beginPath();
        ctx.moveTo(x + rr, y);
        ctx.arcTo(x + w, y, x + w, y + h, rr);
        ctx.arcTo(x + w, y + h, x, y + h, rr);
        ctx.arcTo(x, y + h, x, y, rr);
        ctx.arcTo(x, y, x + w, y, rr);
        ctx.closePath();
    }

    fillRoundRect(ctx, x, y, w, h, r, fillStyle) {
        ctx.save();
        this.roundRectPath(ctx, x, y, w, h, r);
        ctx.fillStyle = fillStyle;
        ctx.fill();
        ctx.restore();
    }

    strokeRoundRect(ctx, x, y, w, h, r, strokeStyle, lineWidth = 1) {
        ctx.save();
        this.roundRectPath(ctx, x, y, w, h, r);
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
        ctx.restore();
    }

    drawGlassPanel(ctx, x, y, w, h, accent = '#00d2ff', opacity = 0.82) {
        const bg = ctx.createLinearGradient(x, y, x, y + h);
        bg.addColorStop(0, `rgba(7, 15, 28, ${opacity})`);
        bg.addColorStop(1, `rgba(4, 9, 18, ${Math.max(0.55, opacity - 0.12)})`);
        this.fillRoundRect(ctx, x, y, w, h, 14, bg);
        this.strokeRoundRect(ctx, x, y, w, h, 14, 'rgba(255,255,255,0.14)', 1);
        this.strokeRoundRect(ctx, x + 1, y + 1, w - 2, h - 2, 13, `${accent}55`, 1);

        if (Game.settings?.shadows()) {
            ctx.save();
            ctx.shadowBlur = 18;
            ctx.shadowColor = accent;
            this.strokeRoundRect(ctx, x, y, w, h, 14, `${accent}20`, 1);
            ctx.restore();
        }
    }

    ellipsize(ctx, text, maxWidth) {
        if (!text) return '';
        if (ctx.measureText(text).width <= maxWidth) return text;
        let out = text;
        while (out.length > 3 && ctx.measureText(out + '…').width > maxWidth) out = out.slice(0, -1);
        return out + '…';
    }

    formatNumber(n) {
        try { return Number(n || 0).toLocaleString('pt-BR'); }
        catch (e) { return String(Math.floor(Number(n || 0))); }
    }

    getWorld() {
        return Game.worlds?.get(Game.data?.level || 1) || { name: 'NEON DISTRICT', subtitle: 'Circuitos de luz', accent: '#00d2ff' };
    }

    getComboColor() {
        if (this.combo > 50) return '#ff5cf6';
        if (this.combo > 20) return '#4ECDC4';
        if (this.combo > 10) return '#FF6B6B';
        return '#FFD700';
    }

    metricCard(ctx, x, y, w, h, label, value, accent, icon = '') {
        this.drawGlassPanel(ctx, x, y, w, h, accent, 0.78);
        ctx.save();
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillStyle = '#8fb1c4';
        ctx.font = '600 10px Rajdhani, Arial';
        ctx.fillText(label.toUpperCase(), x + 12, y + 6);

        ctx.fillStyle = accent;
        ctx.font = '700 22px Rajdhani, Arial';
        const valueText = `${icon ? icon + ' ' : ''}${value}`;
        ctx.fillText(valueText, x + 12, y + 17);
        ctx.restore();
    }

    drawTopPanel() {
        const ctx = Game.ctx;
        const world = this.getWorld();
        const score = this.formatNumber(this.displayScore);
        const coins = this.formatNumber(Game.data?.coins || 0);
        const stage = Game.worlds?.stageInWorld(Game.data?.level || 1) || 1;
        const rank = Game.progression?.starRank?.() || 'RECRUTA';
        const totalStars = Game.progression?.totalStars?.() || 0;
        const lives = Number(Game.data?.lives ?? 0);
        const graphics = Game.settings?.graphicsLabel?.() || (Game.settings?.effectiveGraphics || 'MEDIUM');
        const difficultyMap = { EASY: 'FÁCIL', NORMAL: 'NORMAL', HARD: 'DIFÍCIL' };
        const difficulty = difficultyMap[Game.settings?.data?.difficulty] || 'NORMAL';
        const challenge = Game.challenges?.current;

        // Fundo do HUD
        const outerGrad = ctx.createLinearGradient(0, 0, 0, this.panelHeight);
        outerGrad.addColorStop(0, 'rgba(2, 8, 18, 0.96)');
        outerGrad.addColorStop(1, 'rgba(4, 11, 24, 0.82)');
        ctx.fillStyle = outerGrad;
        ctx.fillRect(0, 0, Game.width, this.panelHeight);
        ctx.strokeStyle = `${world.accent}55`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, this.panelHeight - 1);
        ctx.lineTo(Game.width, this.panelHeight - 1);
        ctx.stroke();

        // cards principais
        this.metricCard(ctx, 10, 8, 148, 38, 'Pontos', score, '#ffd166', '★');
        this.metricCard(ctx, 166, 8, 112, 38, 'Moedas', coins, '#ffbf47', '◉');

        // Card central do nível/mundo
        this.drawGlassPanel(ctx, 286, 6, 226, 42, world.accent, 0.8);
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = '#eff7fd';
        ctx.font = '700 18px Orbitron, Arial';
        ctx.fillText(`NÍVEL ${Game.data?.level || 1}`, 399, 10);
        ctx.font = '700 11px Rajdhani, Arial';
        ctx.fillStyle = world.accent;
        ctx.fillText(world.name, 399, 29);
        ctx.restore();

        // Card direito de status
        this.drawGlassPanel(ctx, 520, 6, 270, 42, '#5ab9ff', 0.8);
        ctx.save();
        ctx.textBaseline = 'middle';
        // vidas
        ctx.fillStyle = '#91aabc';
        ctx.font = '600 10px Rajdhani, Arial';
        ctx.textAlign = 'left';
        ctx.fillText('VIDAS', 534, 15);
        ctx.fillStyle = '#ff6b88';
        ctx.font = '700 20px Rajdhani, Arial';
        ctx.fillText(`♥ ${lives}`, 534, 31);
        // estrelas/rank
        ctx.fillStyle = '#91aabc';
        ctx.font = '600 10px Rajdhani, Arial';
        ctx.fillText('ESTRELAS', 602, 15);
        ctx.fillStyle = '#ffd166';
        ctx.font = '700 19px Rajdhani, Arial';
        ctx.fillText(`${totalStars}`, 602, 31);
        ctx.fillStyle = '#91aabc';
        ctx.font = '600 10px Rajdhani, Arial';
        ctx.fillText('RANK', 665, 15);
        ctx.fillStyle = '#8be8ff';
        ctx.font = '700 15px Rajdhani, Arial';
        ctx.fillText(rank, 665, 31);
        // combo chip dinâmica
        const comboColor = this.getComboColor();
        const comboText = this.combo > 1 ? `${this.combo}x COMBO` : `ETAPA ${stage}/5`;
        const comboW = 92;
        this.fillRoundRect(ctx, 688, 12, comboW, 24, 12, 'rgba(255,255,255,0.06)');
        this.strokeRoundRect(ctx, 688, 12, comboW, 24, 12, `${(this.combo > 1 ? comboColor : world.accent)}90`, 1);
        ctx.textAlign = 'center';
        ctx.fillStyle = this.combo > 1 ? comboColor : world.accent;
        ctx.font = '700 12px Rajdhani, Arial';
        ctx.fillText(comboText, 688 + comboW / 2, 24);
        ctx.restore();

        // Faixa inferior profissional
        this.drawFooterStrip(world, challenge, graphics, difficulty);
    }

    drawFooterStrip(world, challenge, graphics, difficulty) {
        const ctx = Game.ctx;
        const y = 50;
        const h = 16;
        this.fillRoundRect(ctx, 10, y, Game.width - 20, h, 8, 'rgba(255,255,255,0.04)');
        this.strokeRoundRect(ctx, 10, y, Game.width - 20, h, 8, 'rgba(255,255,255,0.08)', 1);

        ctx.save();
        ctx.textBaseline = 'middle';
        ctx.font = '600 11px Rajdhani, Arial';
        ctx.textAlign = 'left';
        const challengeText = challenge ? `DESAFIO: ${challenge.name} — ${challenge.desc}` : `${world.name} — ${world.subtitle}`;
        ctx.fillStyle = '#dbe8f0';
        ctx.fillText(this.ellipsize(ctx, challengeText, 355), 22, y + 8);

        ctx.fillStyle = '#88a7ba';
        ctx.fillText(`DIFICULDADE: ${difficulty}`, 390, y + 8);
        ctx.fillStyle = '#67dbff';
        ctx.fillText(`GRÁFICOS: ${graphics}`, 528, y + 8);
        ctx.restore();

        this.drawLevelProgress(y + 2);
    }

    drawLevelProgress(y = 52) {
        if (!Game.brickManager || !Game.brickManager.bricks) return;
        const total = Game.brickManager.bricks.length;
        const remaining = Game.brickManager.getActiveBricksCount();
        if (total <= 0) return;

        const ctx = Game.ctx;
        const progress = Math.max(0, Math.min(1, 1 - (remaining / total)));
        const x = 640;
        const w = 136;
        const h = 8;

        this.fillRoundRect(ctx, x, y, w, h, 5, 'rgba(0,0,0,0.45)');

        const bar = ctx.createLinearGradient(x, y, x + w, y);
        bar.addColorStop(0, '#4CAF50');
        bar.addColorStop(0.5, '#FFD700');
        bar.addColorStop(1, '#00d2ff');
        this.fillRoundRect(ctx, x, y, Math.max(8, w * progress), h, 5, bar);
        this.strokeRoundRect(ctx, x, y, w, h, 5, 'rgba(255,255,255,0.18)', 1);

        ctx.save();
        ctx.textAlign = 'right';
        ctx.textBaseline = 'alphabetic';
        ctx.font = '700 10px Rajdhani, Arial';
        ctx.fillStyle = '#f4fbff';
        ctx.fillText(`${remaining}/${total}`, x + w, y - 1);
        ctx.restore();
    }

    drawNotifications() {
        const ctx = Game.ctx;
        const baseX = Game.width - 16;
        const baseY = 80;

        this.notifications.forEach((notif, index) => {
            const lifeRatio = Math.max(0, Math.min(1, notif.life / (notif.maxLife || 1)));
            const width = Math.min(280, Math.max(140, ctx.measureText(notif.text).width + 38));
            const height = 28;
            const x = baseX - width;
            const y = baseY + index * 32 - (1 - lifeRatio) * 6;

            ctx.save();
            ctx.globalAlpha = notif.alpha;
            this.drawGlassPanel(ctx, x, y, width, height, notif.color, 0.82);
            ctx.fillStyle = notif.color;
            ctx.font = '700 14px Rajdhani, Arial';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(notif.text, x + 12, y + height / 2 + 1);
            ctx.restore();
        });
    }

    drawPauseMenu() {
        const ctx = Game.ctx;
        ctx.fillStyle = 'rgba(1, 6, 14, 0.72)';
        ctx.fillRect(0, 0, Game.width, Game.height);
        this.drawCenteredStatePanel('PAUSADO', '#00d2ff', [
            'A partida está pausada.',
            'Pressione P para continuar.',
            'Pressione ESC para voltar ao menu.'
        ]);
    }

    drawGameOverScreen() {
        const ctx = Game.ctx;
        ctx.fillStyle = 'rgba(3, 6, 14, 0.84)';
        ctx.fillRect(0, 0, Game.width, Game.height);
        const lines = [
            `Pontuação Final: ${this.formatNumber(Game.data?.score || 0)}`,
            `Nível Alcançado: ${Game.data?.level || 1}`,
            `Melhor Combo: ${this.maxCombo}x`
        ];
        this.drawCenteredStatePanel('GAME OVER', '#ff617a', lines, true);

        if ((Game.data?.score || 0) > (Game.data?.highScore || 0)) {
            ctx.save();
            ctx.textAlign = 'center';
            ctx.fillStyle = '#ffd166';
            ctx.font = '700 18px Rajdhani, Arial';
            ctx.fillText('NOVO RECORDE!', Game.width / 2, Game.height / 2 + 84);
            ctx.restore();
            Game.data.highScore = Game.data.score;
            Game.economy?.saveGlobalData?.();
        }
    }

    drawCenteredStatePanel(title, accent, lines = [], showControls = false) {
        const ctx = Game.ctx;
        const w = 420;
        const h = 230;
        const x = (Game.width - w) / 2;
        const y = (Game.height - h) / 2;

        this.drawGlassPanel(ctx, x, y, w, h, accent, 0.9);
        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = accent;
        ctx.font = '700 34px Orbitron, Arial';
        ctx.fillText(title, Game.width / 2, y + 52);

        ctx.fillStyle = '#f4fbff';
        ctx.font = '600 20px Rajdhani, Arial';
        lines.forEach((line, i) => ctx.fillText(line, Game.width / 2, y + 102 + i * 28));

        if (showControls) {
            ctx.fillStyle = '#8ea9ba';
            ctx.font = '600 16px Rajdhani, Arial';
            ctx.fillText('R - Reiniciar  •  ESC - Menu', Game.width / 2, y + h - 30);
        }
        ctx.restore();
    }
}
