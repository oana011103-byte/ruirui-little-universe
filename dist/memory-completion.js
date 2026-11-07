// Grid cells trace the hollow, stepped heart; each cell is a small dot cluster.
export const pixelHeartCells=(()=>{
 const left=[[15,9],[14,8],[13,7],[12,6],[11,5],[10,5],[9,5],[8,5],[7,5],[6,6],[5,6],[4,7],[4,8],[3,9],[3,10],[2,11],[2,12],[2,13],[2,14],[2,15],[3,16],[3,17],[4,18],[5,19],[6,20],[7,21],[8,22],[9,23],[10,24],[11,24],[12,25],[13,26],[14,27],[15,28]];
 return [...left,...left.slice(1,-1).reverse().map(([x,y])=>[30-x,y])].map(([x,y])=>({x:(x+1)*10,y:(y-2)*10}));
})();
// A halftone field fills the same outline, with a finer dotted edge outside it.
export const filledHeartDots=(()=>{
 const inside=(x,y)=>{let yes=false;for(let i=0,j=pixelHeartCells.length-1;i<pixelHeartCells.length;j=i++){
  const a=pixelHeartCells[i],b=pixelHeartCells[j];if((a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)yes=!yes;
 }return yes};
 const distance=(x,y)=>Math.min(...pixelHeartCells.map((a,i)=>{const b=pixelHeartCells[(i+1)%pixelHeartCells.length],dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy)));return Math.hypot(x-a.x-t*dx,y-a.y-t*dy)}));
 const dots=[];for(let y=16;y<=276;y+=8)for(let x=16;x<=304;x+=8){const edge=distance(x,y),solid=inside(x,y);if(!solid&&edge>16)continue;const strength=solid?1:Math.max(0,1-edge/16);if(strength<.1)continue;dots.push({x,y,r:solid?3.85:3.3*strength,seed:((x*73+y*41)%997)/997})}return dots;
})();
// Move each particle beyond the screen boundary, independent of heart size.
export function scatterVector(p,viewport,box){
 const angle=Math.atan2(p.y-145,p.x-160)+(p.seed-.5)*1.4,ux=Math.cos(angle),uy=Math.sin(angle);
 const sx=box.left+p.x/320*box.width,sy=box.top+p.y/290*box.height;
 const tx=Math.abs(ux)<.0001?Infinity:((ux>0?viewport.width:0)-sx)/ux;
 const ty=Math.abs(uy)<.0001?Infinity:((uy>0?viewport.height:0)-sy)/uy;
 const radius=p.r*box.width/320;
 const exitMargin=(radius+2)/Math.max(.0001,tx<ty?Math.abs(ux):Math.abs(uy));
 const travel=Math.max(0,Math.min(tx,ty))+exitMargin;
 return{x:ux*travel*320/box.width,y:uy*travel*290/box.height,duration:Math.max(100,Math.min(1800,travel/(550+p.seed*200)*1000))};
}
// One earned celebration per visit; the birthday return restores its finished state.
export function createMemoryCompletion({dialog,reduced,onComplete}){
 let started=false,finished=false,timers=[];
 const later=(delay,callback)=>timers.push(setTimeout(callback,delay));
 function finish(){
  if(finished||!started)return;
  finished=true;timers.forEach(clearTimeout);timers=[];
  dialog.classList.remove('is-playing');
  if(dialog.open)dialog.close();
  dialog.querySelector('#heart-rain').replaceChildren();
  onComplete();
 }
 function start(){
  if(started)return;started=true;
  dialog.showModal();
  const heartBox=dialog.querySelector('.completion-heart').getBoundingClientRect();
  const viewport={width:document.documentElement.clientWidth,height:window.innerHeight};
  const dots=dialog.querySelector('#pixel-heart-dots');dots.replaceChildren();
  pixelHeartCells.forEach((p,i)=>{
   const cluster=document.createElementNS('http://www.w3.org/2000/svg','g');
   cluster.classList.add('pixel-heart-cell');cluster.style.setProperty('--dot-delay',`${1100+i*1450/pixelHeartCells.length}ms`);
   const offsets=i%5===1?[[-2,-2],[2,-2],[-2,2]]:i%5===3?[[-2,-2],[2,2]]:[[-2,-2],[2,-2],[-2,2],[2,2]];
   for(const [dx,dy] of offsets){const dot=document.createElementNS('http://www.w3.org/2000/svg','circle');dot.setAttribute('cx',p.x+dx);dot.setAttribute('cy',p.y+dy);dot.setAttribute('r','1.15');cluster.append(dot)}
   dots.append(cluster);
  });
  const fill=dialog.querySelector('#pixel-heart-fill');fill.replaceChildren();
  let scatterEnd=4200;
  filledHeartDots.forEach(p=>{
   const dot=document.createElementNS('http://www.w3.org/2000/svg','circle');dot.classList.add('pixel-fill-dot');
   dot.setAttribute('cx',p.x);dot.setAttribute('cy',p.y);dot.setAttribute('r',p.r);
   const scatter=scatterVector(p,viewport,heartBox);
   scatterEnd=Math.max(scatterEnd,4200+p.seed*80+scatter.duration);
   dot.style.cssText=`--fill-delay:${1850+(276-p.y)/260*1100+p.seed*120}ms;--scatter-delay:${4200+p.seed*80}ms;--scatter-duration:${scatter.duration}ms;--flight-radius:${(1.1+p.seed*.6)*320/heartBox.width}px;--scatter-x:${scatter.x}px;--scatter-y:${scatter.y}px`;
   fill.append(dot);
  });
  const stars=dialog.querySelector('#completion-stars');stars.replaceChildren();
  const origins=[...document.querySelectorAll('#orbit-stars .orbit-star')].map(e=>e.getBoundingClientRect());
  for(let i=0;i<11;i++){
   const p=pixelHeartCells[Math.floor(i*pixelHeartCells.length/11)],star=document.createElement('span');
   star.className='completion-star';
   const origin=origins[i];
   const dx=origin?origin.left+origin.width/2-heartBox.left-p.x/320*heartBox.width:0;
   const dy=origin?origin.top+origin.height/2-heartBox.top-p.y/290*heartBox.height:180;
   star.style.cssText=`left:${p.x/320*100}%;top:${p.y/290*100}%;--gather-delay:${i*28}ms;--light-delay:${1200+i*1300/11}ms;--gather-x:${dx}px;--gather-y:${dy}px;--star-tilt:${[-8,5,-3][i%3]}deg`;
   stars.append(star);
  }
  dialog.querySelector('#heart-rain').replaceChildren();
  dialog.dataset.phase=reduced?'still':'gathering';
  dialog.classList.add('is-playing');
  if(!reduced){later(1200,()=>dialog.dataset.phase='connecting');later(1850,()=>dialog.dataset.phase='filling');later(3300,()=>dialog.dataset.phase='full');later(4200,()=>dialog.dataset.phase='scattering');later(4500,()=>dialog.dataset.phase='spread')}

  dialog.querySelector('#skip-completion').focus({preventScroll:true});
  later(reduced?1200:scatterEnd+140,finish);
 }
 dialog.querySelector('#skip-completion').onclick=finish;
 dialog.addEventListener('cancel',event=>{event.preventDefault();finish()});
 dialog.addEventListener('close',finish);
 // Do not resume an orphaned celebration after navigation or BFCache restoration.
 window.addEventListener('pagehide',()=>{if(started&&!finished)finish()});
 return {start};
}
