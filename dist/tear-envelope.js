import { createLetterTyping } from './letter-typing.js?v=notebook-v1';
// A repeatable paper tear. Pointer and keyboard share the same finite sequence.
export function createTearEnvelope({dialog,reduced}){
 const $=s=>dialog.querySelector(s),assembly=$('.envelope-assembly'),button=$('#open-letter'),paper=$('#letter-paper'),body=$('.letter-body'),status=$('#letter-status'),back=$('#return-letter'),close=$('[data-close]');
 const typing=createLetterTyping({body,reduced});
 let run=0,timers=[],raf=0,progress=0,drag=null,suppressClick=false;
 let seed=11;const edge=[];for(let i=0;i<=120;i++){seed=seed*16807%2147483647;edge.push(`${i/1.2}% ${43+Math.sin(i*Math.PI/2)*1.4+(seed/2147483647-.5)*1.7}px`)}
 assembly.style.setProperty('--strip-shape',`polygon(0 0,100% 0,${[...edge].reverse().join(',')})`);
 assembly.style.setProperty('--front-shape',`polygon(0 100%,100% 100%,${[...edge].reverse().join(',')})`);
 function setProgress(n){progress=Math.max(0,Math.min(1,n));assembly.style.setProperty('--tear-x',`${(1-progress)*100}%`);assembly.style.setProperty('--tear-width',`${progress*100}%`);assembly.style.setProperty('--peel-opacity',progress>.005?1:0)}
 function clear(){typing.stop();run++;timers.forEach(clearTimeout);timers=[];cancelAnimationFrame(raf);drag=null}
 function later(ms,fn){const token=run;timers.push(setTimeout(()=>{if(token===run&&dialog.open)fn()},ms))}
 function tween(to,ms,done){cancelAnimationFrame(raf);const from=progress,start=performance.now(),token=run;function frame(now){if(token!==run)return;const t=reduced?1:Math.min(1,(now-start)/ms);setProgress(from+(to-from)*(1-(1-t)**3));if(t<1)raf=requestAnimationFrame(frame);else done?.()}raf=requestAnimationFrame(frame)}
 function reset(){clear();typing.reset();assembly.append(close);suppressClick=false;dialog.dataset.letterState='sealed';setProgress(0);button.disabled=false;button.inert=false;button.setAttribute('aria-expanded','false');paper.inert=true;paper.setAttribute('aria-hidden','true');back.hidden=true;body.scrollTop=0;status.textContent='从右向左，撕开这封信';}
 function reveal(){dialog.dataset.letterState='reading';paper.append(close);paper.inert=false;paper.removeAttribute('aria-hidden');back.hidden=false;status.textContent='';button.setAttribute('aria-expanded','true');paper.focus({preventScroll:true});body.scrollTo({top:0,behavior:'instant'});typing.start()}
 function finish(){if(!['sealed','tearing'].includes(dialog.dataset.letterState))return;dialog.dataset.letterState='tearing';button.disabled=true;tween(1,450,()=>{button.inert=true;dialog.dataset.letterState='torn';status.textContent='把藏在里面的话，慢慢展开';if(reduced){reveal();return}later(420,()=>dialog.dataset.letterState='extracting');later(1180,()=>dialog.dataset.letterState='unfolding');later(2000,reveal)})}
 button.addEventListener('pointerdown',e=>{if(dialog.dataset.letterState!=='sealed'||e.button!==0)return;suppressClick=false;drag={id:e.pointerId,x:e.clientX,width:assembly.clientWidth,moved:false};button.setPointerCapture(e.pointerId)});
 button.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const delta=drag.x-e.clientX;if(Math.abs(delta)>5)drag.moved=true;if(drag.moved){dialog.dataset.letterState='tearing';setProgress(delta/drag.width);status.textContent=progress>=1/3?'松开，让信纸来到你面前':'再向左撕开一点点'}});
 function release(e,cancel=false){if(!drag||drag.id!==e.pointerId)return;const moved=drag.moved;drag=null;if(button.hasPointerCapture(e.pointerId))button.releasePointerCapture(e.pointerId);suppressClick=moved;if(!moved)return;if(!cancel&&progress>=1/3)finish();else tween(0,320,()=>{dialog.dataset.letterState='sealed';status.textContent='从右向左，撕开这封信'})}
 button.addEventListener('pointerup',e=>release(e));button.addEventListener('pointercancel',e=>release(e,true));button.addEventListener('lostpointercapture',e=>{if(drag)release(e,true)});
 button.onclick=()=>{if(suppressClick){suppressClick=false;return}finish()};
 back.onclick=()=>{if(dialog.dataset.letterState!=='reading')return;clear();paper.inert=true;paper.setAttribute('aria-hidden','true');back.hidden=true;status.textContent='把这封信，好好收起来';if(reduced){reset();button.focus();return}dialog.dataset.letterState='folding';later(700,()=>dialog.dataset.letterState='inserting');later(1400,()=>dialog.dataset.letterState='closing');later(2050,()=>{reset();button.focus({preventScroll:true})})};
 window.addEventListener('pagehide',clear);reset();return{reset};
}
