import {getSpecimenHeadword} from './course';
import recoveryData from '../../public/sources/course-evolution-display-overrides.json';

export interface CharacterEvolutionStage {
 stage:string;title?:string;src:string;url:string;galleryUrl?:string;provenanceNote:string;
 storage?:string;sha256?:string|null;form?:string;
}
export interface CharacterEvolutionRecord {
 form:string;sourceUrl:string;checked:string;availability:string;traditional?:string;
 sourceAnalysis?:string;
 sourceExplanation?:{kind:string;text:string;indexForm:string;title:string;sourceUrl:string;attribution:string;association:string;note:string};
 stages:CharacterEvolutionStage[];
}
export interface CharacterEvolutionManifest {characters:Record<string,CharacterEvolutionRecord>}

/** A dictionary's related small-seal headword is not automatically this character. */
export function partitionEvolutionStages(hanzi:string,entry:CharacterEvolutionRecord){
 const primary:CharacterEvolutionStage[]=[],associated:CharacterEvolutionStage[]=[],remote:CharacterEvolutionStage[]=[];
 const recoveries=recoveryData.overrides as Record<string,{displaySrc:string;sha256:string;sourceUrl:string}>;
 for(const original of entry.stages){
  const recovery=recoveries[original.url];
  const stage=recovery&&recovery.sourceUrl===original.url?{...original,src:recovery.displaySrc,sha256:recovery.sha256}:original;
  if(!/^\/images\/course-evolution\/[A-Za-z0-9_.-]+\.(?:svg|png)$/.test(stage.src)){remote.push(stage);continue;}
  const headword=getSpecimenHeadword(stage.url);
  if(headword&&headword!==hanzi&&headword!==entry.traditional)associated.push(stage);
  else primary.push(stage);
 }
 return {primary,associated,remote};
}

let request:Promise<CharacterEvolutionManifest>|null=null;
export function loadCharacterEvolution():Promise<CharacterEvolutionManifest>{
 if(!request)request=fetch('/sources/course-evolution.json').then(async response=>{
  if(!response.ok)throw new Error('Character source unavailable');
  const data=await response.json() as CharacterEvolutionManifest;
  if(!data.characters||typeof data.characters!=='object')throw new Error('Character source unavailable');
  return data;
 }).catch(error=>{request=null;throw error;});
 return request;
}
