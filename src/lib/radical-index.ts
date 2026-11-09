import data from '../data/dictionary-radicals.json';
import teachingRoots from '../data/root-evidence.json';
import koreanData from '../data/radical-korean.json';
import type {Word} from './types';

export interface DictionaryRadical {
 id:string;
 number:number;
 form:string;
 baseForm:string;
 nameZh:string;
 forms:string[];
 characters:string[];
 searchTerms:string[];
 koreanName:string;
 koreanMeaning:string;
}
export const RADICAL_SOURCE_URL='https://www.unicode.org/reports/tr38/tr38-41.html#kRSUnicode';
export const RADICAL_VERSION=data.version;
// Existing source-audited teaching forms are search aliases, not extra Unihan assignments.
const koreanLabels=koreanData as Record<string,{name:string;meaning:string;aliases?:string[]}>;
const groups:DictionaryRadical[]=data.groups.map(group=>{
 const label=koreanLabels[group.id];
 const terms=[label?.name??'',label?.meaning??'',...(label?.aliases??[])];
 return {...group,koreanName:label?.name??'',koreanMeaning:label?.meaning??'',searchTerms:[
  ...terms,...terms.map(term=>term.replace(/\s/g,'')),...teachingRoots
   .filter(root=>root.baseForm===group.baseForm)
   .flatMap(root=>[root.form,root.korean])
 ]};
});
const characterRadicals=data.characterRadicals as Record<string,string[]>;
const cache=new WeakMap<Word[],Map<string,Word[]>>();

function indexWords(words:Word[]):Map<string,Word[]>{
 const cached=cache.get(words);
 if(cached)return cached;
 const index=new Map<string,Word[]>();
 for(const word of words){
  // Multiple characters and multiple dictionary assignments may lead to the same group.
  // Count the official entry once in each group; retain distinct homograph entries.
  const ids=new Set([...word.hanzi].flatMap(char=>characterRadicals[char]??[]));
  for(const id of ids){
   const list=index.get(id);
   if(list)list.push(word);else index.set(id,[word]);
  }
 }
 cache.set(words,index);
 return index;
}

export function getRadicalCounts(words:Word[]):Array<DictionaryRadical&{wordCount:number}>{
 const index=indexWords(words);
 return groups.map(group=>({...group,wordCount:index.get(group.id)?.length??0}));
}

export function filterRadicalWords(words:Word[],id:string):Word[]{
 return indexWords(words).get(id)??[];
}
