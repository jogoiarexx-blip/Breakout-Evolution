// v0.4.4 - Armas temporárias do paddle
class WeaponSystem {
  constructor(){this.lasers=[];this.enabled=false;this.endAt=0;this.cooldown=0;this.keyHandler=e=>{if((e.code==='Space'||e.key===' ')&&Game.state==='PLAYING'&&Game.ball?.active&&this.enabled){this.fire();e.preventDefault();}};window.addEventListener('keydown',this.keyHandler);}
  activate(ms=12000){this.enabled=true;this.endAt=performance.now()+ms;if(Game.hud)Game.hud.addNotification('⚡ LASER ATIVO — ESPAÇO PARA DISPARAR','#ff4fd8',2);}
  fire(){if(!this.enabled||this.cooldown>0||!Game.paddle)return;this.cooldown=.22;const y=Game.paddle.y-8;this.lasers.push({x:Game.paddle.x+12,y,w:4,h:14},{x:Game.paddle.x+Game.paddle.width-16,y,w:4,h:14});if(Game.audio)Game.audio.play('laser');}
  update(dt){this.cooldown=Math.max(0,this.cooldown-dt);if(this.enabled&&performance.now()>this.endAt)this.enabled=false;
    for(let i=this.lasers.length-1;i>=0;i--){const l=this.lasers[i];l.y-=520*dt;let hit=false;for(const b of Game.brickManager?.bricks||[]){if(b.destroyed)continue;if(l.x+l.w>b.x&&l.x<b.x+b.width&&l.y<b.y+b.height&&l.y+l.h>b.y){b.hit();hit=true;break;}}if(hit||l.y<-20)this.lasers.splice(i,1);}
  }
  draw(){const ctx=Game.ctx;ctx.save();const fx=Game.assets?.image('vfxLaser');for(const l of this.lasers){if(fx){ctx.save();ctx.translate(l.x+l.w/2,l.y+l.h/2);ctx.rotate(-Math.PI/2);Game.assets.drawContain(ctx,fx,0,0,34,22,.98);ctx.restore();}else{ctx.fillStyle='#ff4fd8';if(Game.settings?.effectiveGraphics!=='LOW'){ctx.shadowBlur=12;ctx.shadowColor='#ff4fd8';}ctx.fillRect(l.x,l.y,l.w,l.h);}}ctx.restore();}
  clear(){this.lasers=[];this.enabled=false;this.cooldown=0;}
}
