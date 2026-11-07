// Keep the surrounding interface fixed while input changes only the globe lens.
export function attachEarthControls({surface,earthNode,isBlocked,onZoom,onRotate,onDrag}){
 let zoom=1,dragging=false,dragDistance=0,lastPointer=null,pinchDistance=0,gestureZoom=null,resetTimer;
 const pointers=new Map(),clamp=value=>Math.max(.65,Math.min(1.5,value));
 const distance=()=>{const [a,b]=[...pointers.values()];return Math.hypot(a.x-b.x,a.y-b.y)};
 function setZoom(next){if(!Number.isFinite(next))return;zoom=clamp(next);onZoom(zoom)}
 function reportDrag(){onDrag(dragging,dragDistance)}
 function reset(){pointers.clear();dragging=false;lastPointer=null;pinchDistance=0;gestureZoom=null;reportDrag();clearTimeout(resetTimer);resetTimer=setTimeout(()=>{dragDistance=0;reportDrag()},50)}
 surface.addEventListener('pointerdown',event=>{
  if(isBlocked()||event.button!==0)return;
  clearTimeout(resetTimer);pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
  if(pointers.size===2){
   pinchDistance=distance();lastPointer=null;dragging=true;dragDistance=Math.max(8,dragDistance);
   for(const id of pointers.keys())surface.setPointerCapture(id);
  }else if(pointers.size===1&&earthNode.contains(event.target)){
   dragging=true;dragDistance=0;lastPointer={x:event.clientX,y:event.clientY};
   if(!event.target.closest('button'))surface.setPointerCapture(event.pointerId);
  }
  reportDrag();
 });
 surface.addEventListener('pointermove',event=>{
  if(!pointers.has(event.pointerId))return;
  if(isBlocked()){reset();return}
  pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
  if(pointers.size>=2){
   const nextDistance=distance();
   if(pinchDistance>0)setZoom(zoom*nextDistance/pinchDistance);
   pinchDistance=nextDistance;dragDistance=Math.max(8,dragDistance);reportDrag();return;
  }
  if(!dragging||!lastPointer)return;
  const dx=event.clientX-lastPointer.x,dy=event.clientY-lastPointer.y;
  dragDistance+=Math.abs(dx)+Math.abs(dy);lastPointer={x:event.clientX,y:event.clientY};onRotate(dx,dy);reportDrag();
 });
 function endPointer(event){
  if(!pointers.has(event.pointerId))return;
  pointers.delete(event.pointerId);dragging=false;lastPointer=null;pinchDistance=0;reportDrag();
  if(!pointers.size)reset();
 }
 window.addEventListener('pointerup',endPointer);window.addEventListener('pointercancel',endPointer);window.addEventListener('blur',reset);
 // Chromium trackpad pinch arrives as Ctrl+wheel; ordinary wheel also zooms the globe.
 window.addEventListener('wheel',event=>{
  if(isBlocked()||(!surface.contains(event.target)&&!event.ctrlKey&&!event.metaKey))return;
  if(gestureZoom!==null){event.preventDefault();return}
  event.preventDefault();const pixels=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?surface.clientHeight:1);
  setZoom(zoom*Math.exp(-Math.max(-160,Math.min(160,pixels))*(event.ctrlKey?.008:.0018)));
 },{passive:false});
 // Safari exposes trackpad pinch through gesture events instead of wheel.
 window.addEventListener('gesturestart',event=>{if(isBlocked())return;event.preventDefault();gestureZoom=zoom},{passive:false});
 window.addEventListener('gesturechange',event=>{if(gestureZoom===null||isBlocked())return;event.preventDefault();setZoom(gestureZoom*event.scale)},{passive:false});
 window.addEventListener('gestureend',event=>{if(gestureZoom===null)return;event.preventDefault();gestureZoom=null},{passive:false});
 window.addEventListener('keydown',event=>{
  if(isBlocked()||event.target.closest('input,textarea,[contenteditable="true"]'))return;
  const focused=event.target===earthNode,shortcut=event.ctrlKey||event.metaKey;
  if((focused||shortcut)&&['+','=','-','_','0'].includes(event.key)){
   event.preventDefault();setZoom(event.key==='0'?1:zoom*(['-','_'].includes(event.key)?1/1.12:1.12));
  }else if(focused&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){
   event.preventDefault();onRotate(event.key==='ArrowRight'?36.7:event.key==='ArrowLeft'?-36.7:0,event.key==='ArrowDown'?37.5:event.key==='ArrowUp'?-37.5:0);
  }
 });
}
