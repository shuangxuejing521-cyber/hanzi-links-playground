import {useEffect,useMemo,useState} from 'react';
import {ArrowRight,Check,ChevronRight,ExternalLink,Heart,RotateCcw,Volume2} from 'lucide-react';
import {getCourseCharacter,nodeIds,glyphSrc,getRelatedCourseCharacters,getWordsForCourseCharacter,getSpecimenHeadword,type CourseNode} from '../lib/course';
import {characters} from '../lib/combine';
import {characterEvidence,componentEvidence,roots,roleFor} from '../lib/evidence';
import {formatWordLevel} from '../lib/hsk';
import type {Word} from '../lib/types';
import LearningPhoto from './LearningPhoto';
import ConstructionDiagram from './ConstructionDiagram';
import './course-character-card.css';
import objectClueData from '../../public/sources/course-objects.json';

interface Props {
 hanzi:string;words:Word[];showKo:boolean;speak:(text:string)=>void;
 onCharacter:(hanzi:string)=>void;onWord:(word:Word)=>void;practice?:boolean;
 saved?:boolean;onFavorite?:()=>void;
}
interface CourseEvolution {
 traditional?:string;sourceUrl:string;availability:string;sourceAnalysis?:string;
 stages:Array<{stage:string;src:string;url:string;provenanceNote:string}>;
}
interface EvolutionManifest {characters:Record<string,CourseEvolution>}
let evolutionPromise:Promise<EvolutionManifest>|null=null;
function loadEvolution(){
 if(!evolutionPromise)evolutionPromise=fetch('/sources/course-evolution.json')
  .then(response=>{if(!response.ok)throw new Error('evolution unavailable');return response.json() as Promise<EvolutionManifest>;})
  .catch(()=>({characters:{}}));
 return evolutionPromise;
}

const layoutLabels:Record<string,string>={
 '⿰':'좌우 구조','⿱':'상하 구조','⿲':'왼쪽·가운데·오른쪽','⿳':'위·가운데·아래',
 '⿴':'전체를 둘러싸는 구조','⿵':'위쪽에서 둘러싸는 구조','⿶':'아래쪽에서 둘러싸는 구조',
 '⿷':'왼쪽에서 둘러싸는 구조','⿸':'왼쪽 위에서 둘러싸는 구조','⿹':'오른쪽 위에서 둘러싸는 구조',
 '⿺':'왼쪽 아래에서 둘러싸는 구조','⿻':'겹친 구조','⿼':'오른쪽에서 둘러싸는 구조',
 '⿽':'오른쪽 아래에서 둘러싸는 구조','⿾':'좌우 반전','⿿':'회전 구조'
};
const roleLabels:Record<string,string>={'现代部件':'현대 글자 요소','意义线索':'뜻의 단서','历史声旁':'옛 소리의 단서','简化后字形':'간체 형태','现代字形部件':'현대 글자 요소'};
const stageName=(value:string)=>value==='说文'?'《说文》 소전':value;
const relatedForm=(item:unknown):string=>typeof item==='string'?item:item&&typeof item==='object'&&'hanzi' in item&&typeof item.hanzi==='string'?item.hanzi:'';
function Glyph({form,className=''}:{form:string;className?:string}){
 const src=glyphSrc(form);
 return src?<img className={`course-real-glyph ${className}`} src={src} alt={`${form}의 실제 글자 모양`} loading="lazy"/>:<span className={`course-font-glyph ${className}`}>{form}</span>;
}
function unencodedLabel(node:Extract<CourseNode,{type:'leaf'}>){
 const part=node as typeof node&{componentKind?:string;label?:string};
 return part.componentKind==='unencoded'||/^[①②③④⑤⑥⑦⑧]$/.test(part.form)?part.label??'미부호 부품':null;
}
function StructureNode({node,onCharacter,depth=0}:{node:CourseNode;onCharacter:(form:string)=>void;depth?:number}){
 if(node.type==='leaf'){
  const label=unencodedLabel(node);
  if(label){const src=node.context?glyphSrc(node.context):undefined;return <div className="course-unencoded-part" role="img" aria-label={label}>{src&&<img className="course-real-glyph" src={src} alt={`${label}의 실제 획 조각`} loading="lazy"/>}<span>{label}</span><small>독립 한자 아님</small></div>;}
  const entry=getCourseCharacter(node.form);
  return <button type="button" className="course-structure-leaf" onClick={()=>onCharacter(node.form)} disabled={!entry} aria-label={`${node.form} 구성 살펴보기`} title={entry?'눌러서 이어서 보기':'구성 요소의 모양'}><Glyph form={node.form}/><span>{node.form}</span></button>;
 }
 const horizontal=['⿰','⿲'].includes(node.operator),vertical=['⿱','⿳'].includes(node.operator);
 const type=horizontal?'horizontal':vertical?'vertical':'enclosed';
 return <div className={`course-structure-node ${type} ${depth?'nested':''}`} aria-label={layoutLabels[node.operator]??'글자 구성'}>
  <span className="course-layout-label">{layoutLabels[node.operator]??node.operator}</span>
  <div className="course-structure-children">{node.children.map((child,i)=><div className="course-structure-child" key={i}>{!horizontal&&!vertical&&<small>{node.operator==='⿻'?`겹친 요소 ${i+1}`:i===0?'바깥 요소':'안쪽 요소'}</small>}<StructureNode node={child} onCharacter={onCharacter} depth={depth+1}/></div>)}</div>
 </div>;
}
function Fragment({node}:{node:CourseNode}){
 if(node.type==='leaf'){const label=unencodedLabel(node);if(label){const src=node.context?glyphSrc(node.context):undefined;return src?<img className="course-real-glyph" src={src} alt={`${label}의 실제 획 조각`} loading="lazy"/>:<span className="course-unencoded-label">{label}</span>;}return <Glyph form={node.form}/>;}
 return <span className={`course-fragment-parts ${['⿱','⿳'].includes(node.operator)?'vertical':''}`} aria-label={layoutLabels[node.operator]??'구성 요소'}>{node.children.map((child,i)=><Fragment key={i} node={child}/>)}</span>;
}

