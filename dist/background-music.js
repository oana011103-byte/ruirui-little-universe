export function createBackgroundMusic({audio,button,isVideoOpen}){
 let wanted=true,leaving=false,started=false,needsGesture=false,priming=false,playPromise=null,finishPrime=null,primeGeneration=0;
 try{wanted=sessionStorage.getItem('ruirui-music-enabled')!=='false'}catch{}
 audio.volume=.45;
 audio.preload='auto';
 const blocked=()=>!wanted||leaving||document.hidden||isVideoOpen();
 function bufferedAhead(){
  for(let i=0;i<audio.buffered.length;i++)if(audio.buffered.start(i)<=audio.currentTime+.1&&audio.buffered.end(i)>audio.currentTime)return audio.buffered.end(i)-audio.currentTime;
  return 0;
 }
 function ready(){
  const remaining=Number.isFinite(audio.duration)?Math.max(0,audio.duration-audio.currentTime):Infinity;
  return audio.readyState>=3&&bufferedAhead()>=Math.min(started?2:8,remaining);
 }
 function update(){
  const playing=!audio.paused&&!priming;
  const loading=!blocked()&&!needsGesture&&!playing&&(priming||!ready());
  button.setAttribute('aria-pressed',String(playing));
  button.setAttribute('aria-busy',String(loading));
  button.setAttribute('aria-label',playing?'暂停背景音乐':loading?'背景音乐加载中，点击关闭':'播放背景音乐');
  button.classList.toggle('is-playing',playing);
 }
 function pause(){primeGeneration++;priming=false;finishPrime=null;audio.pause();audio.muted=false;update()}
 function refresh(){
  if(blocked()){pause();return}
  if(priming){finishPrime?.();update();return}
  if(playPromise||needsGesture||!ready()||!audio.paused){update();return}
  playPromise=audio.play().then(()=>{
   if(blocked())pause();else started=true;
  }).catch(error=>{if(error.name==='NotAllowedError')needsGesture=true}).finally(()=>{playPromise=null;update()});
 }
 // Unlock this element silently within a gesture on mobile Safari. Audible
 // playback waits for a useful buffer instead of starting with a few frames.
 function prime(){
  if(priming||blocked())return;
  const generation=++primeGeneration;priming=true;audio.muted=true;update();
  finishPrime=()=>{
   if(generation!==primeGeneration||!ready())return;
   priming=false;finishPrime=null;audio.pause();audio.currentTime=0;audio.muted=false;refresh();
  };
  // Keep this silent while buffering: pausing at the very first frame can
  // cause iOS to stop fetching before there is enough audio to play smoothly.
  audio.play().then(finishPrime).catch(error=>{
   if(generation!==primeGeneration)return;
   priming=false;finishPrime=null;audio.muted=false;if(error.name==='NotAllowedError')needsGesture=true;update();
  });
 }
 function activate(){needsGesture=false;if(!started&&!ready())prime();else refresh()}
 button.addEventListener('click',()=>{
  const active=!audio.paused||priming||(!needsGesture&&!ready());
  wanted=!(wanted&&active);
  try{sessionStorage.setItem('ruirui-music-enabled',String(wanted))}catch{}
  if(wanted)activate();else refresh();
 });
 for(const event of ['play','pause','ended'])audio.addEventListener(event,update);
 for(const event of ['progress','loadeddata','canplay','canplaythrough'])audio.addEventListener(event,refresh);
 audio.addEventListener('error',()=>{button.disabled=true;button.setAttribute('aria-busy','false');button.setAttribute('aria-label','背景音乐暂时无法播放')});
 function onGesture(event){if(!button.contains(event.target)&&!blocked())activate()}
 document.addEventListener('pointerdown',onGesture,{capture:true,passive:true});
 document.addEventListener('keydown',onGesture,{capture:true});
 document.addEventListener('visibilitychange',refresh);
 window.addEventListener('pagehide',()=>{leaving=true;pause()});
 window.addEventListener('pageshow',()=>{leaving=false;refresh()});
 update();refresh();
 return {refresh};
}
