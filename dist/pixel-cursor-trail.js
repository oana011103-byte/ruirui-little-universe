// A small, bounded mouse trail. It never intercepts clicks, drags or scrolling.
export function attachPixelCursorTrail(){
 if(document.querySelector('#pixel-cursor-trail'))return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(any-hover: hover) and (any-pointer: fine)');
 const canvas=document.createElement('canvas');canvas.id='pixel-cursor-trail';canvas.setAttribute('aria-hidden','true');
 Object.assign(canvas.style,{position:'fixed',inset:'0',width:'100vw',height:'100dvh',pointerEvents:'none',zIndex:'2147483646',background:'transparent',border:'0',margin:'0',padding:'0'});
 document.body.append(canvas);const ctx=canvas.getContext('2d');if(!ctx){canvas.remove();return}
 let particles=[],frame=0,last=null,lastEmit=0,serial=0,width=innerWidth,height=innerHeight;
 const star=['0001000','0001000','0011100','1111111','0011100','0001000','0001000'];
 const sparkle=['00100','00100','11111','00100','00100'];
 function clear(){particles=[];last=null;cancelAnimationFrame(frame);frame=0;ctx.clearRect(0,0,width,height)}
 function resize(){const dpr=Math.min(devicePixelRatio||1,2),w=innerWidth,h=innerHeight;if(canvas.width===Math.round(w*dpr)&&canvas.height===Math.round(h*dpr))return;clear();width=w;height=h;canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.imageSmoothingEnabled=false}
 function draw(now){
  frame=0;ctx.clearRect(0,0,width,height);particles=particles.filter(p=>now-p.born<p.life);
  for(const p of particles){const t=(now-p.born)/p.life,x=Math.round(p.x+p.vx*t),y=Math.round(p.y+p.vy*t+t*t*9),pattern=p.glint?sparkle:star,center=(pattern.length-1)/2;
   ctx.globalAlpha=(1-t)**1.4;ctx.fillStyle=p.color;
   for(let row=0;row<pattern.length;row++)for(let col=0;col<pattern[row].length;col++)if(pattern[row][col]==='1')ctx.fillRect(x+(col-center)*p.pixel,y+(row-center)*p.pixel,p.pixel,p.pixel);
  }
  ctx.globalAlpha=1;if(particles.length)frame=requestAnimationFrame(draw);
 }
 function emit(x,y,now){const n=serial++;particles.push({x:x+(n%3-1)*3,y:y+(n%5-2)*2,born:now,life:1000+n%5*50,vx:(n%7-3)*2,vy:10+n%4*4,pixel:1,glint:n%3===1,color:['#fff4d8','#f5d58b','#fffdf5'][n%3]});if(particles.length>42)particles.splice(0,particles.length-42)}
 function move(event){
  if(event.pointerType!=='mouse'||!fine.matches||reduced.matches||document.hidden)return;
  const now=performance.now(),target=document.querySelector('dialog[open]')||document.body;
  if(canvas.parentElement!==target){target.append(canvas);clear()}
  const rect=canvas.getBoundingClientRect(),point={x:event.clientX-rect.left,y:event.clientY-rect.top};
  if(!last){last=point;emit(point.x,point.y,now)}else{
   const distance=Math.hypot(point.x-last.x,point.y-last.y);if(distance<8||now-lastEmit<24)return;
   const count=Math.min(3,Math.max(1,Math.floor(distance/16)));
   for(let i=1;i<=count;i++)emit(last.x+(point.x-last.x)*i/count,last.y+(point.y-last.y)*i/count,now);
   last=point;
  }
  lastEmit=now;if(!frame)frame=requestAnimationFrame(draw);
 }
 document.addEventListener('pointermove',move,{passive:true,capture:true});
 document.addEventListener('pointerout',e=>{if(!e.relatedTarget)last=null},{passive:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)clear()});
 window.addEventListener('blur',clear);window.addEventListener('pagehide',clear);window.addEventListener('resize',resize);window.addEventListener('pageshow',resize);
 reduced.addEventListener('change',clear);fine.addEventListener('change',clear);resize();
}
