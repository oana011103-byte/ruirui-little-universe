export function createMemoryVideo(player,qualitySelect){
 let current=null;
 function stop(){
  if(current){clearTimeout(current.timer);current.events.abort();current.sourceEvents?.abort();current=null}
  player.pause();
  if(player.hasAttribute('src')){player.removeAttribute('src');player.load()}
  qualitySelect.hidden=true;
 }
 function play(id){
  stop();
  const sources=id==='delta'?[
   {label:'原画 1080p',file:'delta-original.mp4',quality:'1080p'},
   {label:'流畅 1080p',file:'delta-hd.mp4',quality:'1080p'}
  ]:[
   {label:'高清 1080p',file:`${id}-hd.mp4`,quality:'1080p'},
   {label:'流畅 540p',file:`${id}.mp4`,quality:'540p'}
  ];
  const session={events:new AbortController(),sourceEvents:null,timer:0,index:0,manual:false};current=session;
  const options={signal:session.events.signal};
  qualitySelect.replaceChildren(...sources.map((source,i)=>new Option(source.label,String(i))));
  qualitySelect.hidden=false;
  function clearStall(){clearTimeout(session.timer)}
  function load(index,{position=0,resume=true}={}){
   clearStall();session.sourceEvents?.abort();session.sourceEvents=new AbortController();session.index=index;
   const source=sources[index];qualitySelect.value=String(index);
   player.dataset.quality=source.quality;player.dataset.source=source.file;
   player.src=`assets/${source.file}`;
   let restored=position<=0;
   function restorePosition(){
    if(restored||current!==session||!Number.isFinite(player.duration))return;
    const target=Math.min(position,Math.max(0,player.duration-.1));
    for(let i=0;i<player.seekable.length;i++)if(player.seekable.start(i)<=target&&player.seekable.end(i)>=target){
     restored=true;player.currentTime=target;
     if(resume)player.play().catch(()=>{});
     break;
    }
   }
   for(const event of ['loadedmetadata','canplay','progress'])player.addEventListener(event,restorePosition,{signal:session.sourceEvents.signal});
   player.load();
   // Retain the play-button gesture on mobile Safari.
   if(resume&&restored)player.play().catch(()=>{});
  }
  function fallback(){
   if(current!==session||session.index===sources.length-1)return;
   load(session.index+1,{position:player.currentTime||0,resume:!player.paused});
  }
  qualitySelect.addEventListener('change',()=>{
   session.manual=true;load(Number(qualitySelect.value),{position:player.currentTime||0,resume:!player.paused});
  },options);
  player.addEventListener('waiting',()=>{
   clearStall();if(session.manual||session.index===sources.length-1||player.paused)return;
   session.timer=setTimeout(()=>{if(!player.paused&&current===session)fallback()},player.currentTime>0?5000:8000);
  },options);
  for(const event of ['playing','pause','ended','seeking'])player.addEventListener(event,clearStall,options);
  player.addEventListener('error',fallback,options);
  // Explicit data saving uses the lighter source. Estimated Wi-Fi speed no
  // longer silently selects the old 540p Delta Force copy.
  const network=navigator.connection;
  load(network?.saveData||['slow-2g','2g'].includes(network?.effectiveType)?1:0);
 }
 return {play,stop};
}
