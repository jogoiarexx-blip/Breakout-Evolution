// meta-progression.js - árvore permanente de estrelas + modificadores de corrida v0.4.6
class MetaProgressionSystem {
  constructor(){
    this.key='breakout_meta_v046';
    this.data={spent:0,levels:{wide:0,reserve:0,luck:0,bounty:0,stability:0}};
    this.nodes=[
      {id:'wide',name:'PADDLE MATRIX',desc:'+6px de largura por nível',max:3,cost:[3,5,7]},
      {id:'reserve',name:'RESERVA DE NÚCLEO',desc:'+1 vida máxima por nível',max:2,cost:[6,10]},
      {id:'luck',name:'SINAL DE SORTE',desc:'+2% chance de power-up por nível',max:3,cost:[4,6,8]},
      {id:'bounty',name:'PROTOCOLO BOUNTY',desc:'+10% moedas recebidas por nível',max:3,cost:[4,7,10]},
      {id:'stability',name:'ESTABILIZADOR',desc:'-3% velocidade inicial da bola por nível',max:3,cost:[3,6,9]}
    ];
    this.load();
  }
  load(){try{const s=JSON.parse(localStorage.getItem(this.key)||'{}');if(s&&s.levels)this.data={...this.data,...s,levels:{...this.data.levels,...s.levels}};}catch(e){}}
  save(){try{localStorage.setItem(this.key,JSON.stringify(this.data));}catch(e){}}
  totalStars(){return Game.progression?.totalStars?.()||0;}
  available(){return Math.max(0,this.totalStars()-(this.data.spent||0));}
  node(id){return this.nodes.find(n=>n.id===id);}
  level(id){return this.data.levels[id]||0;}
  nextCost(id){const n=this.node(id),lv=this.level(id);return n&&lv<n.max?n.cost[lv]:0;}
  buy(id){const n=this.node(id);if(!n)return false;const lv=this.level(id);if(lv>=n.max)return false;const cost=n.cost[lv];if(this.available()<cost)return false;this.data.levels[id]=lv+1;this.data.spent+=cost;this.save();return true;}
  effects(){return {
    paddleWidth:this.level('wide')*6,
    extraLives:this.level('reserve'),
    powerupChance:this.level('luck')*.02,
    coinMultiplier:1+this.level('bounty')*.10,
    ballSpeedMultiplier:1-this.level('stability')*.03
  };}
}

class RunModifierSystem {
  constructor(){
    this.items=[
      {id:'standard',name:'PADRÃO',desc:'Sem modificadores. Experiência equilibrada.',accent:'#00d2ff'},
      {id:'fortune',name:'FORTUNA',desc:'+40% moedas, porém bola 8% mais rápida.',accent:'#ffd166'},
      {id:'arsenal',name:'ARSENAL',desc:'+8% chance de power-up e laser inicial por 8s.',accent:'#ff4fd8'},
      {id:'guardian',name:'GUARDIÃO',desc:'Paddle +14px, mas bônus de pontuação -15%.',accent:'#7dffcf'},
      {id:'overdrive',name:'OVERDRIVE',desc:'Bola +15% rápida e +35% pontuação.',accent:'#ff6b35'}
    ];
    this.selected=0;
  }
  current(){return this.items[this.selected]||this.items[0];}
  cycle(dir){this.selected=(this.selected+dir+this.items.length)%this.items.length;return this.current();}
  effects(){const id=this.current().id;const base={ballSpeed:1,paddleWidth:0,powerupChance:0,coinMultiplier:1,scoreMultiplier:1,startLaser:false};
    if(id==='fortune')Object.assign(base,{ballSpeed:1.08,coinMultiplier:1.4});
    if(id==='arsenal')Object.assign(base,{powerupChance:.08,startLaser:true});
    if(id==='guardian')Object.assign(base,{paddleWidth:14,scoreMultiplier:.85});
    if(id==='overdrive')Object.assign(base,{ballSpeed:1.15,scoreMultiplier:1.35});
    return base;}
}
