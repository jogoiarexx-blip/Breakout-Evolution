class AssetManager {
  constructor(){
    this.images=new Map(); this.audio=new Map(); this.currentLevel=1;
    this.sharedImages={
      menu:'assets/images/backgrounds/menu.webp',
      paddle:'assets/images/paddle/default.webp',
      paddleWide:'assets/images/paddle/wide.webp',
      paddleShield:'assets/images/paddle/shielded.webp',
      paddleLaser:'assets/images/paddle/laser.webp',
      ball:'assets/images/ball/default.webp', fireball:'assets/images/ball/fire.webp', overchargeBall:'assets/images/ball/overcharge.webp',
      hazardPortalBlue:'assets/images/hazards/portal-blue.webp', hazardPortalPurple:'assets/images/hazards/portal-purple.webp',
      hazardGravity:'assets/images/hazards/gravity.webp', hazardMagma:'assets/images/hazards/magma.webp', hazardBarrier:'assets/images/hazards/barrier.webp',
      vfxLaser:'assets/images/vfx/laser-bolt.webp', vfxBurst:'assets/images/vfx/energy-burst.webp', vfxExplosion:'assets/images/vfx/explosion.webp' 
    };
    this.levelManifests={};
    for(let i=1;i<=5;i++) this.levelManifests[i]={background:`assets/images/backgrounds/level-${i}.webp`,music:`assets/audio/music/level-${i}.wav`};
    this.bricks=['normal','strong','metal','diamond','explosive','coin','mystery','lava','neon','void','moving'];
    this.powerups=['multiball','expand','life','slow','fireball','shield','laser','coin'];
    this.bossWorlds=['neon','furnace','crystal','void','gold'];
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
    const bw=this.bossWorlds[theme-1];
    jobs.push([`boss-${theme}`,`assets/images/bosses/${bw}-boss.webp`],[`mini-${theme}`,`assets/images/bosses/${bw}-mini.webp`]);
    ['pulse','rain','warning-laser','shockwave','summon','hit-flash','damage-burst','defeat-explosion'].forEach(n=>jobs.push([`vfx-${n}`,`assets/images/vfx/${n}.webp`]));
    let done=0; for(const [k,u] of jobs){await this.loadImage(k,u);progress(++done/jobs.length);}
    if(Game.audio) await Game.audio.setLevelMusic(theme, manifest.music);
  }
  image(key){return this.images.get(key)||null;}
  backgroundForLevel(level=this.currentLevel){return this.image(`bg-${Math.floor(((level-1)%25)/5)+1}`);}
}
