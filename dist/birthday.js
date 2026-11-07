import { createSceneTransition } from './scene-transition.js?v=scene-fade-v1';
import { attachPixelCursorTrail } from './pixel-cursor-trail.js?v=pixel-trail-v2';
import { createBirthdayConfetti } from './birthday-confetti.js?v=black-confetti-v1';
const $=selector=>document.querySelector(selector),flames=[...document.querySelectorAll('.candle-flame')],birthdayMusic=$('#birthday-music');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,confetti=createBirthdayConfetti($('#confetti'),reduced);
const sceneTransition=createSceneTransition(reduced);
$('.back-link').addEventListener('click',event=>{if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();if(parent!==window){parent.postMessage({type:'ruirui:birthday-back'},location.origin);return}sceneTransition.run(()=>location.assign($('.back-link').href),{hold:true})});
let candlesLit=false,activeAudio,songPlaying=false,songRun=0,micStream,micSource,micAnalyser,micTimer,micSamples=0,micRun=0,micFrame=0,leaving=false;
function message(text){$('#birthday-message').textContent=text}
function setCandlesLit(lit){candlesLit=lit;$('.cake-illustration').classList.toggle('candles-lit',lit);flames.forEach(flame=>flame.hidden=!lit)}
function lightCandles(){confetti.clear();message('');setCandlesLit(true);$('#light-candles').hidden=true;$('#wish-controls').hidden=false;$('#birthday-done').hidden=true;$('#cake-status').textContent='';startBirthdaySong();}
function blowCandles(){if(!candlesLit)return;setCandlesLit(false);stopMic();stopBirthdaySong();$('#wish-controls').hidden=true;$('#birthday-done').hidden=false;$('#cake-status').textContent='生日快乐，瑞瑞。';confetti.launch();$('#replay-confetti').focus({preventScroll:true});}
function setSongState(playing){songPlaying=playing;const button=$('#birthday-song');button.textContent=playing?'音乐开':'音乐关';button.setAttribute('aria-pressed',String(playing));button.setAttribute('aria-label',playing?'暂停生日歌':'播放生日歌')}
function audio(){if(!activeAudio)activeAudio=new (window.AudioContext||window.webkitAudioContext)();if(activeAudio.state==='suspended')activeAudio.resume();return activeAudio}
// A complete soft-keyboard arrangement keeps note releases and the room tail continuous.
async function startBirthdaySong(resume=false){
 const run=++songRun;if(birthdayMusic.error){birthdayMusic.load();resume=false}if(!resume||birthdayMusic.ended)birthdayMusic.currentTime=0;
 birthdayMusic.volume=.85;setSongState(true);
 try{await birthdayMusic.play()}catch{if(run!==songRun)return;setSongState(false);message('音乐没放出来，再点一下试试。')}
}
function pauseBirthdaySong(){songRun++;birthdayMusic.pause();setSongState(false)}
function stopBirthdaySong(){pauseBirthdaySong();birthdayMusic.currentTime=0}
birthdayMusic.addEventListener('ended',()=>{setSongState(false)});
birthdayMusic.addEventListener('error',()=>{if(!songPlaying)return;pauseBirthdaySong();message('音乐没放出来，再点一下试试。')});
function sampleMic(){if(!micAnalyser||!candlesLit)return;const values=new Uint8Array(micAnalyser.fftSize);micAnalyser.getByteTimeDomainData(values);const rms=Math.sqrt(values.reduce((sum,v)=>sum+((v-128)/128)**2,0)/values.length);micSamples=rms>.10?micSamples+1:Math.max(0,micSamples-1);if(micSamples>6)blowCandles();else micFrame=requestAnimationFrame(sampleMic)}
function stopMic(){micRun++;clearTimeout(micTimer);cancelAnimationFrame(micFrame);micStream?.getTracks().forEach(track=>track.stop());micSource?.disconnect();micStream=null;micSource=null;micAnalyser=null;micSamples=0;$('#mic-blow').disabled=false;$('#mic-blow').textContent='用麦克风吹'}
$('#mic-blow').onclick=async()=>{
 if(micStream)return;message('');if(!navigator.mediaDevices?.getUserMedia)return message('这里用不了麦克风，点「吹蜡烛」也可以。');
 const run=++micRun,button=$('#mic-blow');button.disabled=true;button.textContent='打开麦克风…';
 try{const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});if(run!==micRun||leaving||document.hidden||!candlesLit){stream.getTracks().forEach(track=>track.stop());return}micStream=stream;micSource=audio().createMediaStreamSource(stream);micAnalyser=audio().createAnalyser();micAnalyser.fftSize=512;micSource.connect(micAnalyser);button.textContent='正在听，吹一下';sampleMic();micTimer=setTimeout(()=>{stopMic();message('没听到吹气声，再试一次，或点「吹蜡烛」。')},15000)}catch{if(run===micRun){stopMic();message('麦克风没打开，点「吹蜡烛」也可以。')}}
};
$('#light-candles').onclick=lightCandles;$('#relight').onclick=lightCandles;$('#manual-blow').onclick=blowCandles;
$('#birthday-song').onclick=()=>songPlaying?pauseBirthdaySong():startBirthdaySong(true);$('#replay-confetti').onclick=()=>confetti.launch();
function pause(){stopMic();stopBirthdaySong();confetti.clear();activeAudio?.suspend()}
window.addEventListener('pagehide',()=>{leaving=true;pause()});window.addEventListener('pageshow',event=>{leaving=false;if(event.persisted){pause();setCandlesLit(false);$('#light-candles').hidden=false;$('#wish-controls').hidden=true;$('#birthday-done').hidden=true;$('#cake-status').textContent='先点蜡烛吧。';message('')}});document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});

attachPixelCursorTrail();

// Reveal only once the actual cake bitmap has been decoded; audio never blocks entry.
async function revealBirthdayPage(){
 const artwork=$('.cake-illustration img');
 try{await artwork.decode()}catch{}
 if(parent!==window){document.documentElement.removeAttribute('data-birthday-loading');parent.postMessage({type:'ruirui:birthday-ready'},location.origin)}else requestAnimationFrame(()=>requestAnimationFrame(()=>document.documentElement.removeAttribute('data-birthday-loading')));
}
revealBirthdayPage();

window.addEventListener('message',event=>{
 if(parent===window||event.origin!==location.origin||event.source!==parent||event.data?.type!=='ruirui:birthday-reset')return;
 pause();setCandlesLit(false);$('#light-candles').hidden=false;$('#wish-controls').hidden=true;$('#birthday-done').hidden=true;$('#cake-status').textContent='先点蜡烛吧。';message('');
});
