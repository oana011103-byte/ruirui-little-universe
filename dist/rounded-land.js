// Simplify the joined coastline before rounding it, so country borders cannot
// turn into gaps. Longitude unwrapping keeps dateline crossings continuous.
function unwrap(ring){
 const points=[];
 for(const [longitude,latitude] of ring.slice(0,-1)){
  let x=longitude;
  if(points.length){const previous=points[points.length-1][0];while(x-previous>180)x-=360;while(x-previous< -180)x+=360;}
  points.push([x,latitude]);
 }
 return points;
}
function distanceToSegment(p,a,b){
 const dx=b[0]-a[0],dy=b[1]-a[1],length=dx*dx+dy*dy;
 const t=length?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/length)):0;
 return (p[0]-a[0]-t*dx)**2+(p[1]-a[1]-t*dy)**2;
}
function simplify(points,tolerance){
 if(points.length<=2)return points;
 let furthest=0,index=0;
 for(let i=1;i<points.length-1;i++){const d=distanceToSegment(points[i],points[0],points[points.length-1]);if(d>furthest){furthest=d;index=i;}}
 if(furthest<=tolerance*tolerance)return [points[0],points[points.length-1]];
 return [...simplify(points.slice(0,index+1),tolerance).slice(0,-1),...simplify(points.slice(index),tolerance)];
}
function roundedRing(ring){
 const points=unwrap(ring);
 if(points.length<3)return null;
 let opposite=1,furthest=0;
 for(let i=1;i<points.length;i++){const d=(points[i][0]-points[0][0])**2+(points[i][1]-points[0][1])**2;if(d>furthest){furthest=d;opposite=i;}}
 const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
 const span=Math.sqrt((Math.max(...xs)-Math.min(...xs))*(Math.max(...ys)-Math.min(...ys)));
 const tolerance=Math.min(3.0,Math.max(.4,span*.18));
 let rounded=[...simplify(points.slice(0,opposite+1),tolerance).slice(0,-1),...simplify([...points.slice(opposite),points[0]],tolerance).slice(0,-1)];
 if(rounded.length<3)rounded=points;
 // Four passes of corner cutting give clean, continuous, rounded capes.
 for(let pass=0;pass<4;pass++){
  const next=[];
  for(let i=0;i<rounded.length;i++){const a=rounded[i],b=rounded[(i+1)%rounded.length];next.push([a[0]*.7+b[0]*.3,a[1]*.7+b[1]*.3],[a[0]*.3+b[0]*.7,a[1]*.3+b[1]*.7]);}
  rounded=next;
 }
 const normalized=rounded.map(([x,y])=>[((x+540)%360)-180,y]);
 return [...normalized,[...normalized[0]]];
}
export function roundLandGeometry(land,geoArea){
 const coordinates=[];
 for(const polygon of land.coordinates){
  // Keep recognizable land masses; omit tiny islands and interior lake detail.
  if(geoArea({type:'Polygon',coordinates:polygon})<.00018)continue;
  const ring=roundedRing(polygon[0]);
  if(ring){
   // A very narrow simplified island must not become the globe's complement.
   if(geoArea({type:'Polygon',coordinates:[ring]})>Math.PI*2)ring.reverse();
   coordinates.push([ring]);
  }
 }
 return {type:'MultiPolygon',coordinates};
}
