// challenges.js - Desafios, estrelas e recompensas da v0.5.2
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
    // Integrado ao HUD principal a partir da v0.5.4.
    // Mantido como método compatível para não quebrar chamadas antigas.
    return;
  }
}
