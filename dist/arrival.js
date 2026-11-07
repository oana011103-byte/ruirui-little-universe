// A finite, pausable opening. The existing universe loads underneath it.
export function playArrival({dialog,reduced,onFinish}){
 dialog.dispatchEvent(new Event('arrival-ready'));
 let finished=false,started=false,running=false,elapsed=0,startedAt=0,timer,loadTimer,index=0;
 const steps=reduced?[[2600,'reveal'],[3200,'done']]:[[900,'hover'],[1800,'chasing'],[3200,'first-catch'],[4500,'chasing-again'],[6100,'second-catch'],[7600,'departing'],[9000,'message'],[10000,'reading'],[12200,'reveal'],[12800,'handoff'],[13400,'done']];
 function finish(){
  if(finished)return;finished=true;clearTimeout(timer);clearTimeout(loadTimer);
  document.removeEventListener('visibilitychange',visibility);
  window.removeEventListener('pagehide',finish);
  dialog.classList.remove('is-arriving','arrival-paused');
  if(dialog.open)dialog.close();
  onFinish();
 }
 function schedule(){
  if(finished||!started||document.hidden)return;
  startedAt=performance.now();running=true;
  timer=setTimeout(()=>{
   running=false;elapsed=steps[index][0];const phase=steps[index++][1];
   if(phase==='done'){finish();return}
   dialog.dataset.phase=phase;schedule();
  },Math.max(0,steps[index][0]-elapsed));
 }
 function visibility(){
  if(finished)return;
  dialog.classList.toggle('arrival-paused',document.hidden);
  if(!started)return;
  if(document.hidden){if(running)elapsed+=performance.now()-startedAt;running=false;clearTimeout(timer)}else schedule();
 }
 function begin(fallback=false){
  if(finished||started)return;started=true;clearTimeout(loadTimer);
  if(fallback){steps.splice(0,steps.length,[3000,'reveal'],[3600,'done']);dialog.dataset.motion='text'}
  dialog.dataset.phase='launch';dialog.classList.add('is-arriving');dialog.classList.toggle('arrival-paused',document.hidden);schedule();
 }
 dialog.querySelector('#skip-arrival').onclick=finish;
 dialog.addEventListener('cancel',event=>{event.preventDefault();finish()});
 dialog.addEventListener('close',finish);
 window.addEventListener('pagehide',finish);
 document.addEventListener('visibilitychange',visibility);
 if(!dialog.open){finish();return}
 dialog.dataset.motion=reduced?'still':'full';
 if(reduced){begin();return}
 const pictures=[...dialog.querySelectorAll('img')];
 loadTimer=setTimeout(()=>begin(true),6000);
 const ready=image=>new Promise((resolve,reject)=>{
  const check=()=>image.naturalWidth?resolve():reject(new Error('Artwork unavailable'));
  if(image.complete){check();return}
  image.addEventListener('load',check,{once:true});
  image.addEventListener('error',reject,{once:true});
 });
 Promise.all(pictures.map(ready)).then(()=>begin(),()=>begin(true));
}
