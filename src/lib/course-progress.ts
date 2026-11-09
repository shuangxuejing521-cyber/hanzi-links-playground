import {getCourseCharacter} from './course';

export interface CourseProgress {discovered:string[];favorites:string[];correct:number;scoredRounds:string[]}
const emptyProgress=():CourseProgress=>({discovered:[],favorites:[],correct:0,scoredRounds:[]});
const supportedCharacter=(value:unknown):value is string=>typeof value==='string'&&/^\p{Script=Han}$/u.test(value)&&Boolean(getCourseCharacter(value));
const validRound=(value:unknown):value is string=>typeof value==='string'&&value.trim().length>0&&value.length<=300;
const uniqueCharacters=(value:unknown):string[]=>Array.isArray(value)?[...new Set(value.filter(supportedCharacter))]:[];

export function readCourseProgress(raw:string|null):CourseProgress{
 try{
  const value=JSON.parse(raw??'null');
  if(!value||typeof value!=='object'||Array.isArray(value))return emptyProgress();
  return {
   discovered:uniqueCharacters(value.discovered),favorites:uniqueCharacters(value.favorites),
   correct:Number.isSafeInteger(value.correct)&&value.correct>=0?value.correct:0,
   scoredRounds:Array.isArray(value.scoredRounds)?[...new Set<string>(value.scoredRounds.filter(validRound))]:[]
  };
 }catch{return emptyProgress();}
}

export function discoverCourseCharacter(progress:CourseProgress,hanzi:string):CourseProgress{
 return !supportedCharacter(hanzi)||progress.discovered.includes(hanzi)?progress:{...progress,discovered:[...progress.discovered,hanzi]};
}

export function scoreCourseAnswer(progress:CourseProgress,roundId:string,correct:boolean):CourseProgress{
 return !correct||!validRound(roundId)||progress.scoredRounds.includes(roundId)?progress:{...progress,correct:progress.correct+1,scoredRounds:[...progress.scoredRounds,roundId]};
}

export function favoriteCourseCharacter(progress:CourseProgress,hanzi:string):CourseProgress{
 if(!supportedCharacter(hanzi))return progress;
 return {...progress,favorites:progress.favorites.includes(hanzi)?progress.favorites.filter(form=>form!==hanzi):[...progress.favorites,hanzi]};
}
