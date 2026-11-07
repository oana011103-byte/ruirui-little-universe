// Keep the universe's document alive so navigation cannot expose a white canvas.
export function createBirthdayView({transition,onActive,onPending,onError,returnFocus}){
 const universeTitle=document.title;
 const destination=new URL('birthday/?v=smooth-route-v1',location.href);
 const embedded=new URL(destination);embedded.searchParams.set('embedded','1');
 const portal=document.createElement('section');portal.className='birthday-portal';portal.setAttribute('aria-label','生日快乐');portal.setAttribute('aria-hidden','true');portal.inert=true;document.body.append(portal);
 let frame,ready,resolveReady,rejectReady,timer,entering=false,active=false;
 function prepare(){
  if(ready)return ready;
  frame=document.createElement('iframe');frame.title='瑞瑞的生日蛋糕';frame.allow='autoplay; microphone';frame.src=embedded.href;
  ready=new Promise((resolve,reject)=>{resolveReady=resolve;rejectReady=reject;timer=setTimeout(()=>reject(new Error('Birthday preparation timed out')),15000)});
  ready.catch(()=>{clearTimeout(timer);frame?.remove();frame=null;ready=null});
  frame.addEventListener('error',()=>rejectReady(new Error('Birthday page failed to load')),{once:true});
  portal.append(frame);return ready;
 }
 function show(open){
  document.title=open?'瑞瑞，生日快乐 · 我们的小宇宙':universeTitle;
  active=open;portal.classList.toggle('is-open',open);portal.inert=!open;portal.setAttribute('aria-hidden',String(!open));
  frame?.contentWindow.postMessage({type:'ruirui:birthday-reset'},location.origin);onActive(open);
 }
 async function enter(push=true){
  if(active||entering)return;
  entering=true;onPending(true);
  try{await prepare();await transition.run(()=>{if(push)history.pushState({...history.state,ruiruiView:'birthday'},'',destination);show(true)},{focus:frame})}
  catch{onError()}
  finally{entering=false;onPending(false)}
 }
 window.addEventListener('message',event=>{
  if(event.origin!==location.origin||event.source!==frame?.contentWindow)return;
  if(event.data?.type==='ruirui:birthday-ready'){clearTimeout(timer);resolveReady?.()}
  if(event.data?.type==='ruirui:birthday-back'&&active)history.back();
 });
 window.addEventListener('popstate',()=>{
  if(history.state?.ruiruiView==='birthday'){enter(false);return}
  if(active)transition.run(()=>show(false),{focus:returnFocus});
 });
 return {prepare,enter};
}
