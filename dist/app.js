import { preloadBirthday } from './birthday-preload.js?v=cake-ready-v2';
import { createSceneTransition } from './scene-transition.js?v=scene-fade-v1';
import { createBackgroundMusic } from './background-music.js?v=world-acappella-v1';
import { attachPixelCursorTrail } from './pixel-cursor-trail.js?v=pixel-trail-v2';
import { createCompletionHandoff } from './completion-handoff.js?v=next-or-close-v1';
import { createTearEnvelope } from './tear-envelope.js?v=scene-fade-v1';
import { playArrival } from './arrival.js?v=night-chase-v1';
import { createMemoryCompletion } from './memory-completion.js?v=edge-exit-v1';
import * as THREE from './vendor/three.module.js';
import { createGrainEarth } from './grain-earth.js?v=ice-mint-v1';
import { attachEarthControls } from './earth-controls.js?v=rounded-zoom-v1';
const $ = (q) => document.querySelector(q);
const bgm=createBackgroundMusic({audio:$('#universe-music'),button:$('#music-toggle'),isVideoOpen:()=>$('#video-dialog').open});
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const games = [
 {name:'三角洲',id:'delta',lat:46,lon:65,video:true,caption:''},
 {name:'梭哈吧朋友',id:'poker',lat:12,lon:131,video:true,caption:''},
 {name:'双影奇境',id:'split',lat:-12,lon:60,caption:''},
 {name:'双人成行',id:'it-takes-two',lat:37,lon:139,caption:''},
 {name:'幻兽帕鲁',id:'palworld',lat:-45,lon:110,caption:''},
 {name:'渔力全开',id:'fishing',lat:4,lon:18,caption:''},
 {name:'密室逃脱模拟器',id:'escape',lat:-27,lon:-22,caption:''},
 {name:'Big walk',id:'bigwalk',lat:51,lon:-62,caption:''},
 {name:'PUBG',id:'pubg',lat:-11,lon:-84,caption:''},
 {name:'链在一起',id:'chained',lat:25,lon:-142,caption:''},
 {name:'无畏契约',id:'valorant',lat:-45,lon:-153,caption:''}
];
// Display crops remove white matting already baked into the supplied photos.
const memoryFrames={
 split:[1806,1080,102,102,1706,980],palworld:[1806,1080,100,102,1706,980],
 'it-takes-two':[1806,1080,101,102,1706,980],valorant:[1806,1080,100,101,1706,980],
 chained:[1806,1080,101,102,1706,980],pubg:[1691,1015,96,96,1596,920],
 fishing:[1907,1080,105,107,1802,974],bigwalk:[1920,1072,107,108,1813,962],escape:[1817,987,101,103,1716,886]
};
function setMemoryFraming(id){
 const [iw,ih,left,top,right,bottom]=memoryFrames[id]||[1280,720,0,0,1280,720],w=right-left,h=bottom-top;
 const style=$('#memory-dialog').style;
 for(const [name,value] of Object.entries({'--media-ratio':w/h,'--image-width':`${iw/w*100}%`,'--image-height':`${ih/h*100}%`,'--image-left':`${-left/w*100}%`,'--image-top':`${-top/h*100}%`}))style.setProperty(name,value);
}
const storage = {get(key, fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}},set(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{}}};
// New visits start fresh; only returning from birthday consumes this visit’s one-time snapshot.
let birthdayReturn=null;
try{const saved=sessionStorage.getItem('ruirui-birthday-return');sessionStorage.removeItem('ruirui-birthday-return');const params=new URLSearchParams(location.search);if(saved&&(params.get('from')==='birthday'||performance.getEntriesByType('navigation')[0]?.type==='back_forward'))birthdayReturn=JSON.parse(saved);if(params.get('from')==='birthday'){params.delete('from');history.replaceState(null,'',location.pathname+(params.size?'?'+params:'')+location.hash)}}catch{}
const visited = new Set((Array.isArray(birthdayReturn?.visited)?birthdayReturn.visited:[]).filter(id=>games.some(g=>g.id===id)));
let completionUnlocked=visited.size===games.length,completionPending=false;
const completion=createMemoryCompletion({dialog:$('#completion-dialog'),reduced,onComplete(){completionUnlocked=true;completionPending=false;updateProgress();$('#gift-cake').focus({preventScroll:true})}});
const handoff=createCompletionHandoff({pending:()=>completionPending&&!completionUnlocked,visible:()=>!document.hidden,photoOpen:()=>$('#memory-dialog').open,videoOpen:()=>$('#video-dialog').open,start:startCompletionNow,next:()=>openMemory(currentGame+1)});
function startCompletionNow(){
 if(!completionPending||completionUnlocked||document.hidden)return;
 for(const id of ['#memory-dialog','#video-dialog'])if($(id).open)$(id).close();
 completion.start();
}
$('#memory-player').addEventListener('ended',handoff.videoEnded);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&completionPending&&$('#video-dialog').open&&$('#memory-player').ended)handoff.videoEnded()});
function maybeStartCompletion(){if(completionPending&&!completionUnlocked&&!document.querySelector('dialog[open]'))completion.start()}
let currentGame = 0, lastFocus, toastTimer;
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),4200)}
function updateDate(){const date=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const p=Object.fromEntries(date.map(x=>[x.type,x.value]));const day=Math.floor((Date.UTC(+p.year,+p.month-1,+p.day)-Date.UTC(2026,5,22))/86400000)+1;$('#days').textContent=Math.max(1,day);$('#arrival-days').textContent=Math.max(1,day)}
updateDate();setInterval(updateDate,60000);
function openDialog(id){const old=document.querySelector('dialog[open]:not(#scene-transition)');if(old)old.close();lastFocus=document.activeElement;$(id).showModal();bgm.refresh()}
function closeDialog(dialog){if(dialog.id==='letter-dialog'){sceneTransition.run(()=>dialog.close(),{focus:lastFocus});return}dialog.close();lastFocus?.focus?.({preventScroll:true})}
for(const d of document.querySelectorAll('dialog')){d.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>closeDialog(d));d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog(d)}});d.addEventListener('close',()=>{bgm.refresh();if(d.id==='video-dialog'){$('#memory-player').pause();$('#memory-player').removeAttribute('src');$('#memory-player').load()}if(d.id==='letter-dialog')resetLetter();if(d.id!=='completion-dialog')maybeStartCompletion();})}
$('#guide-button').onclick=()=>openDialog('#guide-dialog');
$('#memories-button').onclick=()=>{renderGameList();openDialog('#map-dialog')};
$('#gift-letter').onclick=()=>{const opener=document.activeElement;sceneTransition.run(()=>{resetLetter();openDialog('#letter-dialog');lastFocus=opener},{focus:$('#open-letter')})};
$('#gift-cake').onclick=()=>sceneTransition.run(()=>{try{sessionStorage.setItem('ruirui-birthday-return',JSON.stringify({visited:[...visited],targetX,targetY,globeZoom}))}catch{}const returnURL=new URL(location.href);returnURL.searchParams.set('from','birthday');history.replaceState(null,'',returnURL);location.assign('birthday/?v=cake-ready-v2')},{hold:true});
function renderGameList(){$('#game-list').innerHTML='';games.forEach((g,i)=>{const b=document.createElement('button');b.className='game-list-button'+(visited.has(g.id)?' visited':'');b.innerHTML=`<img src="assets/${g.id}.webp" alt=""><span>${g.name}</span><i class="list-dot"></i>`;b.setAttribute('aria-label',g.name+(visited.has(g.id)?'，已点亮':'，尚未点亮'));b.onclick=()=>openMemory(i);$('#game-list').append(b)})}
function openMemory(i){currentGame=(i+games.length)%games.length;const g=games[currentGame];setMemoryFraming(g.id);const before=visited.size;visited.add(g.id);if(before<games.length&&visited.size===games.length)completionPending=true;updateProgress();$('#memory-image').src=`assets/${g.id}.webp`;$('#memory-image').alt=`我们一起玩${g.name}的游戏回忆`;$('#memory-title').textContent=g.name;$('#memory-number').textContent=`${currentGame+1} / 11`;$('#memory-caption').textContent=g.caption;$('#memory-video').hidden=!g.video;$('#memory-video').setAttribute('aria-label',`播放${g.name}的游戏录像`);$('#memory-video').onclick=()=>playVideo(g);if(!$('#memory-dialog').open)openDialog('#memory-dialog');if(completionPending){$('#memory-caption').textContent='11 个坐标都看过啦，点下一个。';}$('#intro-hint').classList.add('faded')}
$('#previous-memory').onclick=()=>openMemory(currentGame-1);$('#next-memory').onclick=handoff.advance;
function playVideo(g){$('#video-title').textContent=g.name+' · 我们的游戏录像';$('#memory-player').src=`assets/${g.id}.mp4`;$('#memory-player').poster=`assets/${g.id}.webp`;openDialog('#video-dialog');$('#memory-player').play().catch(()=>{})}
function updateProgress(){const n=visited.size;if(n>=3)preloadBirthday();if(n>0)$('#intro-hint').hidden=true;$('#orbit-progress').hidden=n===0||completionUnlocked;$('#gift-actions').hidden=!completionUnlocked;$('#progress-count').textContent=n;$('#progress-label').textContent=completionUnlocked?'都看过啦':'看过的回忆';$('#progress-note').textContent=completionUnlocked?'':n===11?'都看完啦':'点开有播放图标的回忆，就能播放录像';$('#gift-cake').hidden=!completionUnlocked;$('#gift-letter').hidden=!completionUnlocked;renderOrbit();for(const [i,g] of games.entries()){g.button?.classList.toggle('visited',visited.has(g.id));g.button?.setAttribute('aria-label',visited.has(g.id)?`${g.name}，已点亮`:`未点亮的星星 ${i+1}，点击查看回忆`)}}
let renderedOrbitCount=-1;
function renderOrbit(){
 const n=visited.size;if(n===renderedOrbitCount)return;renderedOrbitCount=n;
 const svg=$('#progress-stars'),width=600,height=100;
 svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
 svg.setAttribute('aria-label',`已点亮 ${n} 颗回忆星，共十一颗`);
 svg.innerHTML='<path class="orbit-track" d="M28 76 Q300 -12 572 76"/>';
 const path=svg.querySelector('path'),length=path.getTotalLength();
 $('#orbit-stars').innerHTML=games.map((g,i)=>{
  const p=path.getPointAtLength(length*i/(games.length-1));
  return `<span class="orbit-star${visited.has(g.id)?' is-lit':''}" style="left:${p.x/width*100}%;top:${p.y/height*100}%;--star-tilt:${[-8,5,-3][i%3]}deg"></span>`;
 }).join('');
}
// The memory beacons are anchored to a real, rotatable 3D sphere.
let earthRenderer,earthScene,earthCamera,world,beaconGroup,earthRect,dragging=false,dragDistance=0,targetX=Number.isFinite(birthdayReturn?.targetX)?birthdayReturn.targetX:.15,targetY=Number.isFinite(birthdayReturn?.targetY)?birthdayReturn.targetY:-195*Math.PI/180,lastEarthTime=0,earthFrame,globeZoom=Number.isFinite(birthdayReturn?.globeZoom)?Math.max(.65,Math.min(1.5,birthdayReturn.globeZoom)):1;
const earthOverscan=1.8,globeRadius=2.22,vec=new THREE.Vector3();
async function initEarth(){try{earthRenderer=new THREE.WebGLRenderer({canvas:$('#earth-canvas'),antialias:true,alpha:true});earthRenderer.setPixelRatio(Math.min(devicePixelRatio,2));earthRenderer.outputColorSpace=THREE.SRGBColorSpace;earthRenderer.setClearColor(0x000000,0);earthScene=new THREE.Scene();earthCamera=new THREE.PerspectiveCamera(38,1,.1,100);earthCamera.position.set(0,0,8.8);world=new THREE.Group();earthScene.add(world);await createGrainEarth(world,globeRadius,earthRenderer.getPixelRatio());world.rotation.set(targetX,targetY,0);beaconGroup=new THREE.Group();world.add(beaconGroup);for(let i=0;i<games.length;i++){const g=games[i],lat=g.lat*Math.PI/180,lon=g.lon*Math.PI/180;g.anchor=new THREE.Vector3(globeRadius*1.012*Math.cos(lat)*Math.cos(lon),globeRadius*1.012*Math.sin(lat),globeRadius*1.012*Math.cos(lat)*Math.sin(lon));const b=document.createElement('button');b.className='beacon';b.innerHTML=`<span class="beacon-star" aria-hidden="true" style="--star-image:url(assets/doodles/${['star-five','star-four','sparkle-eight'][i%3]}.png);--star-tilt:${[-10,7,-5][i%3]}deg"></span><span class="beacon-label">${g.name}${g.video?'<i class="mini-play">▷</i>':''}</span>`;b.onclick=e=>{e.stopPropagation();if(dragDistance<8)openMemory(i)};g.button=b;$('#beacons').append(b)}resizeEarth();updateProgress();animateEarth(0)}catch(err){console.warn('WebGL unavailable',err);$('#earth-fallback').hidden=false;$('#earth-canvas').hidden=true;$('#intro-hint').textContent='打开回忆星图，点亮属于我们的星星。';}}
function resizeEarth(){earthRect=$('#earth-scene').getBoundingClientRect();if(!earthRenderer)return;earthRenderer.setSize(earthRect.width,earthRect.height*earthOverscan,false);earthCamera.aspect=earthRect.width/(earthRect.height*earthOverscan);earthCamera.position.z=earthRect.width/earthRect.height<1?9.15:7.8;earthCamera.zoom=globeZoom/earthOverscan;earthCamera.updateProjectionMatrix()}
function animateEarth(t){earthFrame=requestAnimationFrame(animateEarth);const dt=Math.min((t-lastEarthTime)/1000,.05);lastEarthTime=t;if(!dragging&&!document.querySelector('dialog[open]')&&!reduced)targetY+=dt*.018;world.rotation.y+=(targetY-world.rotation.y)*.12;world.rotation.x+=(targetX-world.rotation.x)*.12;world.updateMatrixWorld();for(const g of games){vec.copy(g.anchor).applyMatrix4(world.matrixWorld);const visible=vec.z>.38;g.button.style.visibility=visible?'visible':'hidden';g.button.tabIndex=visible?0:-1;if(visible){let facing=Math.min(1,(vec.z-.2)/.8);g.button.style.opacity=facing;vec.project(earthCamera);g.button.style.left=(vec.x*.5+.5)*earthRect.width+'px';g.button.style.top=((-vec.y*.5+.5)*earthRect.height*earthOverscan-earthRect.height*(earthOverscan-1)/2)+'px'}}if(!document.hidden)earthRenderer.render(earthScene,earthCamera)}
const earthNode=$('#earth-scene');
attachEarthControls({surface:$('#universe'),earthNode,isBlocked:()=>!!document.querySelector('dialog[open]'),
 onZoom:zoom=>{globeZoom=zoom;if(earthCamera){earthCamera.zoom=zoom/earthOverscan;earthCamera.updateProjectionMatrix()}$('#earth-fallback>div').style.transform=`scale(${zoom})`;$('#intro-hint').classList.add('faded')},
 onRotate:(dx,dy)=>{targetY+=dx*.006;targetX=Math.max(-.8,Math.min(.8,targetX+dy*.004))},
 onDrag:(active,distance)=>{dragging=active;dragDistance=distance;if(distance>8)$('#intro-hint').classList.add('faded')}
});
playArrival({dialog:$('#arrival-dialog'),reduced,onFinish(){setTimeout(()=>$('#intro-hint').classList.add('faded'),14000)}});
window.addEventListener('resize',resizeEarth);
initEarth();updateProgress();renderGameList();
const sceneTransition=createSceneTransition(reduced);
$('#letter-dialog').addEventListener('cancel',event=>{event.preventDefault();closeDialog($('#letter-dialog'))});
const letterEnvelope=createTearEnvelope({dialog:$('#letter-dialog'),reduced});
function resetLetter(){letterEnvelope.reset()}

attachPixelCursorTrail();
