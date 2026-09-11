class AssetManager {
  constructor(){
    this.images=new Map(); this.audio=new Map(); this.currentLevel=1;
    this.sharedImages={
      menu:'assets/images/backgrounds/menu.webp',
      paddle:'assets/images/paddle/default.webp',
      ball:'assets/images/ball/default.webp', fireball:'assets/images/ball/fire.webp'
    };
    this.levelManifests={};
    for(let i=1;i<=5;i++) this.levelManifests[i]={background:`assets/images/backgrounds/level-${i}.webp`,music:`assets/audio/music/level-${i}.wav`};
    this.bricks=['normal','strong','metal','diamond','explosive','coin','mystery'];
    this.powerups=['multiball','expand','life','slow','fireball','shield']; // laser/overcharge usam fallback vetorial premium
  }
  async loadImage(key,url){ if(this.images.has(key)) return this.images.get(key); return new Promise(resolve=>{const img=new Image();img.onload=()=>{this.images.set(key,img);resolve(img)};img.onerror=()=>resolve(null);img.src=url;}); }
  async preloadShared(progress=()=>{}){
    const jobs=Object.entries(this.sharedImages); let done=0;
    for(const [k,u] of jobs){await this.loadImage(k,u); progress(++done/jobs.length);}
  }
  async loadLevel(level,progress=()=>{}){
    this.currentLevel=level; const theme=Math.floor(((level-1)%25)/5)+1; const manifest=this.levelManifests[theme];
    const jobs=[[`bg-${theme}`,manifest.background]];
    this.bricks.forEach(n=>jobs.push([`brick-${n}`,`assets/images/bricks/${n}.webp`]));
    this.powerups.forEach(n=>jobs.push([`power-${n}`,`assets/images/powerups/${n}.webp`]));
    let done=0; for(const [k,u] of jobs){await this.loadImage(k,u);progress(++done/jobs.length);}
    if(Game.audio) await Game.audio.setLevelMusic(theme, manifest.music);
  }
  image(key){return this.images.get(key)||null;}
  backgroundForLevel(level=this.currentLevel){return this.image(`bg-${Math.floor(((level-1)%25)/5)+1}`);}
}
