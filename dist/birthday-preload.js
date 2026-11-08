let started=false;
export function preloadBirthday(){
 if(started)return;
 started=true;
 const artwork=document.createElement('link');
 artwork.rel='preload';artwork.as='image';artwork.href='assets/birthday-cake-a-sand-unlit.webp';
 document.head.append(artwork);
 // Warm the destination while the visitor is still exploring memories.
 for(const href of ['birthday.css?v=cake-ready-v1','birthday.js?v=touch-focus-v1']){
  const link=document.createElement('link');link.rel='prefetch';link.href=href;document.head.append(link);
 }
}
