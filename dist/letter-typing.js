// Reserve the whole letter's layout so typing never changes its line breaks.
export function createLetterTyping({body,reduced}){
 const characters=[];
 for(const paragraph of body.querySelectorAll('p')){
  const text=paragraph.textContent;
  const accessible=document.createElement('span');
  accessible.className='letter-readable-text';accessible.textContent=text;
  const ink=document.createElement('span');ink.setAttribute('aria-hidden','true');
  for(const character of Array.from(text)){
   const span=document.createElement('span');span.className='letter-character';span.textContent=character;
   ink.append(span);characters.push(span);
  }
  paragraph.replaceChildren(accessible,ink);
 }
 let timer=0,index=0,following=true;
 function stop(){clearTimeout(timer);timer=0;body.classList.remove('is-typing')}
 function reset(){stop();index=0;following=true;body.scrollTop=0;characters.forEach(c=>c.classList.remove('is-written'))}
 function complete(){stop();index=characters.length;characters.forEach(c=>c.classList.add('is-written'))}
 function tick(){
  if(document.hidden){timer=setTimeout(tick,250);return}
  const character=characters[index++];
  if(!character){stop();return}
  character.classList.add('is-written');
  if(following){const bottom=character.offsetTop+character.offsetHeight+8;if(bottom>body.scrollTop+body.clientHeight)body.scrollTop=bottom-body.clientHeight}
  const pause=/[。！？]/.test(character.textContent)?320:/[，、：；]/.test(character.textContent)?180:65;
  timer=setTimeout(tick,pause);
 }
 function start(){reset();if(reduced){complete();return}body.classList.add('is-typing');timer=setTimeout(tick,300)}
 // A reader's scroll takes priority over automatic following.
 body.addEventListener('wheel',()=>following=false,{passive:true});
 body.addEventListener('touchmove',()=>following=false,{passive:true});
 body.addEventListener('keydown',event=>{if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(event.key))following=false;if(event.key==='End')complete()});
 return {start,stop,reset};
}
