import {useEffect,useState} from 'react';
import {BarChart3} from 'lucide-react';
import type {AdminIdentity} from './contracts';
import './founder-access.css';

/** The link is a convenience; each protected API still authorizes on the server. */
export default function FounderAccess(){
 const [founder,setFounder]=useState(false);
 useEffect(()=>{
  const controller=new AbortController();
  fetch('/api/admin/me',{credentials:'same-origin',cache:'no-store',signal:controller.signal})
   .then(response=>response.ok?response.json() as Promise<AdminIdentity>:null)
   .then(identity=>{if(!controller.signal.aborted)setFounder(identity?.founder===true);})
   .catch(()=>{});
  return()=>controller.abort();
 },[]);
 return founder?<a className="founder-access" href="/admin"><BarChart3 size={16}/><span>统计后台</span></a>:null;
}
