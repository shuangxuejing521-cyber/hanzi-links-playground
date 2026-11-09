import {useEffect,useMemo,useState} from 'react';
import {ChevronLeft,ChevronRight,ExternalLink,Search,X} from 'lucide-react';
import {formatWordLevel,searchCourseWords} from '../lib/hsk';
import {getRadicalCounts,filterRadicalWords,RADICAL_SOURCE_URL,RADICAL_VERSION} from '../lib/radical-index';
import type {Word} from '../lib/types';
import './radical-word-index.css';

interface Props {words:Word[];showKo:boolean;onWord:(word:Word)=>void}
const PAGE_SIZE=20;
export default function RadicalWordIndex({words,showKo,onWord}:Props){
 const [radicalQuery,setRadicalQuery]=useState(''),[wordQuery,setWordQuery]=useState('');
 const [selectedId,setSelectedId]=useState<string|null>(null),[page,setPage]=useState(0);
 const groups=useMemo(()=>getRadicalCounts(words),[words]);
 const selected=groups.find(group=>group.id===selectedId);
 const selectedCharacters=useMemo(()=>new Set(selected?.characters??[]),[selected]);
 const shownGroups=useMemo(()=>{const needle=radicalQuery.trim().toLocaleLowerCase();return needle?groups.filter(group=>[group.form,group.baseForm,group.nameZh,String(group.number),...group.forms,...group.searchTerms].some(s=>s.toLocaleLowerCase().includes(needle))):groups;},[groups,radicalQuery]);
 useEffect(()=>{setRadicalQuery('');setWordQuery('');setPage(0);setSelectedId(id=>groups.some(group=>group.id===id&&group.wordCount>0)?id:null);},[words,groups]);
 const groupedWords=useMemo(()=>selectedId?filterRadicalWords(words,selectedId):words,[words,selectedId]);
 const filtered=useMemo(()=>searchCourseWords(groupedWords,wordQuery),[groupedWords,wordQuery]);
 const totalPages=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE)),currentPage=Math.min(page,totalPages-1);
 const pageWords=filtered.slice(currentPage*PAGE_SIZE,(currentPage+1)*PAGE_SIZE);
 const choose=(id:string|null)=>{setSelectedId(id);setWordQuery('');setPage(0);if(id===null)setRadicalQuery('');};
 const variants=selected?[...new Set([selected.baseForm,...selected.forms])].filter(form=>form!==selected.form):[];
 return <div className="radical-word-index" aria-label="사전 부수별 단어">
  <div className="radical-index-toolbar"><label className="radical-index-search"><Search size={16}/><input aria-label="사전 부수 찾기" placeholder="부수·이름·번호" value={radicalQuery} onChange={e=>setRadicalQuery(e.target.value)}/>{radicalQuery&&<button type="button" aria-label="부수 검색 지우기" onClick={()=>setRadicalQuery('')}><X size={14}/></button>}</label><span title="선택 급수 / 전체 부수">{shownGroups.filter(group=>group.wordCount>0).length} / {groups.length}개 부수</span><button type="button" className={`radical-index-all ${selectedId===null?'selected':''}`} aria-pressed={selectedId===null} onClick={()=>choose(null)}>전체</button></div>
  <div className="dictionary-radical-grid" role="group" aria-label="사전 부수 선택">
   {shownGroups.map(group=><button type="button" key={group.id} className={selectedId===group.id?'selected':''} disabled={group.wordCount===0} aria-pressed={selectedId===group.id} aria-label={`${group.form} ${group.nameZh} ${showKo?group.koreanName:''} · ${group.wordCount.toLocaleString()}개 단어`} title={`${group.number} · ${group.nameZh}`} onClick={()=>choose(group.id)}><small>{group.number}</small><strong>{group.form}</strong>{showKo&&<span className="dictionary-radical-korean" lang="ko">{group.koreanName} · {group.koreanMeaning}</span>}<span>{group.wordCount.toLocaleString()}</span></button>)}
  </div>
  {!shownGroups.length&&<p className="radical-index-empty" role="status">찾는 부수가 없어요.</p>}
  <div className="radical-index-selection"><div>{selected?<><strong className="radical-index-selected-form">{selected.form}</strong><div><h3>{selected.nameZh}<small>#{selected.number}</small></h3>{showKo&&<p className="radical-selected-korean" lang="ko">{selected.koreanName} · {selected.koreanMeaning}</p>}{variants.length>0&&<p className="radical-index-variants" aria-label="부수의 다른 형태">{variants.join(' · ')}</p>}</div></>:<h3>전체 단어</h3>}</div><span role="status"><b>{groupedWords.length.toLocaleString()}</b>개 단어</span></div>
  <div className="radical-index-note"><p>사전 분류이며 자원 풀이가 아니에요. 한 단어가 여러 부수에 나올 수 있어요.</p><a href={RADICAL_SOURCE_URL} target="_blank" rel="noreferrer">Unihan · {RADICAL_VERSION}<ExternalLink size={11}/></a></div>
  <div className="radical-word-filter"><label className="radical-index-search"><Search size={16}/><input aria-label="부수별 단어 찾기" placeholder="한자·병음·한국어" value={wordQuery} onChange={e=>{setWordQuery(e.target.value);setPage(0);}}/>{wordQuery&&<button type="button" aria-label="부수별 단어 검색 지우기" onClick={()=>{setWordQuery('');setPage(0);}}><X size={14}/></button>}</label><span>{filtered.length.toLocaleString()}개</span></div>
  <div className="radical-index-word-list">{pageWords.map(word=><button type="button" key={word.id} className={`radical-index-word-row ${showKo?'':'without-korean'}`} onClick={()=>onWord(word)}><strong>{[...word.hanzi].map((char,i)=>selectedCharacters.has(char)?<mark key={i}>{char}</mark>:char)}</strong><span className="radical-index-pinyin">{word.pinyin}</span>{showKo&&<span lang="ko" className="radical-index-meaning">{word.korean}</span>}<small>{formatWordLevel(word)}</small><ChevronRight size={14}/></button>)}</div>
  {!filtered.length&&<p className="radical-index-empty" role="status">이 범위에 단어가 없어요.</p>}
  <div className="radical-index-pagination"><button type="button" aria-label="이전 부수 단어 페이지" disabled={currentPage===0} onClick={()=>setPage(currentPage-1)}><ChevronLeft size={16}/>이전</button><span aria-live="polite">{currentPage+1} / {totalPages}</span><button type="button" aria-label="다음 부수 단어 페이지" disabled={currentPage>=totalPages-1} onClick={()=>setPage(currentPage+1)}>다음<ChevronRight size={16}/></button></div>
 </div>;
}
