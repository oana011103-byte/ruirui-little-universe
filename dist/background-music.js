export function createBackgroundMusic({audio,button,isVideoOpen}){
 let wanted=true,leaving=false;
 try{wanted=sessionStorage.getItem('ruirui-music-enabled')!=='false'}catch{}
 audio.volume=.45;
 function update(){
  const playing=!audio.paused;
  button.setAttribute('aria-pressed',String(playing));
  button.setAttribute('aria-label',playing?'暂停背景音乐':'播放背景音乐');
  button.classList.toggle('is-playing',playing);
 }
 function refresh(){
  if(!wanted||leaving||document.hidden||isVideoOpen()){audio.pause();update();return}
  if(audio.paused)audio.play().then(()=>{
   if(!wanted||leaving||document.hidden||isVideoOpen())audio.pause();
   update();
  }).catch(update);
 }
 button.addEventListener('click',()=>{
  wanted=audio.paused||!wanted;
  try{sessionStorage.setItem('ruirui-music-enabled',String(wanted))}catch{}
  refresh();
 });
 for(const event of ['play','pause','ended'])audio.addEventListener(event,update);
 audio.addEventListener('error',()=>{button.disabled=true;button.setAttribute('aria-label','背景音乐暂时无法播放')});
 // The first real interaction unlocks audio when the browser blocks autoplay.
 function onGesture(event){if(!button.contains(event.target))refresh()}
 document.addEventListener('pointerdown',onGesture,{capture:true,passive:true});
 document.addEventListener('keydown',onGesture,{capture:true});
 document.addEventListener('visibilitychange',refresh);
 window.addEventListener('pagehide',()=>{leaving=true;audio.pause()});
 window.addEventListener('pageshow',()=>{leaving=false;refresh()});
 update();refresh();
 return {refresh};
}