export default function CourseCharacterCard({hanzi,words,showKo,speak,onCharacter,onWord,practice=false,saved=false,onFavorite}:Props){
 const c=getCourseCharacter(hanzi),curated=characters.find(item=>item.hanzi===hanzi);
 const evidence=characterEvidence[hanzi];
 const [evolution,setEvolution]=useState<CourseEvolution|undefined>();
 const [stageIndex,setStageIndex]=useState(0),[slots,setSlots]=useState<Array<string|null>>([]),[feedback,setFeedback]=useState(''),[completed,setCompleted]=useState(false);
 const pieces=useMemo(()=>c?.tree.type==='layout'?c.tree.children:[],[c]);
 const target=useMemo(()=>pieces.map(nodeIds),[pieces]);
 const bank=useMemo(()=>pieces.filter((node,index)=>pieces.findIndex(candidate=>nodeIds(candidate)===nodeIds(node))===index),[pieces]);
 const related=useMemo(()=>getRelatedCourseCharacters(hanzi,words,12),[hanzi,words]);
 const linkedWords=useMemo(()=>getWordsForCourseCharacter(hanzi,words),[hanzi,words]);
 const relatedRoots=useMemo(()=>{
  const leafForms=new Set<string>();
  const visit=(node:CourseNode)=>{if(node.type==='leaf')leafForms.add(node.form);else node.children.forEach(visit);};
  if(c)visit(c.tree);
  return roots.filter(root=>leafForms.has(root.baseForm)||(leafForms.has(root.form)&&(!['body','jade'].includes(root.radicalId)||(curated?.radical===root.radicalId&&roleFor(curated,0).label==='意义线索')))).slice(0,3);
 },[c,curated]);
 useEffect(()=>{setSlots(target.map(()=>null));setFeedback('');setCompleted(false);setStageIndex(0);setEvolution(undefined);let active=true;void loadEvolution().then(data=>{if(active)setEvolution(data.characters[hanzi]);});return()=>{active=false;};},[hanzi,target]);
 if(!c)return <section className="course-character-card"><h2>{hanzi}</h2><p>글자 자료를 확인해 주세요.</p><a href={`https://zdic.net/hans/${encodeURIComponent(hanzi)}`} target="_blank" rel="noreferrer">汉典<ExternalLink size={12}/></a></section>;
 const localStages=evolution?.stages.filter(item=>item.src.startsWith('/'))??[];
 const associatedStages=localStages.filter(item=>{const form=getSpecimenHeadword(item.url);return form&&form!==hanzi&&form!==evolution?.traditional;});
 const stages=localStages.filter(item=>!associatedStages.includes(item)),stage=stages[stageIndex]??stages[0];
 const filled=slots.every(value=>value!==null)&&slots.length>0;
 const pick=(value:string)=>{
  const empty=slots.indexOf(null);if(empty<0)return;
  const next=[...slots];next[empty]=value;setSlots(next);setFeedback('');setCompleted(false);
 };
 const check=()=>{
  if(!filled){setFeedback('빈 칸을 채워 주세요.');return;}
  const correct=slots.every((value,i)=>value===target[i]);
  setCompleted(correct);setFeedback(correct?`완성! ${hanzi} · ${c.pinyin.join(' / ')}`:'순서와 배치를 다시 살펴보세요.');
 };
 const reset=()=>{setSlots(target.map(()=>null));setFeedback('');setCompleted(false);};
 const definition=curated?.meaningZh??c.definition;
 const korean=curated?.korean??c.korean;
 const objectClues=objectClueData as Record<string,{src:string;korean:string;meaningZh:string;captionKo:string;shapeNoteKo:string}>;
 const objectForms=new Set<string>([hanzi]);
 const collectObjects=(node:CourseNode)=>{if(node.type==='leaf')objectForms.add(node.form);else node.children.forEach(collectObjects);};collectObjects(c.tree);
 const usedObjects=[...new Map([...objectForms].filter(form=>objectClues[form]).map(form=>[objectClues[form].src,{form,...objectClues[form]}])).values()].slice(0,3);
 return <section className="course-character-card" aria-label={`${hanzi}의 그림과 구성 학습`}>
  <header className="course-character-heading"><div className="course-character-main-glyph"><Glyph form={hanzi}/></div><div><span className="course-card-kicker">한자 살펴보기</span><h2>{hanzi}{c.pinyin.length>0&&<button type="button" aria-label={`${hanzi} 발음 듣기`} onClick={()=>speak(hanzi)}><Volume2 size={19}/></button>}{onFavorite&&/^\p{Script=Han}$/u.test(hanzi)&&<button type="button" aria-label={saved?'전체 한자 저장 취소':'전체 한자 저장'} aria-pressed={saved} onClick={onFavorite}><Heart size={19} fill={saved?'currentColor':'none'}/></button>}</h2><p className="course-character-pinyin">{c.pinyin.join(' / ')}</p>{showKo&&korean&&<p lang="ko" className="course-character-korean">{korean}</p>}{definition&&(curated||!korean)&&<p className="course-character-definition"><small>{curated?'중국어 뜻':'사전 뜻'}</small>{definition}</p>}{c.meaningNote&&<details className="course-meaning-note"><summary>풀이 참고</summary><p>{c.meaningNote}</p></details>}<span className="course-structure-tag">{c.tree.type==='layout'?(layoutLabels[c.tree.operator]??'결합 구조'):'전체 형태 관찰'}{c.strokeCount>0?` · ${c.strokeCount}획`:''}</span></div></header>

  {usedObjects.length>0&&<section className="course-card-section"><div className="course-section-heading"><h3>실물의 모양 → 부품</h3><span>AI 실물 참고 · 자원 증거와 구분</span></div><div className="course-root-pictures">{usedObjects.map(item=><figure key={item.src}><img src={item.src} alt={item.captionKo} loading="lazy"/><figcaption><strong>{item.form}</strong><span>{showKo?item.korean:item.meaningZh}</span><small>{item.shapeNoteKo}</small></figcaption></figure>)}</div></section>}

  {relatedRoots.length>0&&<section className="course-card-section"><div className="course-section-heading"><h3>부품의 그림 단서</h3><span>부품의 본자와 연결</span></div><div className="course-root-pictures">{relatedRoots.map(root=><figure key={root.radicalId}><img src={`/images/roots/${root.radicalId}.webp`} alt={`${root.baseForm} 부품의 실물 참고: ${root.visualCaption}`} loading="lazy"/><figcaption><strong>{root.baseForm}{root.form!==root.baseForm?` → ${root.form}`:''}</strong><span>{showKo?root.korean:root.meaningZh}</span><small>AI 참고 이미지 · 부품 단서</small></figcaption></figure>)}</div></section>}

  <section className="course-card-section course-evolution"><div className="course-section-heading"><h3>汉典条目关联古字例</h3><span>출전이 있는 참고 자료</span></div>{evolution?.traditional&&evolution.traditional!==hanzi&&<p className="course-traditional-label">원문 병기: {evolution.traditional} · 뜻에 따라 표기가 달라질 수 있어요.</p>}{stages.length>0?<><div className="course-evolution-picker" role="group" aria-label={`${hanzi}의 옛 글자 선택`}>{stages.map((item,i)=><button type="button" key={`${item.stage}-${i}`} className={i===stageIndex?'selected':''} aria-pressed={i===stageIndex} onClick={()=>setStageIndex(i)}><img src={item.src} alt={`汉典 항목의 ${stageName(item.stage)} 참고 글자`} loading="lazy"/><span>{stageName(item.stage)}{getSpecimenHeadword(item.url)&&<small>자료 색인: {getSpecimenHeadword(item.url)}</small>}</span></button>)}</div>{stage&&<div className="course-evolution-specimen"><img src={stage.src} alt={`${stageName(stage.stage)}: ${stage.provenanceNote}`}/><div><strong>{stageName(stage.stage)}</strong>{getSpecimenHeadword(stage.url)&&<p>자료 색인 글자: {getSpecimenHeadword(stage.url)}</p>}<p>{stage.provenanceNote}</p><a href={stage.url||evolution?.sourceUrl} target="_blank" rel="noreferrer">원자료 보기<ExternalLink size={11}/></a></div></div>}<p className="course-structure-note">해당 사전 항목의 참고 자료예요. 같은 글자의 직접 변천으로 단정하지 않아요.</p></>:<p className="course-structure-note">이 카드에는 출전이 확인된 옛 글자 이미지를 싣지 않았어요. 아래 원자료에서 확인할 수 있어요.</p>}{associatedStages.length>0&&<details className="course-associated-specimens"><summary>그 밖의 관련 자료 · 관계 별도 확인 필요 ({associatedStages.length})</summary>{associatedStages.map((item,i)=><p key={i}><a href={item.url} target="_blank" rel="noreferrer">{stageName(item.stage)} · 자료 색인 글자: {getSpecimenHeadword(item.url)}<ExternalLink size={11}/></a></p>)}</details>}<div className="course-source-links"><a href={evolution?.sourceUrl??`https://zdic.net/hans/${encodeURIComponent(hanzi)}`} target="_blank" rel="noreferrer">汉典 · 字源字形<ExternalLink size={11}/></a><a href={`https://humanum.arts.cuhk.edu.hk/Lexis/lexi-mf/search.php?word=${encodeURIComponent(hanzi)}`} target="_blank" rel="noreferrer">香港中文大学 · 字形字義<ExternalLink size={11}/></a><a href="/sources/course-characters-provenance.json" target="_blank" rel="noreferrer">현대 구조 자료<ExternalLink size={11}/></a></div></section>

  <section className="course-card-section course-modern-structure"><div className="course-section-heading"><h3>부품 → 한자</h3><span>오늘의 글자 구조</span></div><div className="course-structure-equation"><StructureNode node={c.tree} onCharacter={onCharacter}/><ArrowRight size={20}/><div className="course-structure-result"><Glyph form={hanzi}/><strong>{hanzi}</strong></div></div><p className="course-structure-note">모양의 구성이에요. 부품의 뜻을 더해 단어 뜻으로 해석하지 않아요.</p>{curated&&<ConstructionDiagram character={curated}/>}</section>

  {pieces.length>1&&<section className={`course-card-section course-composition-practice ${practice?'open-practice':''}`} aria-label={`${hanzi} 부품 조합 연습`}><div className="course-section-heading"><h3>직접 조합하기</h3><button type="button" onClick={reset} aria-label="부품 조합 초기화"><RotateCcw size={14}/>다시</button></div><p>부품을 순서대로 눌러요. 같은 부품은 여러 번 쓸 수 있어요.</p><div className={`course-puzzle-slots ${c.tree.type==='layout'&&['⿱','⿳'].includes(c.tree.operator)?'vertical':''}`} role="group" aria-label="선택한 부품">{slots.map((value,i)=><button type="button" className={value?'filled':''} key={i} aria-label={`${i+1}번 부품 ${value??'빈 칸'}`} onClick={()=>{const next=[...slots];next[i]=null;setSlots(next);setCompleted(false);setFeedback('');}}>{value?<Fragment node={pieces[target.indexOf(value)]??pieces[i]}/>:<span>{i+1}</span>}</button>)}</div><div className="course-puzzle-bank" role="group" aria-label="사용할 부품">{bank.map((node,i)=><button type="button" key={i} aria-label={`부품 ${nodeIds(node)} 넣기`} disabled={filled} onClick={()=>pick(nodeIds(node))}><Fragment node={node}/></button>)}</div><div className="course-puzzle-check"><button type="button" className="course-check-button" onClick={check} disabled={!filled}>{completed?<Check size={16}/>:<ArrowRight size={16}/>}확인</button><span className={completed?'correct':''} role="status">{feedback}</span></div></section>}

  {curated&&<section className="course-card-section course-curated-meaning"><div className="course-section-heading"><h3>현재 뜻의 장면</h3><span>기존 검증 카드</span></div><LearningPhoto character={curated}/></section>}

  {curated&&evidence&&<section className="course-card-section course-attested-origin"><div className="course-section-heading"><h3>부품의 역할과 자원</h3><span>{evidence.confidence==='supported'?'자료 근거 있음':evidence.confidence==='disputed'?'해석에 이견 있음':'현대 형태 확인'}</span></div><div className="course-context-roles">{[curated.firstPart,curated.secondPart].map((form,index)=>{const role=roleFor(curated,index as 0|1),part=componentEvidence[form];return <article key={`${index}-${form}`}><div><Glyph form={form}/><strong>{form}</strong><span>{roleLabels[role.label]??'구성 요소'}</span></div>{part&&<p><b>부품의 본래 뜻: </b>{part.meaningZh}</p>}<p>{role.detail}</p></article>;})}</div><p>{evidence.historicalNote}</p><p>{evidence.modernNote}</p><div className="course-source-links">{evidence.sources.map((source,i)=><a key={i} href={source.url} target="_blank" rel="noreferrer">{source.title}<ExternalLink size={11}/></a>)}</div></section>}

  {related.length>0&&<section className="course-card-section"><div className="course-section-heading"><h3>같은 부품, 다른 한자</h3><span>선택 급수의 한자</span></div><div className="course-related-characters">{related.map(item=>{const form=relatedForm(item),record=getCourseCharacter(form);return <button type="button" key={form} onClick={()=>onCharacter(form)}><Glyph form={form}/><strong>{form}</strong><span>{record?.pinyin.join(' / ')}</span></button>;})}</div></section>}

  <section className="course-card-section"><div className="course-section-heading"><h3>{hanzi} → 단어</h3><span>{linkedWords.length.toLocaleString()}개</span></div><div className="course-linked-words">{linkedWords.slice(0,18).map(word=><button type="button" key={word.id} onClick={()=>onWord(word)}><strong>{word.hanzi}</strong><span>{word.pinyin}</span>{showKo&&<small lang="ko">{word.korean}</small>}<em>{formatWordLevel(word)}</em><ChevronRight size={14}/></button>)}</div>{linkedWords.length>18&&<p className="course-structure-note">같은 한자의 단어가 더 있어요. 단어 목록에서 검색해 보세요.</p>}{linkedWords.length===0&&<p className="course-structure-note">선택한 급수에 이 한자가 들어간 단어가 없어요.</p>}</section>
 </section>;
}

export {StructureNode as CourseStructure,Fragment as CourseFragment};
