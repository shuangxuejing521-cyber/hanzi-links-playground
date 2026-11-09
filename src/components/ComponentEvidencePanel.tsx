import {ExternalLink,Volume2} from 'lucide-react';
import {componentEvidence,roots,roleFor,type ComponentEvidence} from '../lib/evidence';
import type {Character} from '../lib/types';
import GlyphDrawing from './GlyphDrawing';
import PartGlyph from './PartGlyph';
const labelKo:Record<string,string>={'现代部件':'현대 글자 요소','意义线索':'뜻의 단서','历史声旁':'옛 소리의 단서','简化后字形':'간체 형태','现代字形部件':'현대 글자 요소',pictograph:'상형 근거',ideograph:'지사',compound:'결합 구조','phonetic-carrier':'결합 요소','simplified-shape':'현대 간체',uncertain:'해석 검토 중',pictographic:'상형',ideographic:'지사','semantic-compound':'회의 / 뜻의 결합',phonosemantic:'형성',simplified:'간체 구조'};
function Item({form,c,side,speak}:{form:string;c?:Character;side:0|1;speak:(s:string)=>void}){
 const standalone=componentEvidence[form];if(!standalone)return null;
 const root=c&&side===0?roots.find(r=>r.radicalId===c.radical):undefined;
 const role=c?roleFor(c,side):null;
 const p:ComponentEvidence=root&&role?.label==='意义线索'?root:standalone;
 return <article className="component-evidence-item"><div className="component-evidence-top"><GlyphDrawing form={form} fitted/><div><h4><PartGlyph part={form}/>{p.originKind!=='simplified-shape'&&<button aria-label={`${form} 발음 듣기`} onClick={()=>speak(p.baseForm)}><Volume2 size={14}/></button>}</h4><p>{p.baseForm!==form?`본자 ${p.baseForm} · `:''}{p.pinyin} · <span lang="ko">{p.korean}</span></p><span className={'role-badge '+(side===1?'right':'')}>{labelKo[role?.label??p.originKind]??'독립 요소'}</span></div></div><p className="part-definition"><b>본래 뜻: </b>{p.meaningZh}</p>{role&&<p className="part-in-context"><b>‘{c!.hanzi}’에서의 역할: </b>{role.detail}</p>}<details><summary>유래와 모양 더 보기</summary><p>{p.originNote}</p><p>{p.shapeNote}</p>{p.confidence==='disputed'&&<span className="confidence disputed">해석에 이견 있음</span>}<div className="evidence-links">{p.sources.map((s,i)=><a key={i} href={s.url} target="_blank" rel="noreferrer">{s.title}<ExternalLink size={11}/></a>)}</div></details></article>;
}
export default function ComponentEvidencePanel({first,second,character,speak}:{first:string;second:string;character?:Character;speak:(s:string)=>void}){
 return <section className="component-evidence-panel"><div className="section-heading"><div><h3>部件作用</h3><p>뜻의 단서와 소리의 단서를 구별해요.</p></div></div><div className="component-evidence-grid"><Item form={first} c={character} side={0} speak={speak}/>{second&&<Item form={second} c={character} side={1} speak={speak}/>}</div></section>;
}
