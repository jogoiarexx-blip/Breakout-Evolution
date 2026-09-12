const canvas=document.getElementById('gameCanvas');
const renderer=new RenderManager(canvas,CONFIG.SCREEN.WIDTH,CONFIG.SCREEN.HEIGHT);
window.Game={ctx:renderer.ctx,renderer,canvas,width:CONFIG.SCREEN.WIDTH,height:CONFIG.SCREEN.HEIGHT,state:'MENU',initialized:false,data:{score:0,coins:0,level:1,lives:3,maxLives:3,highScore:0,selectedSkin:'default'},economy:null,particles:null,brickManager:null,paddle:null,ball:null,ui:null,hud:null,skinManager:null,settings:null,assets:null,levelLoader:null,worlds:null,progression:null,meta:null,runModifiers:null,bossSystem:null,hazards:null,weapons:null,challenges:null,pendingReward:null};
Game.settings=new SettingsManager();Game.assets=new AssetManager();Game.levelLoader=new LevelLoader();Game.worlds=new WorldManager();Game.progression=new ProgressionManager();Game.meta=new MetaProgressionSystem();Game.runModifiers=new RunModifierSystem();
canvas.addEventListener('contextmenu',e=>e.preventDefault());canvas.tabIndex=1;canvas.focus();document.addEventListener('gesturestart',e=>e.preventDefault());
console.log('[Breakout] Renderer:', Game.renderer.statusLabel(), Game.renderer.gpuLabel(120));
