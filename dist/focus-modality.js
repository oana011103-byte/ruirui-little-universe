// Dialog autofocus and focus restoration remain useful for screen readers,
// but must not leave keyboard-style rectangles after a tap in iOS WebViews.
const root=document.documentElement;
function pointer(){root.dataset.focusInput='pointer'}
pointer();
document.addEventListener('pointerdown',pointer,{capture:true,passive:true});
document.addEventListener('touchstart',pointer,{capture:true,passive:true});
document.addEventListener('keydown',event=>{
 if(event.metaKey||event.ctrlKey||event.altKey||['Shift','Control','Meta','Alt'].includes(event.key))return;
 root.dataset.focusInput='keyboard';
},true);
