import {useEffect,useState} from 'react';
import {ExternalLink,Volume2} from 'lucide-react';
import {getCourseCharacter,getCourseWordCharacters,getSpecimenHeadword,glyphSrc} from '../lib/course';
import {characterEvidence,componentEvidence} from '../lib/evidence';
import supplementData from '../data/character-origin-supplements.json';
import {loadCharacterEvolution,partitionEvolutionStages,type CharacterEvolutionRecord} from '../lib/character-evolution';
import type {Word} from '../lib/types';

const stageLabel=(stage:string)=>stage==='说文'?'《说文》小篆':stage==='楷书'?'楷书 · 现代':stage;

function SourceImage({src,alt,lazy=false}:{src:string;alt:string;lazy?:boolean}){
 const [failed,setFailed]=useState(false);
 useEffect(()=>setFailed(false),[src]);
 return failed?<span className="character-image-unavailable" role="status">此字形暂未加载<small>请查看原资料</small></span>:<img src={src} alt={alt} loading={lazy?'lazy':undefined} onError={()=>setFailed(true)}/>;
}

export function CharacterEvolutionContent({hanzi,entry}:{hanzi:string;entry:CharacterEvolutionRecord}){
 const [selected,setSelected]=useState(0);
 const {primary,associated,remote}=partitionEvolutionStages(hanzi,entry);
 const active=primary[selected]??primary[0];
 const course=getCourseCharacter(hanzi),modern=glyphSrc(hanzi),evidence=characterEvidence[hanzi];
 const supplement=(supplementData.characters as Record<string,{text:string;sources:Array<{title:string;url:string}>}>)[hanzi];
 const component=hanzi==='由'?componentEvidence[hanzi]:undefined;
 const historical=primary.filter(stage=>stage.stage!=='楷书');
 return <div className="character-evolution-content">
  <div className="character-origin-summary">
   <h4>{hanzi} · 字源字形</h4>
   {entry.traditional&&entry.traditional!==hanzi&&<p>汉典并列字形：{entry.traditional}<small lang="ko">뜻에 따라 번체 표기가 달라질 수 있어요.</small></p>}
   {entry.sourceAnalysis?<p><b>汉典条目说明：</b>{entry.sourceAnalysis}</p>:entry.sourceExplanation?<div><p><b>{entry.sourceExplanation.kind==='shuowen-original'?'汉典条目转录《说文》':entry.sourceExplanation.title} · 索引字 {entry.sourceExplanation.indexForm}：</b>{entry.sourceExplanation.text}</p><small>{entry.sourceExplanation.attribution}{entry.sourceExplanation.association==='dictionary-cross-reference'?' · 条目关联引文，不能直接作为本字各义项的来源解释。':''}</small><a href={entry.sourceExplanation.sourceUrl} target="_blank" rel="noreferrer">{entry.sourceExplanation.title}<ExternalLink size={12}/></a></div>:supplement||evidence?.historicalNote||component?.originNote?<div><p><b>字源资料补充：</b>{supplement?.text??evidence?.historicalNote??component?.originNote}</p>{(supplement?.sources??evidence?.sources??component?.sources??[]).map(source=><a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.title}<ExternalLink size={12}/></a>)}</div>:<p>本站尚未收录经核实释形。<small lang="ko">확인된 자원 풀이가 없어요. 원자료에서 확인해 주세요.</small></p>}
  </div>
  {primary.length>0&&<><div className="character-stage-picker" role="group" aria-label={`${hanzi} 字形阶段`}>{primary.map((stage,index)=><button type="button" key={`${stage.stage}-${stage.url}`} className={active===stage?'selected':''} aria-pressed={active===stage} onClick={()=>setSelected(index)}><SourceImage src={stage.src} alt={`汉典条目所列${stageLabel(stage.stage)}字形`} lazy/><span>{stageLabel(stage.stage)}</span></button>)}</div>{active&&<figure className="character-stage-detail"><SourceImage src={active.src} alt={`${stageLabel(active.stage)}：${active.provenanceNote}`}/><figcaption><strong>{stageLabel(active.stage)}</strong>{getSpecimenHeadword(active.url)&&<p>资料索引字：{getSpecimenHeadword(active.url)}</p>}<p>{active.provenanceNote}</p><a href={active.galleryUrl??active.url} target="_blank" rel="noreferrer">字形原资料<ExternalLink size={12}/></a></figcaption></figure>}</>}
  {historical.length===0&&<p className="character-origin-note">此条目未收录可展示的古字形。<small lang="ko">확인된 옛 글자 이미지가 없어요. 현대 글자를 옛 글자로 대신 표시하지 않아요.</small></p>}
  <p className="character-origin-note">仅展示汉典条目所列阶段；未列出的阶段不补画。古字例可能涉及繁体、异体或相关字，不能仅据并列认定为直接演变关系。</p>
  {associated.length>0&&<details className="character-associated"><summary>相关字例 · 关系需另核 ({associated.length})</summary>{associated.map(stage=><figure key={`${stage.stage}-${stage.url}`}><SourceImage src={stage.src} alt={`${stageLabel(stage.stage)}相关字例：${getSpecimenHeadword(stage.url)}`} lazy/><figcaption><strong>{stageLabel(stage.stage)} · 索引字 {getSpecimenHeadword(stage.url)}</strong><p>{stage.provenanceNote}</p><a href={stage.galleryUrl??stage.url} target="_blank" rel="noreferrer">原站查看<ExternalLink size={12}/></a></figcaption></figure>)}</details>}
  {remote.length>0&&<details className="character-associated"><summary>仅原站可查看的字形 ({remote.length})</summary>{remote.map(stage=><p key={`${stage.stage}-${stage.url}`}><a href={stage.galleryUrl??stage.url} target="_blank" rel="noreferrer">{stageLabel(stage.stage)} · 原站查看<ExternalLink size={12}/></a></p>)}</details>}
  <div className="character-modern-form">{modern?<SourceImage src={modern} alt={`${hanzi}现代字形`} lazy/>:<span>{hanzi}</span>}<div><strong>现代字形 · {hanzi}</strong>{course?.ids&&<p>{course.ids}</p>}<small>今日字形结构，与古文字材料分别展示。</small></div></div>
  <div className="character-origin-sources"><a href={`${entry.sourceUrl}#zyzx`} target="_blank" rel="noreferrer">汉典 · 字源字形<ExternalLink size={12}/></a><a href="https://zdic.net/terms/" target="_blank" rel="noreferrer">来源条款 · CC0<ExternalLink size={12}/></a><small>来源页核对：{entry.checked}</small></div>
 </div>;
}

