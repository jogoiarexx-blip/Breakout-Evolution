class ProgressionManager {
  constructor(){this.key='breakout_progress_v046';this.legacyKey='breakout_progress_v045';this.data={unlocked:1,bestLevel:1,completed:[],stars:{},worldRewards:[]};this.load();}
  load(){try{const raw=localStorage.getItem(this.key)||localStorage.getItem(this.legacyKey)||'{}';const s=JSON.parse(raw);this.data={...this.data,...s,stars:s.stars||{},worldRewards:s.worldRewards||[]};}catch(e){}}
  save(){try{localStorage.setItem(this.key,JSON.stringify(this.data));}catch(e){}}
  isUnlocked(level){return level<=this.data.unlocked;}
  complete(level,result={}){
    if(!this.data.completed.includes(level)) this.data.completed.push(level);
    this.data.bestLevel=Math.max(this.data.bestLevel,level);
    this.data.unlocked=Math.max(this.data.unlocked,Math.min(25,level+1));
    const stars=Math.max(this.data.stars[level]||0,result.stars||1);this.data.stars[level]=stars;
    this.save();return stars;
  }
  stars(level){return this.data.stars[level]||0;}
  totalStars(){return Object.values(this.data.stars).reduce((a,b)=>a+(Number(b)||0),0);}
  claimWorld(world){if(this.data.worldRewards.includes(world))return false;this.data.worldRewards.push(world);this.save();return true;}
  worldStars(world){const start=(world-1)*5+1;let n=0;for(let i=start;i<start+5;i++)n+=this.stars(i);return n;}
  worldCompleted(world){const end=world*5;return this.data.completed.includes(end);}
  worldAchievement(world){const st=this.worldStars(world),done=this.worldCompleted(world);if(done&&st>=15)return {name:'PERFEITO',icon:'♛'};if(done&&st>=12)return {name:'MESTRE',icon:'★'};if(done)return {name:'CONQUISTADO',icon:'✓'};return {name:'EM PROGRESSO',icon:'◇'};}
  starRank(){const s=this.totalStars();if(s>=70)return 'LENDÁRIO';if(s>=55)return 'MESTRE';if(s>=35)return 'VETERANO';if(s>=15)return 'PILOTO';return 'RECRUTA';}
  completionPercent(){return Math.round((this.data.completed.length/25)*100);}
  maxSelectable(){return Math.max(1,this.data.unlocked);}
}
