class LevelLoader {
  constructor(){this.overlay=document.getElementById('loading');this.fill=document.querySelector('.loader-fill');this.text=document.querySelector('.loading-text');this.badge=document.querySelector('.phase-badge');this.busy=false;this.bootPromise=null;}
  setProgress(v,msg){if(this.fill)this.fill.style.width=`${Math.max(5,Math.min(100,Math.round(v*100)))}%`;if(msg&&this.text)this.text.textContent=msg;}
  async boot(){
    if(this.bootPromise)return this.bootPromise;
    this.bootPromise=this.runBoot();
    return this.bootPromise;
  }
  async runBoot(){
    if(!this.overlay){Game.state='MENU';return;}
    this.overlay.classList.remove('hidden');
    this.badge.textContent='INICIALIZAÇÃO';
    this.text.textContent='CARREGANDO ASSETS';
    this.setProgress(.05);
    try{
      if(Game.assets) await Game.assets.preloadShared(p=>this.setProgress(.08+p*.8,'CARREGANDO VISUAIS'));
      // Reaplica o contexto após o preload; evita canvas zerado/transform antigo em alguns navegadores.
      if(Game.renderer){
        Game.renderer.setMode(Game.settings?.data?.gpu||'AUTO');
        Game.renderer.applyQuality(Game.settings?.effectiveGraphics||'MEDIUM');
        Game.renderer.configureContext();
        Game.ctx=Game.renderer.ctx;
      }
      Game.state='MENU';
      this.setProgress(1,'PRONTO');
    }catch(err){
      console.error('[Breakout] Falha no boot:',err);
      Game.state='MENU';
    }
    await this.finish();
    Game.canvas?.focus();
  }
  async load(level, callback){
    if(this.busy)return false;
    this.busy=true;Game.state='LOADING';this.overlay.classList.remove('hidden');const world=Game.worlds?.get(level);this.badge.textContent=`FASE ${String(level).padStart(2,'0')} • ${world?.name||'ARCADE'}`;this.text.textContent=Game.worlds?.isBoss(level)?'CARREGANDO BOSS':(Game.worlds?.isMiniBoss(level)?'CARREGANDO MINI-BOSS':`PREPARANDO ${world?.name||'FASE'}`);this.setProgress(.04);
    let ok=false;
    try{
      if(Game.assets)await Game.assets.loadLevel(level,p=>this.setProgress(.08+p*.82,`CARREGANDO ASSETS DA FASE ${level}`));
      this.setProgress(.94,'MONTANDO FASE');await Promise.resolve(callback());this.setProgress(1,'PRONTO');ok=true;
    }catch(err){console.error('[Breakout] Erro ao carregar fase:',err);Game.state='MENU';this.text.textContent='ERRO AO CARREGAR';}
    finally{await this.finish();this.busy=false;if(ok&&Game.state==='LOADING')Game.state='PLAYING';}
    return ok;
  }
  finish(){
    if(!this.overlay)return Promise.resolve();
    if(this.fill)this.fill.style.width='100%';
    return new Promise(resolve=>setTimeout(()=>{this.overlay.classList.add('hidden');if(this.fill)this.fill.style.width='0%';resolve();},180));
  }
}
