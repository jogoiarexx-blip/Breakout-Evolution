class ProgressionManager {
  constructor(){this.key='breakout_progress_v042';this.data={unlocked:1,bestLevel:1,completed:[]};this.load();}
  load(){try{const s=JSON.parse(localStorage.getItem(this.key)||'{}');this.data={...this.data,...s};}catch(e){}}
  save(){try{localStorage.setItem(this.key,JSON.stringify(this.data));}catch(e){}}
  isUnlocked(level){return level<=this.data.unlocked;}
  complete(level){
    if(!this.data.completed.includes(level)) this.data.completed.push(level);
    this.data.bestLevel=Math.max(this.data.bestLevel,level);
    this.data.unlocked=Math.max(this.data.unlocked,Math.min(25,level+1));
    this.save();
  }
  maxSelectable(){return Math.max(1,this.data.unlocked);}
}
