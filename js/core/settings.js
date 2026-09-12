class SettingsManager {
  constructor(){
    this.key='breakout_settings_v041';
    this.options={graphics:['AUTO','LOW','MEDIUM','HIGH'],gpu:['AUTO','PERFORMANCE','COMPATIBILITY'],difficulty:['EASY','NORMAL','HARD'],audio:[true,false]};
    this.data={graphics:'AUTO',gpu:'AUTO',difficulty:'NORMAL',audio:true,masterVolume:80,musicVolume:65,sfxVolume:85};
    this.effectiveGraphics='MEDIUM'; this.fpsSamples=[]; this.lastAutoAdjust=0;
    this.load(); this.sanitize(); this.apply(true);
  }
  load(){try{const saved=JSON.parse(localStorage.getItem(this.key)||'{}');this.data={...this.data,...saved};}catch(e){}}
  sanitize(){for(const k of ['masterVolume','musicVolume','sfxVolume'])this.data[k]=Math.max(0,Math.min(100,Number(this.data[k]??80)));}
  save(){localStorage.setItem(this.key,JSON.stringify(this.data));}
  cycle(key,dir=1){const arr=this.options[key];if(!arr)return;const i=Math.max(0,arr.indexOf(this.data[key]));this.data[key]=arr[(i+dir+arr.length)%arr.length];this.save();this.apply();}
  adjustVolume(key,dir=1){if(!['masterVolume','musicVolume','sfxVolume'].includes(key))return;this.data[key]=Math.max(0,Math.min(100,(Number(this.data[key])||0)+dir*10));this.save();this.apply(true);}
  toggleAudio(){this.data.audio=!this.data.audio;this.save();this.apply(true);}
  detectGraphics(){const cores=navigator.hardwareConcurrency||4;const mem=navigator.deviceMemory||4;return (cores<=2||mem<=2)?'LOW':(cores>=8&&mem>=8?'HIGH':'MEDIUM');}
  apply(initial=false){
    this.effectiveGraphics=this.data.graphics==='AUTO'?this.detectGraphics():this.data.graphics;
    document.body.classList.remove('quality-low','quality-medium','quality-high');
    document.body.classList.add('quality-'+this.effectiveGraphics.toLowerCase());
    if(window.Game&&Game.renderer){Game.renderer.setMode(this.data.gpu||'AUTO');Game.renderer.applyQuality(this.effectiveGraphics);Game.ctx=Game.renderer.ctx;}
    else if(window.Game&&Game.ctx){Game.ctx.imageSmoothingEnabled=this.effectiveGraphics!=='LOW';Game.ctx.imageSmoothingQuality=this.effectiveGraphics==='HIGH'?'high':'medium';}
    if(window.Game&&Game.audio){Game.audio.setEnabled(this.data.audio);Game.audio.setMix(this.data.masterVolume/100,this.data.musicVolume/100,this.data.sfxVolume/100);}
    if(!initial&&window.Game&&Game.hud)Game.hud.addNotification(`GRÁFICOS: ${this.graphicsLabel()}`,'#00d2ff',1.3);
  }
  graphicsLabel(){return this.data.graphics==='AUTO'?`AUTO (${this.effectiveGraphics})`:this.data.graphics;}
  gpuLabel(){return ({AUTO:'AUTO',PERFORMANCE:'GPU PREFERIDA',COMPATIBILITY:'COMPATÍVEL'})[this.data.gpu]||'AUTO';}
  difficulty(){return CONFIG.DIFFICULTY[this.data.difficulty]||CONFIG.DIFFICULTY.NORMAL;}
  particleFactor(){return ({LOW:.25,MEDIUM:.62,HIGH:1})[this.effectiveGraphics]||.62;}
  shadows(){return this.effectiveGraphics!=='LOW';}
  trails(){return ({LOW:4,MEDIUM:9,HIGH:CONFIG.BALL.TRAIL_LENGTH})[this.effectiveGraphics]||9;}
  observeFPS(fps){
    if(this.data.graphics!=='AUTO'||!Number.isFinite(fps)||fps<=0)return;
    this.fpsSamples.push(fps);if(this.fpsSamples.length>6)this.fpsSamples.shift();
    const now=performance.now();if(this.fpsSamples.length<6||now-this.lastAutoAdjust<5000)return;
    const avg=this.fpsSamples.reduce((a,b)=>a+b,0)/this.fpsSamples.length; const old=this.effectiveGraphics;
    if(avg<42)this.effectiveGraphics='LOW';else if(avg<55)this.effectiveGraphics='MEDIUM';else if(avg>=59&&(navigator.hardwareConcurrency||4)>=8)this.effectiveGraphics='HIGH';
    if(old!==this.effectiveGraphics){this.lastAutoAdjust=now;document.body.classList.remove('quality-low','quality-medium','quality-high');document.body.classList.add('quality-'+this.effectiveGraphics.toLowerCase());if(window.Game&&Game.renderer)Game.renderer.applyQuality(this.effectiveGraphics);}
  }
}
