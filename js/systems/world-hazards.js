// v0.4.4 - Obstáculos e desafios específicos por mundo
class WorldHazardSystem {
  constructor(){this.level=1;this.world=1;this.time=0;this.bumpers=[];this.walls=[];this.portals=[];this.lava={active:false,y:0,dir:1};this.gravity={active:false,x:400,y:280,strength:0.018};this.portalCooldown=0;}
  start(level){
    this.level=level; this.world=(Game.worlds?.worldIndex(level)||0)+1; this.time=0; this.bumpers=[];this.walls=[];this.portals=[];this.portalCooldown=0;
    this.lava={active:false,y:420,dir:-1};this.gravity={active:false,x:400,y:270,strength:0.018};
    // Bosses já possuem sistema próprio: desafios ambientais mais leves.
    const special=level%5===0;
    if(this.world===1){
      this.bumpers=[{x:170,y:330,w:86,h:14,baseX:170,range:90,speed:.9,phase:0},{x:544,y:385,w:86,h:14,baseX:544,range:90,speed:.75,phase:2.2}];
      if(special)this.bumpers=this.bumpers.slice(0,1);
    } else if(this.world===2){
      this.lava.active=!special; this.lava.y=455;
      this.walls=[{x:370,y:305,w:60,h:14,indestructible:true}];
    } else if(this.world===3){
      this.walls=[{x:205,y:300,w:95,h:16,indestructible:true},{x:500,y:350,w:95,h:16,indestructible:true}];
    } else if(this.world===4){
      this.portals=[{x:120,y:300,r:24,color:'#8f5cff',pair:1},{x:655,y:390,r:24,color:'#00d2ff',pair:0}];
      if(!special)this.bumpers=[{x:345,y:350,w:110,h:12,baseX:345,range:130,speed:1.15,phase:1}];
    } else if(this.world===5){
      this.gravity.active=!special;this.gravity.x=400;this.gravity.y=300;this.gravity.strength=.022;
      this.walls=[{x:105,y:330,w:85,h:14,indestructible:true},{x:610,y:330,w:85,h:14,indestructible:true}];
    }
  }
  update(dt){
    if(Game.state!=='PLAYING')return;this.time+=dt;this.portalCooldown=Math.max(0,this.portalCooldown-dt);
    for(const b of this.bumpers)b.x=b.baseX+Math.sin(this.time*b.speed+b.phase)*b.range;
    if(this.lava.active){this.lava.y+=this.lava.dir*18*dt;if(this.lava.y<390){this.lava.y=390;this.lava.dir=1;}if(this.lava.y>470){this.lava.y=470;this.lava.dir=-1;}}
    this.affectBall(Game.ball);
    if(Game.extraBalls)for(const b of Game.extraBalls)this.affectBall(b);
  }
  affectBall(ball){if(!ball||!ball.active)return;
    // colisão com obstáculos sólidos
    for(const o of [...this.walls,...this.bumpers]){
      const r=ball.radius||8, cx=Math.max(o.x,Math.min(ball.x,o.x+o.w)),cy=Math.max(o.y,Math.min(ball.y,o.y+o.h));
      const dx=ball.x-cx,dy=ball.y-cy;if(dx*dx+dy*dy<=r*r){if(Math.abs(dx)>Math.abs(dy))ball.speedX*=-1;else ball.speedY*=-1;ball.x+=Math.sign(dx||1)*2;ball.y+=Math.sign(dy||1)*2;if(Game.audio)Game.audio.play('wallBounce');}
    }
    // portais
    if(this.portals.length===2 && this.portalCooldown<=0){for(let i=0;i<2;i++){const p=this.portals[i],dx=ball.x-p.x,dy=ball.y-p.y;if(dx*dx+dy*dy<(p.r+ball.radius)**2){const t=this.portals[p.pair];ball.x=t.x+(ball.speedX>=0?30:-30);ball.y=t.y;this.portalCooldown=.55;if(Game.audio)Game.audio.play('portal');if(Game.particles){Game.particles.emit(p.x,p.y,18,p.color);Game.particles.emit(t.x,t.y,18,t.color);}break;}}}
    // poço gravitacional
    if(this.gravity.active){const dx=this.gravity.x-ball.x,dy=this.gravity.y-ball.y,d=Math.max(75,Math.hypot(dx,dy));const f=this.gravity.strength*(160/d);ball.speedX+=dx/d*f;ball.speedY+=dy/d*f;}
    // calor da fornalha: tocar a faixa inferior acelera a bola, sem perda de vida injusta
    if(this.lava.active && ball.y>this.lava.y){ball.speedY=-Math.abs(ball.speedY)*1.04;ball.y=this.lava.y-ball.radius;if(Game.particles)Game.particles.emit(ball.x,this.lava.y,8,'#ff6b35');}
  }
  draw(){const ctx=Game.ctx,q=Game.settings?.effectiveGraphics||'MEDIUM';ctx.save();
    for(const o of this.walls){const im=Game.assets?.image('hazardBarrier');if(im)Game.assets.drawContain(ctx,im,o.x+o.w/2,o.y+o.h/2,o.w+14,56,.98);else{ctx.fillStyle='#27313d';ctx.fillRect(o.x,o.y,o.w,o.h);ctx.strokeStyle='#9aa8b6';ctx.strokeRect(o.x,o.y,o.w,o.h);}}
    for(const b of this.bumpers){ctx.fillStyle='rgba(0,210,255,.18)';ctx.fillRect(b.x,b.y,b.w,b.h);ctx.strokeStyle='#00d2ff';ctx.strokeRect(b.x,b.y,b.w,b.h);}
    for(let i=0;i<this.portals.length;i++){const p=this.portals[i],im=Game.assets?.image(i===0?'hazardPortalPurple':'hazardPortalBlue');if(im){const z=p.r*3.2;Game.assets.drawContain(ctx,im,p.x,p.y,z,z,.98);}else{ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.strokeStyle=p.color;ctx.lineWidth=q==='HIGH'?6:3;ctx.stroke();}}
    if(this.lava.active){const g=ctx.createLinearGradient(0,this.lava.y,0,Game.height);g.addColorStop(0,'rgba(255,110,30,.72)');g.addColorStop(1,'rgba(120,10,0,.25)');ctx.fillStyle=g;ctx.fillRect(0,this.lava.y,Game.width,Game.height-this.lava.y);ctx.strokeStyle='#ffbd4a';ctx.beginPath();for(let x=0;x<=Game.width;x+=18){const y=this.lava.y+Math.sin(this.time*5+x*.05)*4; x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.stroke();}
    if(this.gravity.active){const im=Game.assets?.image('hazardGravity');if(im){const z=86+Math.sin(this.time*3)*6;Game.assets.drawContain(ctx,im,this.gravity.x,this.gravity.y,z,z,.98);}else{const r=26+Math.sin(this.time*3)*4;ctx.strokeStyle='#ffd166';ctx.lineWidth=3;ctx.beginPath();ctx.arc(this.gravity.x,this.gravity.y,r,0,Math.PI*2);ctx.stroke();}}
    ctx.restore();
  }
  label(){return ({1:'PLATAFORMAS MÓVEIS',2:'MARÉ DE MAGMA',3:'BARREIRAS CRISTALINAS',4:'PORTAIS INSTÁVEIS',5:'POÇO GRAVITACIONAL'})[this.world]||'';}
}