export function CharacterEvolution({hanzi}:{hanzi:string}){
 const [entry,setEntry]=useState<CharacterEvolutionRecord>(),[status,setStatus]=useState<'loading'|'ready'|'error'>('loading'),[attempt,setAttempt]=useState(0);
 useEffect(()=>{let active=true;setStatus('loading');setEntry(undefined);void loadCharacterEvolution().then(data=>{if(active){const record=data.characters[hanzi];setEntry(record);setStatus(record?'ready':'error');}}).catch(()=>{if(active)setStatus('error');});return()=>{active=false;};},[hanzi,attempt]);
 if(status==='loading')return <p className="character-origin-note" role="status">正在加载 {hanzi} 的字源字形……</p>;
 if(status==='error'||!entry)return <p className="character-origin-note" role="status">字源资料暂时未能加载。<button type="button" onClick={()=>setAttempt(value=>value+1)}>重试</button><a href={`https://zdic.net/hans/${encodeURIComponent(hanzi)}#zyzx`} target="_blank" rel="noreferrer">汉典原资料<ExternalLink size={12}/></a></p>;
 return <CharacterEvolutionContent key={hanzi} hanzi={hanzi} entry={entry}/>;
}

export default function WordCharacterOrigins({word,selected,onSelect,speak}:{word:Word;selected:string|null;onSelect:(hanzi:string)=>void;speak:(text:string)=>void}){
 const forms=getCourseWordCharacters(word);
 return <section className="word-character-origins" aria-label="字源字形"><h3>字源字形 <small lang="ko">단어 속 한자를 눌러 옛 글자와 출처를 확인해요.</small></h3><div className="word-character-links">{forms.map(form=><button type="button" key={form} aria-pressed={selected===form} onClick={()=>onSelect(form)}>{form}<small>字源字形</small></button>)}</div>{selected&&<><button type="button" className="character-origin-audio" aria-label={`${selected} 字音`} onClick={()=>speak(selected)}><Volume2 size={14}/>{getCourseCharacter(selected)?.pinyin.join(' / ')??selected}</button><CharacterEvolution key={selected} hanzi={selected}/></>}</section>;
}
