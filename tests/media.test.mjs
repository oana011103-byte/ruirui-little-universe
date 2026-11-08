import test from 'node:test';
import assert from 'node:assert/strict';
import {createBackgroundMusic} from '../dist/background-music.js';
import {createMemoryVideo} from '../dist/memory-video.js';

class Media extends EventTarget {
 paused=true;muted=false;currentTime=0;duration=232;readyState=3;dataset={};src='';ahead=0;plays=[];
 get buffered(){return {length:this.ahead?1:0,start:()=>0,end:()=>this.ahead}}
 get seekable(){return {length:this.canSeek===false?0:1,start:()=>0,end:()=>this.duration}}
 play(){this.plays.push({muted:this.muted,src:this.src});this.paused=false;this.dispatchEvent(new Event('play'));return this.pendingPlay||Promise.resolve()}
 pause(){if(!this.paused){this.paused=true;this.dispatchEvent(new Event('pause'))}}
 load(){this.paused=true}
 hasAttribute(){return !!this.src}
 removeAttribute(){this.src=''}
 buffer(seconds){this.ahead=seconds;this.dispatchEvent(new Event('progress'))}
}
class Control extends EventTarget {
 hidden=true;value='';attributes={};disabled=false;classList={toggle(){}};
 setAttribute(k,v){this.attributes[k]=v}
 contains(){return false}
 replaceChildren(...children){this.options=children}
}
const flush=()=>new Promise(resolve=>setImmediate(resolve));
function environment(){
 globalThis.document=new EventTarget();document.hidden=false;
 globalThis.window=new EventTarget();
 globalThis.sessionStorage={getItem:()=>null,setItem(){}};
 Object.defineProperty(globalThis,'navigator',{value:{connection:{effectiveType:'4g',downlink:3}},configurable:true});
 globalThis.Option=class {constructor(text,value){this.text=text;this.value=value}};
}

test('music buffers before audible playback and keeps video/mute controls authoritative',async()=>{
 environment();const audio=new Media(),button=new Control();let videoOpen=false;
 const music=createBackgroundMusic({audio,button,isVideoOpen:()=>videoOpen});
 assert.equal(audio.preload,'auto');assert.equal(audio.plays.length,0);
 audio.buffer(2);assert.equal(audio.plays.length,0);
 document.dispatchEvent(new Event('pointerdown'));await flush();
 assert.deepEqual(audio.plays.map(p=>p.muted),[true]);
 assert.equal(audio.paused,false);assert.equal(audio.muted,true);
 audio.buffer(12);await flush();assert.equal(audio.paused,false);
 assert.equal(audio.plays.at(-1).muted,false);
 videoOpen=true;music.refresh();assert.equal(audio.paused,true);
 audio.buffer(40);await flush();assert.equal(audio.paused,true);
 videoOpen=false;music.refresh();await flush();assert.equal(audio.paused,false);
 button.dispatchEvent(new Event('click'));assert.equal(audio.paused,true);
 document.dispatchEvent(new Event('pointerdown'));assert.equal(audio.paused,true);
 button.dispatchEvent(new Event('click'));await flush();assert.equal(audio.paused,false);
});

test('a late muted unlock cannot restart music over a video',async()=>{
 environment();const audio=new Media(),button=new Control();let videoOpen=false,resolvePlay;
 audio.ahead=1;audio.pendingPlay=new Promise(resolve=>resolvePlay=resolve);
 const music=createBackgroundMusic({audio,button,isVideoOpen:()=>videoOpen});
 document.dispatchEvent(new Event('pointerdown'));assert.equal(audio.muted,true);
 videoOpen=true;music.refresh();resolvePlay();await flush();
 assert.equal(audio.paused,true);assert.equal(audio.muted,false);
});

test('autoplay denial is retried by a real gesture, not by progress events',async()=>{
 environment();const audio=new Media(),button=new Control();audio.ahead=30;
 audio.pendingPlay=Promise.reject(Object.assign(new Error('gesture required'),{name:'NotAllowedError'}));
 audio.play=function(){this.plays.push({muted:this.muted});if(this.pendingPlay)return this.pendingPlay;this.paused=false;return Promise.resolve()};
 createBackgroundMusic({audio,button,isVideoOpen:()=>false});await flush();
 audio.buffer(40);assert.equal(audio.plays.length,1);
 audio.pendingPlay=null;document.dispatchEvent(new Event('pointerdown'));await flush();
 assert.equal(audio.paused,false);assert.equal(audio.plays.length,2);
});

test('Delta defaults to untouched 1080p, keeps 1080p fallback, and preserves paused quality changes',()=>{
 environment();const player=new Media(),select=new Control();
 const video=createMemoryVideo(player,select);video.play('delta');
 // A coarse 3 Mbps network estimate must not silently choose 540p.
 assert.equal(player.src,'assets/delta-original.mp4');assert.equal(player.dataset.quality,'1080p');
 player.currentTime=17;player.pause();select.value='1';select.dispatchEvent(new Event('change'));
 player.currentTime=0;player.dispatchEvent(new Event('loadedmetadata'));
 assert.equal(player.src,'assets/delta-hd.mp4');assert.equal(player.currentTime,17);assert.equal(player.paused,true);
 select.value='0';select.dispatchEvent(new Event('change'));assert.equal(player.src,'assets/delta-original.mp4');
 video.stop();assert.equal(player.src,'');assert.equal(select.hidden,true);
 navigator.connection.saveData=true;video.play('delta');assert.equal(player.src,'assets/delta-hd.mp4');assert.equal(player.dataset.quality,'1080p');
 video.stop();
});

test('only sustained buffering falls back, without dropping Delta to 540p',()=>{
 environment();const player=new Media(),select=new Control();
 const originalSet=globalThis.setTimeout,originalClear=globalThis.clearTimeout;let scheduled;
 globalThis.setTimeout=(callback,delay)=>{scheduled={callback,delay};return scheduled};
 globalThis.clearTimeout=handle=>{if(handle===scheduled)scheduled=null};
 try{
  const video=createMemoryVideo(player,select);video.play('delta');
  player.dispatchEvent(new Event('waiting'));assert.equal(scheduled.delay,8000);
  player.dispatchEvent(new Event('playing'));assert.equal(scheduled,null);
  player.currentTime=14;player.dispatchEvent(new Event('waiting'));assert.equal(scheduled.delay,5000);
  scheduled.callback();player.currentTime=0;player.dispatchEvent(new Event('loadedmetadata'));
  assert.equal(player.src,'assets/delta-hd.mp4');assert.equal(player.dataset.quality,'1080p');assert.equal(player.currentTime,14);
  video.stop();
 }finally{globalThis.setTimeout=originalSet;globalThis.clearTimeout=originalClear}
});

test('a quality change waits for a seekable range before resuming at the old position',()=>{
 environment();const player=new Media(),select=new Control();
 const video=createMemoryVideo(player,select);video.play('delta');player.currentTime=21;
 player.canSeek=false;select.value='1';select.dispatchEvent(new Event('change'));
 player.currentTime=0;player.dispatchEvent(new Event('loadedmetadata'));assert.equal(player.paused,true);
 player.canSeek=true;player.dispatchEvent(new Event('progress'));
 assert.equal(player.currentTime,21);assert.equal(player.paused,false);video.stop();
});
