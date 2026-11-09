import {useEffect,useMemo,useState} from 'react';
import {BookOpen,ChevronLeft,ChevronRight,ExternalLink,Grid2X2,RotateCcw,Search,Shuffle,Volume2,X} from 'lucide-react';
import {OFFICIAL_SOURCE_URL,formatWordLevel,searchCourseWords,type CourseSelection} from '../lib/hsk';
import type {Word} from '../lib/types';
import RadicalWordIndex from './RadicalWordIndex';
import './hsk-level-panel.css';

interface Props {
 selection:CourseSelection;
 onSelectionChange:(value:CourseSelection)=>void;
 words:Word[];
 showKo:boolean;
 onWord:(word:Word)=>void;
 speak:(text:string)=>void;
}
const PAGE_SIZE=20;
export default function HskLevelPanel({selection,onSelectionChange,words,showKo,onWord,speak}:Props){
 const [view,setView]=useState<'browse'|'practice'|'radicals'|null>(null);
 const [filter,setFilter]=useState(''),[page,setPage]=useState(0),[cardIndex,setCardIndex]=useState(0),[revealed,setRevealed]=useState(false);
 const scopeKey=`${selection.course}:${selection.level}:${selection.range}`;
 useEffect(()=>{setFilter('');setPage(0);setCardIndex(0);setRevealed(false);},[scopeKey]);
 const filtered=useMemo(()=>searchCourseWords(words,filter),[filter,words]);
 const totalPages=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE));
 const currentPage=Math.min(page,totalPages-1);
 const pageWords=filtered.slice(currentPage*PAGE_SIZE,(currentPage+1)*PAGE_SIZE);
 const safeCardIndex=Math.min(cardIndex,Math.max(0,words.length-1)),card=words[safeCardIndex];
 const chooseCourse=(value:string)=>{
  onSelectionChange(value==='legacy5'?{course:'legacy5',level:5,range:'cumulative'}:{course:'official',level:Number(value),range:selection.range});
 };
 const move=(delta:number)=>{if(!words.length)return;setCardIndex((safeCardIndex+delta+words.length)%words.length);setRevealed(false);};
 const shuffle=()=>{if(!words.length)return;setCardIndex(words.length>1?(safeCardIndex+1+Math.floor(Math.random()*(words.length-1)))%words.length:0);setRevealed(false);};
 const toggle=(next:'browse'|'practice'|'radicals')=>{setView(v=>v===next?null:next);setRevealed(false);};
 return <section className="hsk-level-panel" aria-label="HSK 급수별 학습">
  <div className="hsk-panel-toolbar">
   <label className="hsk-course-label"><strong>HSK 급수</strong><select aria-label="HSK 급수 선택" value={selection.course==='legacy5'?'legacy5':String(selection.level)} onChange={e=>chooseCourse(e.target.value)}>
    <option value="legacy5">기존 5급 · 2,500</option>
    <optgroup label="HSK 3.0 공식 어휘">
     {[1,2,3,4,5,6,7].map(level=><option key={level} value={level}>{level===7?'7–9급':`${level}급`}</option>)}
    </optgroup>
   </select></label>
   <div className="hsk-range" role="group" aria-label="단어 범위">
    <button type="button" disabled={selection.course==='legacy5'} aria-pressed={selection.range==='cumulative'} onClick={()=>onSelectionChange({...selection,range:'cumulative'})}>누적</button>
    <button type="button" disabled={selection.course==='legacy5'} aria-pressed={selection.range==='level'} onClick={()=>onSelectionChange({...selection,range:'level'})}>이 급수만</button>
   </div>
   <span className="hsk-word-count" role="status"><b>{words.length.toLocaleString()}</b>개 단어</span>
   <div className="hsk-view-actions">
    <button type="button" className={view==='browse'?'active':''} aria-expanded={view==='browse'} aria-controls="hsk-word-browser" onClick={()=>toggle('browse')}><BookOpen size={15}/>단어 목록</button>
    <button type="button" className={view==='practice'?'active':''} aria-expanded={view==='practice'} aria-controls="hsk-word-practice" onClick={()=>toggle('practice')}><RotateCcw size={15}/>단어 연습</button>
    <button type="button" className={view==='radicals'?'active':''} aria-expanded={view==='radicals'} aria-controls="hsk-radical-index" onClick={()=>toggle('radicals')}><Grid2X2 size={15}/>부수 찾기</button>
   </div>
  </div>
  <div className="hsk-panel-note"><span>{selection.course==='legacy5'?'기존 HSK 1–5급 누적 어휘':'HSK 3.0 · 7–9급은 통합 어휘'}{selection.course==='official'&&selection.range==='cumulative'?' · 하위 급수 포함':''}</span><a href={selection.course==='official'?OFFICIAL_SOURCE_URL:'https://old.chinesetest.cn/userfiles/file/HSK/HSK-2015.xlsx'} target="_blank" rel="noreferrer">공식 출처<ExternalLink size={11}/></a></div>
  {view==='radicals'&&<div id="hsk-radical-index"><RadicalWordIndex words={words} showKo={showKo} onWord={onWord}/></div>}
  {view==='browse'&&<div id="hsk-word-browser" className="hsk-word-browser">
   <div className="hsk-browser-toolbar"><label className="hsk-list-search"><Search size={16}/><input aria-label="선택 급수 단어 찾기" placeholder="한자·병음·한국어" value={filter} onChange={e=>{setFilter(e.target.value);setPage(0);}}/>{filter&&<button type="button" aria-label="단어 검색 지우기" onClick={()=>{setFilter('');setPage(0);}}><X size={14}/></button>}</label><span>{filtered.length.toLocaleString()}개</span></div>
   <div className="hsk-word-list">{pageWords.map(w=><button type="button" className="hsk-word-row" key={w.id} onClick={()=>onWord(w)}><strong>{w.hanzi}</strong><span className="hsk-row-pinyin">{w.pinyin}</span>{showKo&&<span lang="ko" className="hsk-row-meaning">{w.korean}</span>}<small>{formatWordLevel(w)}</small><ChevronRight size={14}/></button>)}</div>
   {!filtered.length&&<p className="hsk-empty" role="status">검색 결과가 없어요.</p>}
   <div className="hsk-pagination"><button type="button" aria-label="이전 단어 페이지" disabled={currentPage===0} onClick={()=>setPage(currentPage-1)}><ChevronLeft size={16}/>이전</button><span aria-live="polite">{currentPage+1} / {totalPages}</span><button type="button" aria-label="다음 단어 페이지" disabled={currentPage>=totalPages-1} onClick={()=>setPage(currentPage+1)}>다음<ChevronRight size={16}/></button></div>
  </div>}
  {view==='practice'&&<div id="hsk-word-practice" className="hsk-word-practice">
   {card?<><div className="hsk-practice-heading"><span>{safeCardIndex+1} / {words.length.toLocaleString()}</span><small>{formatWordLevel(card)}</small><button type="button" onClick={shuffle} aria-label="무작위 단어"><Shuffle size={15}/>무작위</button></div>
    <div className="hsk-flashcard"><strong className="hsk-practice-hanzi">{card.hanzi}</strong><button type="button" className="hsk-listen" aria-label={`${card.hanzi} 발음 듣기`} onClick={()=>speak(card.hanzi)}><Volume2 size={19}/></button>
     {revealed?<div className="hsk-practice-answer" aria-live="polite"><span>{card.pinyin}</span>{showKo&&<p lang="ko">{card.korean}</p>}<button type="button" className="hsk-detail-link" onClick={()=>onWord(card)}>상세 보기<ExternalLink size={12}/></button></div>:<button type="button" className="hsk-reveal" onClick={()=>setRevealed(true)}>{showKo?'뜻·병음 보기':'병음 보기'}</button>}
    </div><div className="hsk-practice-navigation"><button type="button" disabled={words.length<2} onClick={()=>move(-1)}><ChevronLeft size={16}/>이전 단어</button><button type="button" disabled={words.length<2} onClick={()=>move(1)}>다음 단어<ChevronRight size={16}/></button></div>
   </>:<p className="hsk-empty" role="status">이 범위에 단어가 없어요.</p>}
  </div>}
 </section>;
}
