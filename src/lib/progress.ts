export interface LearningProgress {discovered:string[];favorites:string[];correct:number;completedRounds:string[]}
export function decodeProgress(raw:string|null,valid:Set<string>):LearningProgress{
 const empty={discovered:[],favorites:[],correct:0,completedRounds:[]};
 try{const d=JSON.parse(raw??'null');if(!d||typeof d!=='object')return empty;
  const ids=(v:unknown)=>Array.isArray(v)?[...new Set(v.filter((x):x is string=>typeof x==='string'&&valid.has(x)))]:[];
  const rounds:string[]=Array.isArray(d.completedRounds)?[...new Set<string>(d.completedRounds.filter((x:unknown):x is string=>typeof x==='string'))].slice(-500):[];
  return {discovered:ids(d.discovered),favorites:ids(d.favorites),correct:Number.isSafeInteger(d.correct)&&d.correct>=0?d.correct:0,completedRounds:rounds};
 }catch{return empty;}
}
export function discoverCharacter(state:LearningProgress,id:string,valid:Set<string>):LearningProgress{
 return !valid.has(id)||state.discovered.includes(id)?state:{...state,discovered:[...state.discovered,id]};
}
export function scoreAnswer(state:LearningProgress,round:string,correct:boolean):LearningProgress{
 return !correct||state.completedRounds.includes(round)?state:{...state,correct:state.correct+1,completedRounds:[...state.completedRounds,round].slice(-500)};
}
