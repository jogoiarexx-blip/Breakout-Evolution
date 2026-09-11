class WorldManager {
  constructor(){
    this.worlds=[
      {id:1,name:'NEON DISTRICT',subtitle:'Circuitos de luz',accent:'#00d2ff',brickBias:['normal','normal','strong','coin'],modifier:'balanced'},
      {id:2,name:'FORNALHA',subtitle:'Calor e explosões',accent:'#ff6b35',brickBias:['strong','explosive','normal','metal'],modifier:'volatile'},
      {id:3,name:'CRYSTAL CAVES',subtitle:'Resistência cristalina',accent:'#b388ff',brickBias:['strong','diamond','metal','coin'],modifier:'durable'},
      {id:4,name:'VOID GRID',subtitle:'Setor instável',accent:'#8f5cff',brickBias:['metal','strong','explosive','diamond'],modifier:'fast'},
      {id:5,name:'GOLDEN CORE',subtitle:'Núcleo final',accent:'#ffd166',brickBias:['diamond','metal','strong','coin'],modifier:'elite'}
    ];
  }
  worldIndex(level){return Math.floor(((level-1)%25)/5);}
  get(level){return this.worlds[this.worldIndex(level)]||this.worlds[0];}
  stageInWorld(level){return ((level-1)%5)+1;}
  isMiniBoss(level){return level%5===0 && level%10!==0;}
  isBoss(level){return level%10===0;}
  label(level){const w=this.get(level); return `${w.name} • ${this.stageInWorld(level)}/5`;}
  chooseBrick(level,difficulty){
    const w=this.get(level), pool=w.brickBias.slice();
    if(difficulty>=5) pool.push('metal');
    if(difficulty>=7) pool.push('diamond');
    const r=Math.random();
    if(r<.045)return 'coin';
    if(r<.085)return 'explosive';
    return pool[Math.floor(Math.random()*pool.length)]||'normal';
  }
  difficultyMultiplier(level){
    const mod=this.get(level).modifier;
    return ({balanced:1,volatile:1.03,durable:1.06,fast:1.09,elite:1.12})[mod]||1;
  }
}
