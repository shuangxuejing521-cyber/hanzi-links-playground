import {useEffect,useMemo,useState} from 'react';
import {ArrowLeft,ArrowRight,ChevronLeft,ChevronRight,Heart,Search,Trophy} from 'lucide-react';
import {getCourseCharacter,glyphSrc} from '../lib/course';
import type {CourseProgress} from '../lib/course-progress';
import type {Character,Word} from '../lib/types';
import CourseCharacterCard from './CourseCharacterCard';
import './course-connections.css';

interface Props {
 progress:CourseProgress;legacyCharacters:Character[];words:Word[];showKo:boolean;
 speak:(text:string)=>void;onWord:(word:Word)=>void;onLearn:(hanzi:string)=>void;onFavorite:(hanzi:string)=>void;
 legacyScore?:number;
}
const PAGE_SIZE=24;
const normalize=(value:string)=>value.toLocaleLowerCase().normalize('NFD').replace(/u\u0308/g,'v').replace(/\p{M}/gu,'').replace(/\s/g,'');
export default function CourseConnections({progress,legacyCharacters,words,showKo,speak,onWord,onLearn,onFavorite,legacyScore=0}:Props){
 const [view,setView]=useState<'learned'|'favorites'>('learned'),[query,setQuery]=useState(''),[page,setPage]=useState(0),[selected,setSelected]=useState<string|null>(null);
 const learned=useMemo(()=>[...new Set([...legacyCharacters.map(character=>character.hanzi),...progress.discovered])].filter(hanzi=>Boolean(getCourseCharacter(hanzi))),[legacyCharacters,progress.discovered]);
 const favorites=useMemo(()=>progress.favorites.filter(hanzi=>Boolean(getCourseCharacter(hanzi))),[progress.favorites]);
 const source=view==='learned'?learned:favorites;
 const filtered=useMemo(()=>{const needle=normalize(query.trim());return needle?source.filter(hanzi=>{const c=getCourseCharacter(hanzi)!;return [hanzi,c.korean??'',...c.pinyin].some(value=>normalize(value).includes(needle));}):source;},[source,query]);
 const pages=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE)),safePage=Math.min(page,pages-1);
 useEffect(()=>{setPage(0);},[query,view]);
 const open=(hanzi:string)=>{if(!getCourseCharacter(hanzi))return;setSelected(hanzi);onLearn(hanzi);};
 return <section className="course-connections" aria-label="모든 급수의 학습 기록">
  <header className="course-connections-heading"><div><h2>내 연결</h2><p>이 브라우저에 저장돼요.</p></div><div className="course-connections-score"><Trophy size={20}/><strong>{progress.correct+legacyScore}</strong><span>누적 정답</span></div></header>
  {selected?<><div className="course-connections-detail-toolbar"><button type="button" onClick={()=>setSelected(null)}><ArrowLeft size={15}/>기록으로 돌아가기</button><button type="button" className={progress.favorites.includes(selected)?'saved':''} aria-pressed={progress.favorites.includes(selected)} aria-label={`${selected} ${progress.favorites.includes(selected)?'저장 취소':'저장'}`} onClick={()=>onFavorite(selected)}><Heart size={17} fill={progress.favorites.includes(selected)?'currentColor':'none'}/>{progress.favorites.includes(selected)?'저장됨':'저장'}</button></div><CourseCharacterCard key={selected} hanzi={selected} words={words} showKo={showKo} speak={speak} onCharacter={open} onWord={onWord}/></>:<>
   <div className="course-connections-tabs" role="group" aria-label="기록 종류"><button type="button" className={view==='learned'?'selected':''} aria-pressed={view==='learned'} onClick={()=>setView('learned')}>학습한 한자 <b>{learned.length.toLocaleString()}</b></button><button type="button" className={view==='favorites'?'selected':''} aria-pressed={view==='favorites'} onClick={()=>setView('favorites')}><Heart size={14}/>저장한 한자 <b>{favorites.length.toLocaleString()}</b></button></div>
   <label className="course-connections-search"><Search size={15}/><input aria-label="내 연결 한자 찾기" placeholder="한자·병음·한국어" value={query} onChange={event=>setQuery(event.target.value)}/></label>
   {filtered.length?<><div className="course-connections-grid">{filtered.slice(safePage*PAGE_SIZE,(safePage+1)*PAGE_SIZE).map(hanzi=>{const c=getCourseCharacter(hanzi)!,src=glyphSrc(hanzi),saved=progress.favorites.includes(hanzi);return <article key={hanzi}><button type="button" className="course-connection-open" aria-label={`${hanzi} 학습 이어가기`} onClick={()=>open(hanzi)}>{src?<img src={src} alt={`${hanzi}의 실제 글자 모양`} loading="lazy"/>:<span className="course-connection-font-glyph">{hanzi}</span>}<strong>{hanzi}</strong><span>{c.pinyin.join(' / ')}</span>{showKo&&c.korean&&<small lang="ko">{c.korean}</small>}<em>이어서 보기<ArrowRight size={12}/></em></button><button type="button" className={`course-connection-save ${saved?'saved':''}`} aria-label={`${hanzi} ${saved?'저장 취소':'저장'}`} aria-pressed={saved} onClick={()=>onFavorite(hanzi)}><Heart size={16} fill={saved?'currentColor':'none'}/></button></article>;})}</div><div className="course-connections-pagination"><button type="button" aria-label="이전 기록 페이지" disabled={safePage===0} onClick={()=>setPage(safePage-1)}><ChevronLeft size={15}/>이전</button><span>{safePage+1} / {pages}</span><button type="button" aria-label="다음 기록 페이지" disabled={safePage===pages-1} onClick={()=>setPage(safePage+1)}>다음<ChevronRight size={15}/></button></div></>:<div className="course-connections-empty"><Heart size={27}/><h3>{query?'찾는 한자가 없어요.':view==='favorites'?'아직 저장한 한자가 없어요.':'아직 학습한 한자가 없어요.'}</h3><p>{view==='favorites'?'한자 카드의 하트를 눌러 저장하세요.':'급수를 고르고 한자 구성을 살펴보세요.'}</p></div>}
  </>}
 </section>;
}
