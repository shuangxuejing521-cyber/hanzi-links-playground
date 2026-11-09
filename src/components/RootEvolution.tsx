import {useState} from 'react';
import {ArrowRight,ExternalLink} from 'lucide-react';
import {roots} from '../lib/evidence';
import {getPrimaryStages,stageLabel} from '../lib/evolution';
import RootObject from './RootObject';
import GlyphDrawing from './GlyphDrawing';
import {track} from '../analytics/client';
const originLabels:Record<string,string>={pictograph:'상형 근거',ideograph:'지사',compound:'결합 구조','phonetic-carrier':'결합 요소','simplified-shape':'현대 간체',uncertain:'해석 검토 중'};
export default function RootEvolution({radicalId}:{radicalId:string}){
 const [trace,setTrace]=useState(true),[stageIndex,setStageIndex]=useState(0);
 const r=roots.find(r=>r.radicalId===radicalId);if(!r)return null;
 const stages=getPrimaryStages(radicalId),stage=stages[stageIndex]??stages[0];
 return <section className="root-evolution" aria-label={`${r.form}의 모양과 글자 변천`}>
  <div className="evidence-heading"><div><span className="eyebrow">실물 → 옛 글자 → 오늘의 부수</span><h3>{r.baseForm}{r.form!==r.baseForm?` → ${r.form}`:''}<span>{originLabels[r.originKind]??'글자 구조'}</span></h3></div><button className={'trace-toggle '+(trace?'active':'')} aria-pressed={trace} onClick={()=>{track('trace_toggle',{familyId:radicalId,value:trace?'off':'on',source:'toggle'});setTrace(t=>!t);}}>{trace?'윤곽 숨기기':'윤곽 보기'}</button></div>
  {stages.length>0&&<div className="evolution-sequence"><div className="evolution-sequence-heading"><strong>字源演变 · 代表字形</strong><span>눌러서 모양을 비교해요</span></div><div className="evolution-stage-picker" role="group" aria-label={`${r.baseForm}의 옛 글자 선택`} style={{gridTemplateColumns:`repeat(${stages.length},minmax(0,1fr))`}}>{stages.map((s,i)=><button className={'evolution-stage-option '+(stage===s?'active':'')} key={s.stage} aria-label={`${r.baseForm}의 ${stageLabel(s.stage)} 보기`} aria-pressed={stage===s} onClick={()=>{track('stage_select',{familyId:radicalId,value:s.stage,source:'click'});setStageIndex(i);}}><img src={s.src} alt="" loading="lazy"/><span>{stageLabel(s.stage)}</span></button>)}</div></div>}
  <div className="root-evolution-steps"><div className="root-object-step"><span className="step-number">실물 · {r.originKind==='pictograph'?'모양의 단서':'뜻 / 학설의 예시'}</span><img className="root-photo" src={`/images/roots/${r.radicalId}.webp`} alt={`${r.korean} 실물 참고 이미지: ${r.visualCaption}`} loading="lazy"/><small className="photo-note">AI 참고 이미지</small><RootObject key={r.form} kind={r.visualKey} label={r.visualCaption} trace={trace}/></div><ArrowRight className="evolution-arrow" size={19}/><div className="root-glyph-step"><span className="step-number">옛 글자 · {stage?stageLabel(stage.stage):'본자'}</span>{stage?<img className="ancient-script" src={stage.src} alt={`${r.baseForm} ${stageLabel(stage.stage)}: ${stage.provenanceNote}`}/>:<GlyphDrawing form={r.baseForm} trace={trace}/>}<strong>{r.baseForm}</strong>{stage&&<><p className="specimen-provenance">{stage.provenanceNote}</p><a className="ancient-credit" href={stage.galleryUrl} target="_blank" rel="noreferrer">汉典 원자료<ExternalLink size={10}/></a></>}</div><ArrowRight className="evolution-arrow" size={19}/><div className="root-glyph-step"><span className="step-number">오늘 · 본자 / 부수</span>{r.baseForm!==r.form?<div className="modern-form-pair"><GlyphDrawing form={r.baseForm}/><ArrowRight size={14}/><GlyphDrawing form={r.form} fitted/></div>:<GlyphDrawing form={r.form} fitted/>}<strong>{r.baseForm!==r.form?`${r.baseForm} → ${r.form}`:r.form}</strong></div></div>
 </section>;
}
