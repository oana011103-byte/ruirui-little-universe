// Pastel tumbling paper from the user's Planet Susu and personal homepage.
// Same palette and rectangular pieces; time-based movement and viewport lifecycle.
export function createBirthdayConfetti(canvas,reduced=false){
 const ctx=canvas.getContext('2d'),colors=['#FFDDE4','#F2A6B3','#FFB3C6','#FFC8A2','#B5EAD7','#C7CEEA','#FFDAC1','#FFE4E1'];
 let width=0,height=0,pieces=[],frame=0,last=0,started=0;
 function resize(){const w=window.innerWidth,h=window.innerHeight;if(width&&height)for(const p of pieces){p.x*=w/width;p.y*=h/height}width=w;height=h;const dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)}
 function clear(){cancelAnimationFrame(frame);frame=0;pieces=[];ctx.clearRect(0,0,width,height)}
 function draw(now){
  const dt=Math.min((now-last)/1000,.05),age=now-started;last=now;ctx.clearRect(0,0,width,height);
  for(const p of pieces){
   if(!reduced){p.y+=p.vy*dt;p.x+=(p.vx+Math.sin(now/550+p.phase)*16)*dt;p.rotation+=p.rotationSpeed*dt;}
   ctx.globalAlpha=reduced?Math.max(0,1-Math.max(0,age-1600)/600):Math.min(1,Math.max(0,(8000-age)/900));
   ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rotation);ctx.fillStyle=p.color;ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h*(reduced?1:.5+.5*Math.abs(Math.cos(now/420+p.phase))));ctx.restore();
  }
  ctx.globalAlpha=1;pieces=pieces.filter(p=>p.y<height+30);
  if(pieces.length&&age<(reduced?2200:8000))frame=requestAnimationFrame(draw);else clear();
 }
 function launch(){
  clear();resize();
  pieces=Array.from({length:width<600?140:190},()=>({x:Math.random()*width,y:reduced?Math.random()*height:-Math.random()*height*.65,w:5+Math.random()*9,h:4+Math.random()*6,color:colors[Math.floor(Math.random()*colors.length)],vy:height/3.7+Math.random()*height/2.8,vx:Math.random()*60-30,rotation:Math.random()*Math.PI*2,rotationSpeed:Math.random()*6-3,phase:Math.random()*Math.PI*2}));
  started=last=performance.now();frame=requestAnimationFrame(draw);
 }
 window.addEventListener('resize',resize);resize();return{launch,clear};
}
