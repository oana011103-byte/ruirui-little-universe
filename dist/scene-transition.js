export function createSceneTransition(reduced){
 const veil=document.createElement('dialog');veil.id='scene-transition';veil.setAttribute('aria-label','正在切换页面');document.body.append(veil);
 veil.addEventListener('cancel',event=>event.preventDefault());
 let busy=false;
 function reset(){if(veil.open)veil.close();veil.getAnimations().forEach(animation=>animation.cancel());busy=false}
 async function fade(from,to,duration){await veil.animate([{opacity:from},{opacity:to}],{duration,easing:'ease-in-out',fill:'forwards'}).finished}
 async function run(swap,{hold=false,focus}={}){
  if(busy)return;
  if(reduced){swap();focus?.focus({preventScroll:true});return}
  busy=true;let holding=false;
  try{
   veil.showModal();await fade(0,1,280);swap();
   if(hold){holding=true;return}
   // Put the dark veil above the destination's newly opened native dialog.
   veil.close();veil.showModal();await fade(1,0,420);
  }finally{if(!holding){reset();focus?.focus({preventScroll:true})}}
 }
 window.addEventListener('pageshow',reset);
 return {run};
}
