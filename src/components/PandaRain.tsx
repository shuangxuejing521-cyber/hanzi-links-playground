import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {X} from 'lucide-react';
import './panda-rain.css';
import {track} from '../analytics/client';

// Original eight 3D sprites and sizes from the user's later culture-course artifact.
const PANDA_KINDS=['ring','cherry','frog','bamboo','duck','tube','sleep','wave'] as const;
const PANDA_IMAGES=PANDA_KINDS.map(kind=>`/illustrations/pandas/pd-${kind}.webp`);
const PANDA='/illustrations/pandas/pd-wave.webp';
interface Panda {el:HTMLButtonElement;size:number;x:number;y:number;vx:number;vy:number;rotation:number;spin:number;flip:number;state:'fall'|'sit'|'out';time:number;hold:number;bounces:number}
interface RainControls {rain:()=>void;stop:(restoreFocus?:boolean)=>void}
export default function PandaRain(){
 const overlay=useRef<HTMLDivElement>(null),host=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null),controls=useRef<RainControls|null>(null);
 const [active,setActive]=useState(false),[reduced,setReduced]=useState(false);
 useEffect(()=>{
  const layer=host.current;if(!layer)return;
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  let items:Panda[]=[],frame=0,last=0,pending=0,disposed=false;
  let bag:string[]=[],autoPlayed=false,autoScheduled=false,loaded=document.readyState==='complete';
  // Warm the small sprite files before the first wave without delaying the page.
  for(const src of PANDA_IMAGES){const img=new Image();img.decoding='async';img.src=src;}
  const pick=()=>{
   if(!bag.length){
    bag=PANDA_IMAGES.slice();
    for(let i=bag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}
   }
   return bag.pop()!;
  };
  const timers=new Set<ReturnType<typeof setTimeout>>();
  const later=(fn:()=>void,ms:number)=>{const timer=setTimeout(()=>{timers.delete(timer);if(!disposed)fn();},ms);timers.add(timer);};
  const stop=(restoreFocus=false)=>{
   const focused=overlay.current?.contains(document.activeElement);
   cancelAnimationFrame(frame);frame=0;
   timers.forEach(clearTimeout);timers.clear();autoScheduled=false;pending=0;items=[];layer.replaceChildren();
   if(!disposed)setActive(false);
   if(restoreFocus||focused)trigger.current?.focus({preventScroll:true});
  };
  const heart=(x:number,y:number)=>{
   const el=document.createElement('span');el.className='panda-rain-heart';el.textContent='♥';el.setAttribute('aria-hidden','true');el.style.left=`${x}px`;el.style.top=`${Math.max(10,y)}px`;layer.append(el);later(()=>el.remove(),950);
  };
  const kick=(p:Panda)=>{
   track('panda_interaction',{value:'kick',source:'panda'});
   p.state='fall';p.vy=-(520+Math.random()*260);p.vx=(Math.random()-.5)*260;p.spin=(Math.random()<.5?-1:1)*720;p.time=0;p.bounces=0;
   p.el.classList.remove('panda-munch');p.el.style.opacity='1';heart(p.x+p.size/2,p.y);
  };
  const spawn=(index:number)=>{
   const width=innerWidth,size=Math.round((width<600?34:42)+Math.random()*(width<600?18:26));
   const el=document.createElement('button');el.type='button';el.className='panda-drop';el.setAttribute('aria-label',`${index+1}번 판다와 놀기`);el.title='누르면 폴짝!';el.style.width=el.style.height=`${size}px`;
   const img=document.createElement('img');img.src=pick();img.alt='';img.draggable=false;el.append(img);
   const p:Panda={el,size,x:Math.random()*Math.max(0,width-size),y:-size-Math.random()*120,vx:(Math.random()-.5)*120,vy:Math.random()*80,rotation:Math.random()*360,spin:(Math.random()-.5)*540,flip:Math.random()<.5?-1:1,state:'fall',time:0,hold:1.6+Math.random()*1.6,bounces:0};
   el.addEventListener('pointerdown',e=>{e.preventDefault();kick(p);});
   el.addEventListener('click',e=>{if(e.detail===0)kick(p);});
   layer.append(el);items.push(p);
  };
  const step=(now:number)=>{
   if(disposed||document.hidden){stop();return;}
   const dt=Math.min(.033,(now-last)/1000||0);last=now;
   // Keep pandas above the fixed learning navigation on small screens.
   const floor=Math.max(100,innerHeight-(innerWidth<=760?82:8)),width=innerWidth;
   items=items.filter(p=>{
    if(p.state==='fall'){
     p.vy+=1500*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rotation+=p.spin*dt;
     if(p.x<0){p.x=0;p.vx=Math.abs(p.vx)*.6;}
     if(p.x>Math.max(0,width-p.size)){p.x=Math.max(0,width-p.size);p.vx=-Math.abs(p.vx)*.6;}
     if(p.y+p.size>=floor&&p.vy>0){p.y=floor-p.size;p.bounces++;if(p.bounces<3&&p.vy>220){p.vy*=-.42;p.vx*=.6;p.spin*=.5;}else{p.vy=0;p.vx=0;p.state='sit';p.time=0;p.el.classList.add('panda-munch');}}
    }else if(p.state==='sit'){
     p.time+=dt;const k=Math.min(1,p.time*6);p.rotation=p.rotation*(1-k)+Math.round(p.rotation/360)*360*k;
     p.y=Math.min(p.y,floor-p.size);p.x=Math.max(0,Math.min(p.x,width-p.size));
     if(p.el===document.activeElement)p.time=0;
     if(p.time>p.hold){p.state='out';p.el.tabIndex=-1;p.el.style.pointerEvents='none';p.el.style.opacity='0';p.time=0;}
    }else{p.time+=dt;if(p.time>.65){p.el.remove();return false;}}
    p.el.style.transform=`translate(${p.x}px,${p.y}px) rotate(${p.rotation}deg) scaleX(${p.flip})`;return true;
   });
   if(items.length||pending)frame=requestAnimationFrame(step);else stop();
  };
  const rain=()=>{
   if(disposed||preference.matches||document.hidden)return;
   autoPlayed=true;stop();setActive(true);pending=innerWidth<600?14:24;
   for(let i=0,count=pending;i<count;i++)later(()=>{pending--;spawn(i);},i*90+Math.random()*120);
   last=performance.now();frame=requestAnimationFrame(step);
  };
  const dismiss=(restoreFocus=false)=>{autoPlayed=true;stop(restoreFocus);};
  controls.current={rain,stop:dismiss};
  // A hidden preview must still play once when the student first opens it.
  const firstRain=()=>{
   if(disposed||autoPlayed||autoScheduled||!loaded||preference.matches||document.hidden)return;
   autoScheduled=true;later(()=>{autoScheduled=false;if(!autoPlayed)rain();},500);
  };
  const onLoad=()=>{loaded=true;firstRain();};
  const onPreference=()=>{setReduced(preference.matches);if(preference.matches)stop();else firstRain();};
  const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape')dismiss();};
  const onVisibility=()=>{if(document.hidden)stop();else firstRain();};
  onPreference();preference.addEventListener('change',onPreference);document.addEventListener('keydown',onKey);document.addEventListener('visibilitychange',onVisibility);
  if(loaded)firstRain();else window.addEventListener('load',onLoad,{once:true});
  return()=>{disposed=true;stop();controls.current=null;preference.removeEventListener('change',onPreference);document.removeEventListener('keydown',onKey);document.removeEventListener('visibilitychange',onVisibility);window.removeEventListener('load',onLoad);};
 },[]);
 return <><button ref={trigger} className={`panda-rain-trigger ${active?'is-raining':''}`} hidden={reduced} onClick={()=>{track('panda_interaction',{value:'start',source:'panda'});controls.current?.rain();}} aria-label="판다 비 시작" title="누르면 판다가 내려와요"><img src={PANDA} alt=""/><span>판다 비</span></button>{createPortal(<div ref={overlay} className="panda-rain-overlay"><div ref={host} className="panda-rain-particles" role="group" aria-label="판다 비 놀이"/>{active&&<div className="panda-rain-controls"><span lang="ko">판다를 누르면 폴짝! ♥<small>Esc로 닫기</small></span><button type="button" onClick={()=>{track('panda_interaction',{value:'stop',source:'panda'});controls.current?.stop(true);}} aria-label="판다 비 종료" title="판다 비 종료 (Esc)"><X size={18}/></button></div>}</div>,document.body)}</>;
}
