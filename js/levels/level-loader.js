class LevelLoader {
  constructor(){this.overlay=document.getElementById('loading');this.fill=document.querySelector('.loader-fill');this.text=document.querySelector('.loading-text');this.badge=document.querySelector('.phase-badge');this.busy=false;}
  setProgress(v,msg){this.fill.style.width=`${Math.max(5,Math.min(100,Math.round(v*100)))}%`;if(msg)this.text.textContent=msg;}
  async boot(){this.overlay.classList.remove('hidden');this.badge.textContent='INICIALIZAÇÃO';this.text.textContent='CARREGANDO ASSETS';this.setProgress(.05);if(Game.assets)await Game.assets.preloadShared(p=>this.setProgress(.08+p*.8,'CARREGANDO VISUAIS'));await this.finish();}
  async load(level, callback){if(this.busy)return;this.busy=true;Game.state='LOADING';this.overlay.classList.remove('hidden');const world=Game.worlds?.get(level);this.badge.textContent=`FASE ${String(level).padStart(2,'0')} • ${world?.name||'ARCADE'}`;this.text.textContent=Game.worlds?.isBoss(level)?'CARREGANDO BOSS':(Game.worlds?.isMiniBoss(level)?'CARREGANDO MINI-BOSS':`PREPARANDO ${world?.name||'FASE'}`);this.setProgress(.04);
    try{if(Game.assets)await Game.assets.loadLevel(level,p=>this.setProgress(.08+p*.82,`CARREGANDO ASSETS DA FASE ${level}`));this.setProgress(.94,'MONTANDO FASE');await Promise.resolve(callback());this.setProgress(1,'PRONTO');}
    finally{await this.finish();this.busy=false;if(Game.state==='LOADING')Game.state='PLAYING';}
  }
  finish(){this.fill.style.width='100%';return new Promise(resolve=>setTimeout(()=>{this.overlay.classList.add('hidden');this.fill.style.width='0%';resolve();},180));}
}
