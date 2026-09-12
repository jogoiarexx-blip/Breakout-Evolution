class BossSystem {
  constructor(){
    this.active=false;this.level=0;this.kind=null;this.timer=0;this.attackTimer=0;this.phase=1;this.projectiles=[];this.beams=[];this.intro=0;this.introDuration=2.4;this.originalBossPositions=[];this.rewardGiven=false;
    this.patternIndex=0;
  }
  start(level){
    this.active = level%5===0; this.level=level; this.kind=level%10===0?'BOSS':'MINI_BOSS';
    this.timer=0;this.attackTimer=0;this.phase=1;this.projectiles=[];this.beams=[];this.intro=this.introDuration;this.rewardGiven=false;this.patternIndex=0;
    this.captureBossPositions();
    if(this.active){
      Game.state='BOSS_INTRO';
      if(Game.ball) Game.ball.active=false;
      if(Game.audio) Game.audio.play('bossWarning');
      if(Game.hud) Game.hud.addNotification(this.kind==='BOSS'?'⚠ CORE GUARDIAN DETECTADO':'⚠ MINI-GUARDIÃO', this.kind==='BOSS'?'#ff3158':'#ffad42',2.2);
    }
  }
  captureBossPositions(){
    const bosses=Game.brickManager?.bricks?.filter(b=>b.isBoss)||[];
    this.originalBossPositions=bosses.map(b=>({b,x:b.x,y:b.y}));
  }
  healthRatio(){
    const all=Game.brickManager?.bricks?.filter(b=>b.isBoss)||[];
    if(!all.length)return 0;const max=all.reduce((s,b)=>s+(b.stats?.hits||1),0)||1;const cur=all.reduce((s,b)=>s+Math.max(0,b.currentHits||0),0);return cur/max;
  }
  update(dt=1/60){
    if(!this.active)return;
    this.timer+=dt;
    const hp=this.healthRatio();this.phase=hp>.66?1:hp>.33?2:3;
    if(Game.state==='BOSS_INTRO'){
      this.intro-=dt;
      this.animateBossBricks();
      if(this.intro<=0){Game.state='PLAYING';if(Game.ball){Game.ball.reset();Game.ball.active=false;} if(Game.hud)Game.hud.addNotification('ESPAÇO PARA LANÇAR','#ffffff',1.4);}
      return;
    }
    if(Game.state!=='PLAYING')return;
    this.animateBossBricks();this.updateProjectiles(dt);this.updateBeams(dt);
    this.attackTimer-=dt;
    if(this.attackTimer<=0){this.performAttack();const base=this.kind==='BOSS'?2.1:3.0;this.attackTimer=Math.max(.75,base-(this.phase-1)*.42-(Game.settings?.data?.difficulty==='HARD'?.35:0));}
  }
  animateBossBricks(){
    if(!this.originalBossPositions.length)this.captureBossPositions();
    const amp=this.kind==='BOSS'?(this.phase===3?20:12):7;
    this.originalBossPositions.forEach((p,i)=>{
      if(p.b.destroyed)return;
      p.b.x=p.x+Math.sin(this.timer*1.35+i*.48)*amp;
      p.b.y=p.y+Math.sin(this.timer*1.9+i*.27)*3;
    });
  }
  performAttack(){
    const attacks=this.kind==='BOSS'?['spread','beam','rain','spread']:['spread','rain'];
    const type=attacks[this.patternIndex++%attacks.length];
    if(type==='spread')this.attackSpread(); else if(type==='rain')this.attackRain(); else this.attackBeam();
  }
  bossCenter(){
    const bs=Game.brickManager?.bricks?.filter(b=>b.isBoss&&!b.destroyed)||[];
    if(!bs.length)return{x:Game.width/2,y:145};
    return{x:bs.reduce((s,b)=>s+b.x+b.width/2,0)/bs.length,y:bs.reduce((s,b)=>s+b.y+b.height/2,0)/bs.length};
  }
  attackSpread(){
    const c=this.bossCenter(),n=this.kind==='BOSS'?5+(this.phase-1)*2:3+(this.phase-1);
    for(let i=0;i<n;i++){const a=Math.PI*.22+(Math.PI*.56)*(i/Math.max(1,n-1));const sp=2.1+this.phase*.42;this.projectiles.push({x:c.x,y:c.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:5+this.phase,color:this.kind==='BOSS'?'#ff3158':'#ffad42'});}
    if(Game.hud)Game.hud.addNotification('ATAQUE: PULSO','#ff6b6b',.8);
  }
  attackRain(){
    const count=this.kind==='BOSS'?5+this.phase:3+this.phase;
    for(let i=0;i<count;i++)this.projectiles.push({x:55+Math.random()*(Game.width-110),y:70-Math.random()*80,vx:(Math.random()-.5)*.6,vy:2.1+this.phase*.55,r:5,color:'#b388ff'});
    if(Game.hud)Game.hud.addNotification('ATAQUE: CHUVA DE ENERGIA','#b388ff',.8);
  }
  attackBeam(){
    const x=70+Math.random()*(Game.width-140);this.beams.push({x,w:32,warning:1.15,active:.55});
    if(Game.hud)Game.hud.addNotification('⚠ LASER CARREGANDO','#ff3158',1.0);
  }
  updateProjectiles(dt){
    const scale=dt*60;
    for(let i=this.projectiles.length-1;i>=0;i--){const p=this.projectiles[i];p.x+=p.vx*scale;p.y+=p.vy*scale;
      if(this.hitPaddle(p.x,p.y,p.r)){this.damagePlayer();this.projectiles.splice(i,1);continue;}
      if(p.y>Game.height+30||p.x<-30||p.x>Game.width+30)this.projectiles.splice(i,1);
    }
  }
  updateBeams(dt){
    for(let i=this.beams.length-1;i>=0;i--){const b=this.beams[i];if(b.warning>0){b.warning-=dt;continue;}b.active-=dt;
      if(b.active>0&&Game.paddle&&Game.paddle.x+Game.paddle.width>b.x&&Game.paddle.x<b.x+b.w){if(!b.hit){b.hit=true;this.damagePlayer();}}
      if(b.active<=0)this.beams.splice(i,1);
    }
  }
  hitPaddle(x,y,r){const p=Game.paddle;return p&&x+r>p.x&&x-r<p.x+p.width&&y+r>p.y&&y-r<p.y+p.height;}
  damagePlayer(){
    if(Game.bossInvulnUntil&&performance.now()<Game.bossInvulnUntil)return;Game.bossInvulnUntil=performance.now()+1100;
    Game.data.lives=Math.max(0,Game.data.lives-1);if(Game.audio)Game.audio.play('lifeLost');if(Game.particles)Game.particles.emit(Game.paddle.x+Game.paddle.width/2,Game.paddle.y,28,'#ff3158');
    if(Game.hud)Game.hud.addNotification('DANO DO BOSS! -1 VIDA','#ff3158',1.1);
    if(Game.data.lives<=0){Game.state='GAME_OVER';if(Game.ball)Game.ball.active=false;}
  }
  onDefeated(){
    if(!this.active||this.rewardGiven)return;this.rewardGiven=true;
    const id=`boss_${this.level}`;let rewards={};try{rewards=JSON.parse(localStorage.getItem('breakout_boss_rewards_v043')||'{}');}catch(e){}
    if(!rewards[id]){rewards[id]=true;try{localStorage.setItem('breakout_boss_rewards_v043',JSON.stringify(rewards));}catch(e){}
      const coins=this.kind==='BOSS'?250+this.level*8:100+this.level*4;Game.economy?.addCoins(coins);Game.data.maxLives=Math.min(8,(Game.data.maxLives||3)+(this.kind==='BOSS'?1:0));Game.data.lives=Math.max(Game.data.lives,Game.data.maxLives);
      if(Game.hud)Game.hud.addNotification(this.kind==='BOSS'?`RECOMPENSA: +1 VIDA MÁX • +${coins} MOEDAS`:`RECOMPENSA: +${coins} MOEDAS`,'#ffd166',2.4);
    }
    if(Game.audio) Game.audio.play('explosion');
    this.active=false;this.projectiles=[];this.beams=[];
  }
  draw(){
    if(!this.active)return;const ctx=Game.ctx;ctx.save();
    for(const p of this.projectiles){const fx=Game.assets?.image('vfx-pulse');ctx.shadowBlur=Game.settings?.effectiveGraphics==='LOW'?0:14;ctx.shadowColor=p.color;if(fx){const z=p.r*5.5;ctx.drawImage(fx,p.x-z/2,p.y-z/2,z,z);}else{ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();}}
    ctx.shadowBlur=0;
    for(const b of this.beams){if(b.warning>0){const fx=Game.assets?.image('vfx-warning-laser');ctx.globalAlpha=.35+.2*Math.sin(this.timer*14);if(fx)ctx.drawImage(fx,b.x-30,55,b.w+60,Game.height-110);else{ctx.fillStyle='#ff3158';ctx.fillRect(b.x,70,b.w,Game.height-130);}}else{ctx.globalAlpha=.78;ctx.fillStyle='#fff';ctx.fillRect(b.x,70,b.w,Game.height-130);ctx.globalAlpha=.9;ctx.fillStyle='#ff3158';ctx.fillRect(b.x+7,70,b.w-14,Game.height-130);}}
    ctx.globalAlpha=1;
    this.drawWorldCore(ctx);
    if(Game.state==='BOSS_INTRO')this.drawIntro(ctx);ctx.restore();
  }
  drawWorldCore(ctx){
    const c=this.bossCenter(),wi=Game.worlds?.worldIndex(this.level)||0,q=Game.settings?.effectiveGraphics||'MEDIUM',t=this.timer;
    const bossSprite=Game.assets?.image(`${this.kind==='BOSS'?'boss':'mini'}-${wi+1}`);
    if(bossSprite){ctx.save();ctx.translate(c.x,c.y);const pulse=1+Math.sin(t*3)*.035;ctx.scale(pulse,pulse);const size=this.kind==='BOSS'?112:86;if(q!=='LOW'){ctx.shadowBlur=24;ctx.shadowColor=['#00d2ff','#ff6238','#8ee7ff','#b388ff','#ffd166'][wi]||'#fff';}ctx.drawImage(bossSprite,-size/2,-size/2,size,size);ctx.restore();return;}
    
    const colors=['#00d2ff','#ff6238','#8ee7ff','#b388ff','#ffd166'];const color=colors[wi]||'#fff';
    ctx.save();ctx.translate(c.x,c.y);ctx.rotate(t*(wi%2?-.45:.45));ctx.globalAlpha=.88;
    if(q!=='LOW'){ctx.shadowBlur=18+(this.phase*4);ctx.shadowColor=color;}ctx.strokeStyle=color;ctx.fillStyle='rgba(5,10,18,.72)';ctx.lineWidth=3;
    ctx.beginPath();
    const sides=[6,5,4,8,3][wi]||6,rad=this.kind==='BOSS'?34:25;
    for(let i=0;i<sides;i++){const a=-Math.PI/2+i*Math.PI*2/sides,x=Math.cos(a)*rad,y=Math.sin(a)*rad;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.closePath();ctx.fill();ctx.stroke();
    ctx.rotate(-t*(wi%2?-.9:.9));ctx.fillStyle=color;ctx.globalAlpha=.34+.18*Math.sin(t*5);ctx.beginPath();ctx.arc(0,0,10+this.phase*2,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=.95;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(0,0,3+this.phase,0,Math.PI*2);ctx.fill();ctx.restore();
  }

  drawIntro(ctx){
    const p=1-Math.max(0,this.intro)/this.introDuration;ctx.fillStyle=`rgba(0,0,0,${.68*(1-Math.max(0,p-.8)/.2)})`;ctx.fillRect(0,0,Game.width,Game.height);
    ctx.textAlign='center';ctx.font='900 42px Orbitron,Arial';ctx.fillStyle=this.kind==='BOSS'?'#ff3158':'#ffad42';ctx.shadowBlur=22;ctx.shadowColor=ctx.fillStyle;ctx.fillText(this.kind==='BOSS'?'BOSS BATTLE':'MINI-BOSS',Game.width/2,270);ctx.shadowBlur=0;
    const world=Game.worlds?.get(this.level);ctx.font='700 18px Rajdhani,Arial';ctx.fillStyle='#fff';ctx.fillText(`${world?.name||'CORE'} • FASE ${this.level}`,Game.width/2,306);
    ctx.font='600 13px Rajdhani,Arial';ctx.fillStyle='#9eb7c6';ctx.fillText('Destrua o núcleo e desvie dos padrões de ataque',Game.width/2,335);
  }
}
