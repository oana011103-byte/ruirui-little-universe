import * as THREE from './vendor/three.module.js';
import { roundLandGeometry } from './rounded-land.js?v=rounded-coasts-1';
const vertex=`varying vec2 vUv; varying vec3 vNormal; void main(){vUv=uv;vNormal=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const fragment=`precision highp float;
uniform sampler2D uMap;uniform sampler2D uMask;uniform sampler2D uTerrain;uniform float uStyle;
varying vec2 vUv;varying vec3 vNormal;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){vec3 n=normalize(vNormal);float light=dot(n,normalize(vec3(-.45,.65,1.2)));float land=texture2D(uMask,vUv).r;vec3 color;
if(uStyle<.5){color=texture2D(uMap,vUv).rgb;color*=.9+.1*max(light,0.);color+=pow(max(n.z,0.),5.)*.018;}
else if(uStyle<1.5){vec3 sea=vec3(.61,.81,.93);vec3 green=vec3(.87,.96,.92);color=mix(sea,green,land);float grain=hash(floor(vUv*vec2(2600.,1300.)));float grain2=hash(floor(vUv*vec2(4100.,2050.)));color+=(grain-.5)*.18+(grain2-.5)*.06;color*=.94+.06*max(light,0.);color=mix(color,vec3(.93,.98,1.),pow(1.-max(n.z,0.),4.)*.25);}
else{vec3 terrain=texture2D(uTerrain,vUv).rgb;float brightness=dot(terrain,vec3(.299,.587,.114));float greenness=clamp((terrain.g-terrain.r)*4.+.65,0.,1.);vec3 ground=mix(vec3(.9,.82,.5),vec3(.56,.77,.36),greenness);ground=mix(ground,vec3(.98,.97,.83),smoothstep(.57,.88,brightness)*.8);vec3 sea=mix(vec3(.36,.70,.86),vec3(.5,.79,.91),brightness*.8);color=mix(sea,ground,land);color*=.9+.1*max(light,0.);color+=(hash(floor(vUv*vec2(3500.,1750.)))-.5)*.075;color=mix(color,vec3(1.,.98,.76),pow(1.-max(n.z,0.),4.)*.30);}
gl_FragColor=vec4(clamp(color,0.,1.),1.);}`;
function colorTexture(features,mask=false){const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=1024;const ctx=canvas.getContext('2d');ctx.fillStyle=mask?'#000':'#fbdce4';ctx.fillRect(0,0,2048,1024);const projection=window.d3.geoEquirectangular().translate([1024,512]).scale(2048/(2*Math.PI)),draw=window.d3.geoPath(projection,ctx);for(const feature of features){if(feature.id==='010')continue;const [lon,lat]=window.d3.geoCentroid(feature);ctx.fillStyle=mask?'#fff':lon < -28 || (lon > 105 && lat < -10)?'#cdb7df':'#afd8d0';ctx.beginPath();draw(feature);ctx.fill()}if(mask)roundMaskEdges(canvas);const t=new THREE.CanvasTexture(canvas);t.anisotropy=4;return t;}

// Round the last small inlets and capes, then restore a clean land/sea edge.
// The tiled source prevents a seam where the texture wraps around the globe.
function roundMaskEdges(canvas){
 const width=512,height=256;
 const tiled=document.createElement('canvas');tiled.width=width*3;tiled.height=height;
 const tiledCtx=tiled.getContext('2d');
 for(let i=0;i<3;i++)tiledCtx.drawImage(canvas,i*width,0,width,height);
 const softened=document.createElement('canvas');softened.width=width;softened.height=height;
 const ctx=softened.getContext('2d');ctx.fillStyle='#000';ctx.fillRect(0,0,width,height);ctx.filter='blur(3px)';ctx.drawImage(tiled,-width,0);ctx.filter='none';
 const pixels=ctx.getImageData(0,0,width,height);
 for(let i=0;i<pixels.data.length;i+=4){const t=Math.max(0,Math.min(1,(pixels.data[i]/255-.46)/.08)),value=Math.round(t*t*(3-2*t)*255);pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=value;pixels.data[i+3]=255;}
 ctx.putImageData(pixels,0,0);
 const target=canvas.getContext('2d');target.clearRect(0,0,canvas.width,canvas.height);target.drawImage(softened,0,0,canvas.width,canvas.height);
}

function addDust(group,mask,ratio){const n=22000,positions=new Float32Array(n*3),uvs=new Float32Array(n*2);let seed=521;const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};for(let i=0;i<n;i++){const u=random(),v=Math.acos(2*random()-1)/Math.PI,theta=u*Math.PI*2,phi=v*Math.PI,r=1.004+random()*.013;positions.set([-r*Math.cos(theta)*Math.sin(phi),r*Math.cos(phi),r*Math.sin(theta)*Math.sin(phi)],i*3);uvs.set([u,1-v],i*2)}const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.BufferAttribute(uvs,2));const material=new THREE.ShaderMaterial({uniforms:{uMask:{value:mask},uRatio:{value:ratio}},transparent:true,depthWrite:false,vertexShader:`varying vec2 vUv;uniform float uRatio;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_PointSize=1.4*uRatio;}`,fragmentShader:`uniform sampler2D uMask;varying vec2 vUv;void main(){float land=texture2D(uMask,vUv).r;vec3 col=mix(vec3(.68,.85,.96),vec3(.90,.97,.94),land);float alpha=(1.-smoothstep(.1,.5,length(gl_PointCoord-.5)))*.38;gl_FragColor=vec4(col,alpha);}`});group.add(new THREE.Points(geometry,material))}

export async function createGrainEarth(group,radius,ratio){
 const response=await fetch('assets/world.json');
 if(!response.ok)throw new Error('地图素材未加载');
 const data=await response.json();
 const mainland=window.topojson.merge(data,data.objects.countries.geometries.filter(g=>String(g.id)!=='010'&&String(g.id)!=='10'));
 const features=[roundLandGeometry(mainland,window.d3.geoArea)];
 const mask=colorTexture(features,true);
 const inner=new THREE.Group();inner.scale.setScalar(radius);
 const material=new THREE.ShaderMaterial({uniforms:{uMap:{value:mask},uMask:{value:mask},uTerrain:{value:mask},uStyle:{value:1}},vertexShader:vertex,fragmentShader:fragment});
 inner.add(new THREE.Mesh(new THREE.SphereGeometry(1,112,80),material));
 addDust(inner,mask,ratio);group.add(inner);
}
