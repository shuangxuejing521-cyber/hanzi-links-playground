import teachingRadicals from '../data/radicals.json';
import teachingCharacters from '../data/characters.json';
import {getRadicalCounts} from './radical-index';
import type {Word} from './types';

export interface SidebarFamily {
 id:string;dictionaryId:string;legacyId?:string;form:string;name:string;korean:string;koreanMeaning:string;
 color:string;characters:string[];searchTerms:string[];variants:string[];
}
// Keep the original teaching families intact. In particular, 月(body) means 肉,
// while the moon radical remains a separate group; 仌's teaching form is 冫.
export const TEACHING_DICTIONARY_IDS:Record<string,string>={
 water:'85',person:'9',hand:'64',mouth:'30',wood:'75',speech:'149',heart:'61',woman:'38',thread:'120',
 sun:'72',eye:'109',body:'130',earth:'32',metal:'167',food:'184',animal:'94',ice:'15',fire:'86',rice:'119',
 ritual:'113',clothes:'145',foot:'157',jade:'96',insect:'142',vehicle:'159',stone:'112'
};
const dictionary=getRadicalCounts([]);
const originalByDictionary=new Map(Object.entries(TEACHING_DICTIONARY_IDS).map(([legacy,id])=>[id,legacy]));
const palette=teachingRadicals.map(radical=>radical.color);
const fromDictionary=(id:string,legacyId?:string):SidebarFamily=>{
 const group=dictionary.find(group=>group.id===id)!;
 const original=teachingRadicals.find(root=>root.id===legacyId);
 const characters=[...new Set([...group.characters,...teachingCharacters.filter(char=>char.radical===legacyId).map(char=>char.hanzi)])];
 return {id:legacyId??`dict-${id}`,dictionaryId:id,...(legacyId?{legacyId}:{}),
  form:original?.form??group.form,name:original?.name??group.nameZh,
  korean:original?.korean??group.koreanName,koreanMeaning:group.koreanMeaning,
  color:original?.color??palette[group.number%palette.length],characters,
  variants:[...new Set([group.baseForm,...group.forms])].filter(form=>form!==(original?.form??group.form)),
  searchTerms:[group.baseForm,group.form,group.nameZh,id,...group.forms,...group.searchTerms,...characters,...(legacyId==='ice'?['仌']:[]),...(original?[original.form,original.name,original.korean]:[])]};
};
export const sidebarFamilies:SidebarFamily[]=[
 ...teachingRadicals.map(root=>fromDictionary(TEACHING_DICTIONARY_IDS[root.id],root.id)),
 ...dictionary.filter(group=>!originalByDictionary.has(group.id)).map(group=>fromDictionary(group.id))
];
const membership=new Map<string,string[]>();
for(const family of sidebarFamilies)for(const char of family.characters){
 const ids=membership.get(char);if(ids)ids.push(family.id);else membership.set(char,[family.id]);
}
interface FamilyIndex{words:Map<string,Word[]>;characters:Map<string,Set<string>>}
const indexes=new WeakMap<Word[],FamilyIndex>();
function indexWords(words:Word[]):FamilyIndex{
 const cached=indexes.get(words);if(cached)return cached;
 const result:FamilyIndex={words:new Map(),characters:new Map()};
 for(const word of words){
  const families=new Set<string>();
  for(const char of new Set([...word.hanzi]))for(const id of membership.get(char)??[]){
   families.add(id);let chars=result.characters.get(id);if(!chars){chars=new Set();result.characters.set(id,chars);}chars.add(char);
  }
  for(const id of families){const rows=result.words.get(id);if(rows)rows.push(word);else result.words.set(id,[word]);}
 }
 indexes.set(words,result);return result;
}
export function filterSidebarFamilyWords(words:Word[],id:string):Word[]{return indexWords(words).words.get(id)??[];}
export function getSidebarFamilyCharacters(id:string,words:Word[]):string[]{
 const used=indexWords(words).characters.get(id);
 return used?(sidebarFamilies.find(family=>family.id===id)?.characters.filter(char=>used.has(char))??[]):[];
}
export function getSidebarFamilyCounts(words:Word[]):Array<SidebarFamily&{wordCount:number;characterCount:number}>{
 const index=indexWords(words);
 return sidebarFamilies.map(family=>({...family,wordCount:index.words.get(family.id)?.length??0,characterCount:index.characters.get(family.id)?.size??0}));
}
export function getFamilyExplorationTarget(id:string,words:Word[],eligibleIds:ReadonlySet<string>):{kind:'legacy';characterId:string}|{kind:'course';hanzi:string}|{kind:'empty'}{
 const original=teachingCharacters.find(character=>character.radical===id&&eligibleIds.has(character.id));
 if(original)return {kind:'legacy',characterId:original.id};
 const hanzi=getSidebarFamilyCharacters(id,words)[0];
 return hanzi?{kind:'course',hanzi}:{kind:'empty'};
}
