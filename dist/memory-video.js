export function createMemoryVideo(player){
 let current=null;
 function stop(){
  if(current){clearTimeout(current.timer);current.events.abort();current=null}
  player.pause();
  if(player.hasAttribute('src')){player.removeAttribute('src');player.load()}
 }
 function play(id){
  stop();
  const network=navigator.connection;
  const slow=network?.saveData||['slow-2g','2g','3g'].includes(network?.effectiveType)||(network?.downlink>0&&network.downlink<4.5);
  const session={events:new AbortController(),timer:0,hd:!slow,id};current=session;
  const options={signal:session.events.signal};
  function clearStall(){clearTimeout(session.timer)}
  function fallback(){
   if(current!==session||!session.hd)return;
   clearStall();session.hd=false;
   const position=player.currentTime||0;
   player.dataset.quality='540p';player.src=`assets/${id}.mp4`;
   player.addEventListener('loadedmetadata',()=>{
    if(current!==session)return;
    if(position>0)player.currentTime=Math.min(position,Math.max(0,player.duration-.1));
    player.play().catch(()=>{});
   },{...options,once:true});
   player.load();
  }
  player.addEventListener('waiting',()=>{
   clearStall();if(!session.hd||player.paused)return;
   session.timer=setTimeout(()=>{if(!player.paused&&current===session)fallback()},player.currentTime>0?1800:3000);
  },options);
  for(const event of ['playing','pause','ended'])player.addEventListener(event,clearStall,options);
  player.addEventListener('error',fallback,options);
  player.dataset.quality=session.hd?'1080p':'540p';
  player.src=`assets/${id}${session.hd?'-hd':''}.mp4`;
  player.play().catch(()=>{});
 }
 return {play,stop};
}
