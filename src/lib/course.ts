import data from '../data/course-characters.json';
import koreanA from '../data/course-korean-a.json';
import koreanB from '../data/course-korean-b.json';
import corrections from '../data/course-corrections.json';
import additionalGlyphData from '../../public/sources/course-component-glyphs.json';
import {searchCourseWords} from './hsk';
import type {Word} from './types';

export type CourseNode={type:'leaf';form:string;componentKind?:'unencoded';label?:string;context?:string}|{type:'layout';operator:string;children:CourseNode[]};
export interface CourseCharacter {
 hanzi:string;pinyin:string[];definition:string;korean:string|null;ids:string;tree:CourseNode;
 parts:string[];radicalIds:string[];glyph:string;strokeCount:number;sourceChoice:string;meaningNote?:string;
}
const supplementalKorean={...koreanA,...koreanB} as Record<string,{korean:string;note?:string}>;
const readingCorrections=corrections as Record<string,{pinyin?:string[];addPinyin?:string[];source:string}>;
function applyEditorial(records:Record<string,CourseCharacter>):Record<string,CourseCharacter>{
 return Object.fromEntries(Object.entries(records).map(([form,entry])=>{
  const gloss=supplementalKorean[form],reading=readingCorrections[form];
  return [form,{...entry,...(gloss?{korean:gloss.korean,meaningNote:gloss.note}:{}),...(reading?{pinyin:[...new Set([...(reading.pinyin??entry.pinyin),...(reading.addPinyin??[])])]}:{})}];
 }));
}
export const courseCharacters=applyEditorial(data.characters as unknown as Record<string,CourseCharacter>);
const components=applyEditorial((data as unknown as {components?:Record<string,CourseCharacter>}).components??{});
const glyphs=data.glyphs as Record<string,{src:string;source:string}>;
const opaque=/[①-⑳？?]/u;
export function nodeIds(node:CourseNode):string{return node.type==='leaf'?node.form:node.operator+node.children.map(nodeIds).join('');}
export function getCourseCharacter(form:string):CourseCharacter|undefined{return courseCharacters[form]??components[form];}
export function glyphSrc(form:string):string|undefined{
 const extra=(additionalGlyphData.characters as unknown as Record<string,{availability:string;src?:string}>)[form];
 return glyphs[form]?.src??(extra?.availability==='local'?extra.src:undefined);
}
export function getSpecimenHeadword(url:string):string|undefined{
 if(!url.includes('/xiaozhuan/'))return undefined;
 const hex=url.match(/_([0-9a-f]{4,6})\.svg$/i)?.[1];if(!hex)return undefined;
 const code=parseInt(hex,16);if(code>0x10ffff)return undefined;
 const form=String.fromCodePoint(code);return /^\p{Script=Han}$/u.test(form)?form:undefined;
}
export function getCourseWordCharacters(word:Pick<Word,'hanzi'>):string[]{return [...new Set([...word.hanzi].filter(char=>/\p{Script=Han}/u.test(char)))];}

interface CourseIndex{characters:CourseCharacter[];wordMap:Map<string,Word[]>;combinationMap:Map<string,CourseCharacter[]>}
const indexes=new WeakMap<Word[],CourseIndex>();
function indexCourse(words:Word[]):CourseIndex{
 const cached=indexes.get(words);if(cached)return cached;
 const wordMap=new Map<string,Word[]>();
 for(const word of words)for(const hanzi of getCourseWordCharacters(word)){
  const list=wordMap.get(hanzi);if(list)list.push(word);else wordMap.set(hanzi,[word]);
 }
 const characters=[...wordMap.keys()].map(char=>courseCharacters[char]).filter((char):char is CourseCharacter=>!!char);
 const combinationMap=new Map<string,CourseCharacter[]>();
 for(const char of characters)if(char.tree.type==='layout'&&!opaque.test(char.ids)){
  const list=combinationMap.get(char.ids);if(list)list.push(char);else combinationMap.set(char.ids,[char]);
 }
 const index={characters,wordMap,combinationMap};indexes.set(words,index);return index;
}
export function getCourseCharactersForWords(words:Word[]):CourseCharacter[]{return indexCourse(words).characters;}
export function searchCourseCharacters(characters:CourseCharacter[],query:string):CourseCharacter[]{
 const matched=new Set(searchCourseWords(characters.map(char=>({id:char.hanzi,hanzi:char.hanzi,pinyin:char.pinyin.join(' / '),korean:char.korean??'',level:0,pos:''})),query).map(word=>word.hanzi));
 return characters.filter(char=>matched.has(char.hanzi));
}
export function getWordsForCourseCharacter(hanzi:string,words:Word[]):Word[]{return indexCourse(words).wordMap.get(hanzi)??[];}
export function getRelatedCourseCharacters(hanzi:string,words:Word[],limit=12):CourseCharacter[]{
 const char=getCourseCharacter(hanzi);if(!char)return [];
 const parts=char.parts.filter(part=>!opaque.test(part)&&!['一','丨','丶','丿','乙'].includes(part));
 return indexCourse(words).characters.filter(candidate=>candidate.hanzi!==hanzi)
  .map(candidate=>({candidate,score:candidate.parts.reduce((n,part,i)=>n+(parts.includes(part)?(i>0?3:1):0),0)}))
  .filter(item=>item.score>0).sort((a,b)=>b.score-a.score).slice(0,limit).map(item=>item.candidate);
}
export function matchCourseCombination(operator:string,parts:string[],words:Word[]):CourseCharacter[]{
 const arity=['⿲','⿳'].includes(operator)?3:'⿰⿱⿴⿵⿶⿷⿸⿹⿺⿻'.includes(operator)?2:0;
 if(!arity||parts.length!==arity||parts.some(part=>!part||opaque.test(part)))return [];
 return indexCourse(words).combinationMap.get(operator+parts.join(''))??[];
}
export function getCourseComponentBank(words:Word[]):Array<{ids:string;node:CourseNode;example:string}>{
 const bank=new Map<string,{ids:string;node:CourseNode;example:string}>();
 for(const char of indexCourse(words).characters)if(char.tree.type==='layout')for(const node of char.tree.children){
  const ids=nodeIds(node);if(!opaque.test(ids)&&!bank.has(ids))bank.set(ids,{ids,node,example:char.hanzi});
 }
 return [...bank.values()];
}
