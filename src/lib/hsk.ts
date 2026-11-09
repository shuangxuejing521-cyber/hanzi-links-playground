import officialData from '../data/hsk-official.json';
import {characters,lexicon} from './combine';
import type {Character,Word} from './types';

export interface CourseSelection {course:'legacy5'|'official';level:number;range:'cumulative'|'level'}
export interface OfficialWord extends Word {officialIndex:number;sourcePage:number;definitionSource:string;displayHanzi?:string;senseNumber?:number;levelRaw?:string}
export const DEFAULT_SELECTION:CourseSelection={course:'legacy5',level:5,range:'cumulative'};
export const OFFICIAL_SOURCE_URL='https://hsk.cn-bj.ufileos.com/3.0/%E6%96%B0%E7%89%88HSK%E8%80%83%E8%AF%95%E5%A4%A7%E7%BA%B21219.pdf';
export const officialVocabulary=officialData as OfficialWord[];
const officialIds=new Set(officialVocabulary.map(w=>w.id));
export const cumulativeCounts=[300,500,1000,2000,3600,5400,11000] as const;
export function courseWords(selection:CourseSelection):Word[]{
 if(selection.course==='legacy5')return lexicon;
 return officialVocabulary.filter(w=>selection.range==='cumulative'?w.level<=selection.level:w.level===selection.level);
}
export function isOfficialWord(word:Word):word is OfficialWord{return officialIds.has(word.id);}
export function formatWordLevel(word:Word):string{
 return isOfficialWord(word)?`HSK 3.0 ${word.level===7?'7–9':word.level}급`:word.level>0?`기존 HSK ${word.level}급`:'추가 단어';
}
export function courseLabel(selection:CourseSelection):string{
 return selection.course==='legacy5'?'기존 5급 · 누적':`HSK 3.0 ${selection.level===7?'7–9':selection.level}급 · ${selection.range==='cumulative'?'누적':'이 급수만'}`;
}
const normalize=(text:string)=>text.toLocaleLowerCase().replace(/ɑ/g,'a').replace(/ɡ/g,'g').normalize('NFD').replace(/u\u0308/g,'v').replace(/\p{M}/gu,'').replace(/[\s'’·-]/g,'');
export function searchCourseWords(words:Word[],query:string):Word[]{
 const needle=query.trim().toLocaleLowerCase();if(!needle)return words;
 const roman=normalize(needle);
 return words.filter(w=>w.hanzi.includes(needle)||w.korean.toLocaleLowerCase().includes(needle)||w.pinyin.toLocaleLowerCase().includes(needle)||(roman&&normalize(w.pinyin).includes(roman)));
}
export function getEligibleCharacters(selection:CourseSelection,words=courseWords(selection)):Character[]{
 if(selection.course==='legacy5')return characters;
 const forms=new Set(words.flatMap(w=>Array.from(w.hanzi)));
 return characters.filter(c=>forms.has(c.hanzi));
}
export function getScopedWordsForCharacter(words:Word[],hanzi:string):Word[]{return words.filter(w=>w.hanzi.includes(hanzi));}
