// challenges.js - Desafios, estrelas e recompensas da v0.5.0
class ChallengeSystem {
  constructor(){ this.current=null; }
  start(level){
    const world=Game.worlds?.worldIndex(level)||0;
    const defs=[
      {name:'Combo Neon',desc:'Alcance combo 8x',check:s=>s.maxCombo>=8},
      {name:'Sem Queimar',desc:'Conclua sem perder mais de 1 vida',check:s=>s.livesLost<=1},
      {name:'Precisão Cristal',desc:'Conclua com combo 12x',check:s=>s.maxCombo>=12},
      {name:'Ruptura do Vazio',desc:'Conclua em menos de 95s',check:s=>s.elapsed<=95},
      {name:'Núcleo Perfeito',desc:'Conclua sem perder vida',check:s=>s.livesLost===0}
    ];
    this.current=defs[Math.max(0,Math.min(defs.length-1,world))];
    Game.levelRunStats={startedAt:performance.now(),startLives:Game.data.lives,maxCombo:0,livesLost:0,elapsed:0};
  }
  update(){
    const s=Game.levelRunStats;if(!s)return;
    s.maxCombo=Math.max(s.maxCombo,Game.hud?.combo||0);
    s.livesLost=Math.max(0,(s.startLives||Game.data.lives)-Game.data.lives);
    s.elapsed=(performance.now()-s.startedAt)/1000;
  }
  finish(level){
    this.update();const s=Game.levelRunStats||{maxCombo:0,livesLost:99,elapsed:999};
    const stars=1 + (s.livesLost===0?1:0) + ((this.current?.check(s))?1:0);
    return {level,stars:Math.min(3,stars),challenge:this.current?.name||'',challengeDone:!!this.current?.check(s),stats:{...s}};
  }
  drawHUD(){
    if(!this.current||!Game.levelRunStats)return;
    const c=Game.ctx;c.save();c.textAlign='left';c.font='600 11px Rajdhani,Arial';c.fillStyle='rgba(0,0,0,.58)';c.fillRect(14,58,230,38);c.strokeStyle='rgba(255,255,255,.12)';c.strokeRect(14,58,230,38);c.fillStyle='#f2f7fb';c.fillText('DESAFIO: '+this.current.name.toUpperCase(),24,74);c.fillStyle='#91aabc';c.fillText(this.current.desc,24,89);c.restore();
  }
}
