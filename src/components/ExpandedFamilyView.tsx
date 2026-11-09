import {useEffect,useMemo,useState,type CSSProperties} from 'react';
import {ArrowLeft,ChevronLeft,ChevronRight,Link2,Volume2} from 'lucide-react';
import {getCourseCharacter,glyphSrc} from '../lib/course';
import {getSidebarFamilyCharacters,filterSidebarFamilyWords,type SidebarFamily} from '../lib/sidebar-families';
import type {Word} from '../lib/types';
import CourseCharacterCard from './CourseCharacterCard';
import './expanded-family-view.css';

interface CardsProps {
 family:SidebarFamily;words:Word[];showKo:boolean;
 onCharacter:(hanzi:string)=>void;exclude?:string[];
}
interface Props extends Omit<CardsProps,'exclude'> {
 selectedHanzi:string|null;speak:(text:string)=>void;
 onWord:(word:Word)=>void;onReturn?:()=>void;
}
const CHARACTER_PAGE_SIZE=24;
const WORD_PAGE_SIZE=8;

function ModernGlyph({form,decorative=false}:{form:string;decorative?:boolean}){
 const src=glyphSrc(form);
 return src?<img className="expanded-modern-glyph" src={src} alt={decorative?'':`${form}现代字形`} loading="lazy"/>:<span className="expanded-font-glyph" aria-hidden={decorative||undefined}>{form}</span>;
}

function Pagination({page,pages,count,pageSize,onPage,kind}:{page:number;pages:number;count:number;pageSize:number;onPage:(page:number)=>void;kind:'汉字'|'词语'}){
 const first=count?page*pageSize+1:0,last=Math.min((page+1)*pageSize,count);
 return <div className="expanded-family-pagination" aria-label={`${kind}分页`}>
  <button type="button" aria-label={`上一页${kind}`} disabled={page===0} onClick={()=>onPage(page-1)}><ChevronLeft size={14}/><span>上一页</span></button>
  <span aria-live="polite">{first}–{last} / {count}<small>{page+1} / {pages}</small></span>
  <button type="button" aria-label={`下一页${kind}`} disabled={page>=pages-1} onClick={()=>onPage(page+1)}><span>下一页</span><ChevronRight size={14}/></button>
 </div>;
}

function FamilyCards({family,words,showKo,onCharacter,exclude=[],selectedHanzi=null}:{selectedHanzi?:string|null}&CardsProps){
 const [page,setPage]=useState(0);
 const all=useMemo(()=>getSidebarFamilyCharacters(family.id,words).filter(hanzi=>Boolean(getCourseCharacter(hanzi))),[family.id,words]);
 const excluded=new Set(exclude),excludeKey=exclude.join('\u0000');
 const characters=all.filter(hanzi=>!excluded.has(hanzi));
 const pages=Math.max(1,Math.ceil(characters.length/CHARACTER_PAGE_SIZE));
 const safePage=Math.min(page,pages-1);
 useEffect(()=>{setPage(0);},[family.id,words,excludeKey]);
 if(!characters.length)return null;
 return <section className="family-cards expanded-family-cards" aria-label={`${family.form}部首汉字`}>
  <div className="section-heading"><div><h3>{exclude.length?'更多同部首汉字':'同部首汉字'}</h3><p>{family.form} · 仅显示当前词表范围的汉字</p></div><span className="tiny-badge">{characters.length.toLocaleString()} 字</span></div>
  <div className="character-grid">{characters.slice(safePage*CHARACTER_PAGE_SIZE,(safePage+1)*CHARACTER_PAGE_SIZE).map(hanzi=>{
   const entry=getCourseCharacter(hanzi)!;
   return <button type="button" key={hanzi} data-hanzi={hanzi} className={`character-card expanded-family-card${selectedHanzi===hanzi?' active':''}`} aria-label={`${hanzi} 살펴보기`} aria-pressed={selectedHanzi===hanzi} onClick={()=>onCharacter(hanzi)}>
    <div className="expanded-family-glyph"><ModernGlyph form={hanzi} decorative/></div>
    <div className="expanded-family-card-label"><strong>{hanzi}</strong><span>{entry.pinyin.join(' / ')}</span></div>
    {showKo&&entry.korean&&<small lang="ko" title={entry.korean}>{entry.korean}</small>}
   </button>;
  })}</div>
  <Pagination page={safePage} pages={pages} count={characters.length} pageSize={CHARACTER_PAGE_SIZE} onPage={setPage} kind="汉字"/>
  <p className="expanded-family-classification-note">辞书部首分类用于查字，不等于字中的构字角色；字源请查看各字卡的来源说明。</p>
 </section>;
}

export function ExtendedFamilyCards(props:CardsProps){return <FamilyCards {...props}/>;}

export default function ExpandedFamilyView({family,words,selectedHanzi,showKo,speak,onCharacter,onWord,onReturn}:Props){
 const pool=useMemo(()=>getSidebarFamilyCharacters(family.id,words).filter(hanzi=>Boolean(getCourseCharacter(hanzi))),[family.id,words]);
 const selected=selectedHanzi&&pool.includes(selectedHanzi)?selectedHanzi:pool[0]??null;
 const entry=selected?getCourseCharacter(selected):undefined;
 const familyWords=useMemo(()=>filterSidebarFamilyWords(words,family.id),[family.id,words]);
 const relatedWords=useMemo(()=>selected?familyWords.filter(word=>word.hanzi.includes(selected)):[],[selected,familyWords]);
 const [wordPage,setWordPage]=useState(0);
 const wordPages=Math.max(1,Math.ceil(relatedWords.length/WORD_PAGE_SIZE));
 const safeWordPage=Math.min(wordPage,wordPages-1);
 useEffect(()=>{setWordPage(0);},[family.id,selected,words]);
 return <>
  <div className="center-column expanded-family-center">
   <section className="family-intro expanded-family-intro" style={{'--family-color':family.color} as CSSProperties}>
    <div><h2><b>{family.form}</b>{family.name}<span>部首分类</span></h2>
     {showKo&&<p lang="ko">{family.korean}{family.koreanMeaning&&` · ${family.koreanMeaning}`}</p>}
     <p>辞书部首分类帮助查字，构字角色请以字卡中的资料为准。</p>
     <p className="expanded-family-scope">当前范围：{pool.length.toLocaleString()} 字 · {familyWords.length.toLocaleString()} 个词条</p>
     {onReturn&&<button type="button" className="expanded-family-return" onClick={onReturn}><ArrowLeft size={14}/>返回字族学习</button>}
    </div>
    <div className="expanded-family-intro-glyph" aria-hidden="true"><ModernGlyph form={family.form} decorative/></div>
   </section>
   {selected?<CourseCharacterCard key={selected} hanzi={selected} words={words} showKo={showKo} speak={speak} onCharacter={onCharacter} onWord={onWord}/>:<section className="expanded-family-empty"><h3>当前范围暂无汉字</h3><p>换一个级别或部首分类继续查看。</p></section>}
   <FamilyCards key={family.id} family={family} words={words} showKo={showKo} onCharacter={onCharacter} selectedHanzi={selected}/>
  </div>
  <aside className="connection-panel expanded-family-connections" aria-label="关联字与词">
   <div className="connection-title"><span><Link2 size={17}/></span><div><h2>相关词语</h2></div></div>
   {selected&&entry&&<div className="connection-current"><span><ModernGlyph form={selected} decorative/></span><div><strong>{entry.pinyin.join(' / ')}</strong>{showKo&&entry.korean&&<small lang="ko">{entry.korean}</small>}</div><button type="button" className="icon-button" aria-label={`${selected} 듣기`} onClick={()=>speak(selected)}><Volume2 size={16}/></button></div>}
   <div className="connection-branch"><span className="branch-label">{selected?`${selected} · 当前范围的相关词条`:'选择汉字后查看词语'}</span>
    {relatedWords.slice(safeWordPage*WORD_PAGE_SIZE,(safeWordPage+1)*WORD_PAGE_SIZE).map(word=><button type="button" className="linked-word" key={word.id} onClick={()=>onWord(word)}><div><strong>{word.hanzi}</strong><em>{word.pinyin}</em>{showKo&&<small lang="ko">{word.korean}</small>}</div><ChevronRight size={15}/></button>)}
    {!relatedWords.length&&<p className="expanded-family-empty-copy">当前范围没有该字的相关词条。</p>}
   </div>
   {relatedWords.length>0&&<Pagination page={safeWordPage} pages={wordPages} count={relatedWords.length} pageSize={WORD_PAGE_SIZE} onPage={setWordPage} kind="词语"/>}
  </aside>
 </>;
}
