import componentData from '../data/component-evidence.json';
import characterData from '../data/character-evidence.json';
import rootData from '../data/root-evidence.json';
import type {Character} from './types';
export interface EvidenceSource {title:string;url:string;accessed?:string}
export interface ComponentEvidence {form:string;baseForm:string;traditional:string;pinyin:string;korean:string;meaningZh:string;originKind:string;originNote:string;shapeNote:string;visualKey:string;visualCaption:string;confidence:string;sources:EvidenceSource[];contextVariants?:unknown}
export interface CharacterEvidence {hanzi:string;traditional:string;kind:string;semanticParts:string[];phoneticPart:string|null;historicalNote:string;modernNote:string;confidence:string;sources:EvidenceSource[];reviewNote?:string;modernRoles?:Partial<Record<'left'|'right',{label:string;detail:string}>>}
export const componentEvidence=componentData as Record<string,ComponentEvidence>;
export const characterEvidence=characterData as Record<string,CharacterEvidence>;
export const roots=rootData as Array<ComponentEvidence&{radicalId:string}>;
export const kindLabels:Record<string,string>={pictograph:'象形依据',ideograph:'指事',compound:'合体构形','phonetic-carrier':'合体部件','simplified-shape':'现代简化形',uncertain:'释形待考',pictographic:'象形',ideographic:'指事','semantic-compound':'会意或表意合体',phonosemantic:'形声',simplified:'简化后构形'};
export function roleFor(c:Character,side:0|1):{label:string;detail:string}{
 const e=characterEvidence[c.hanzi];const form=side===0?c.firstPart:c.secondPart;
 if(!e)return {label:'现代部件',detail:'仅用于观察现代字形。'};
 const explicit=e.modernRoles?.[side===0?'left':'right'];if(explicit)return explicit;
 const root=roots.find(r=>r.radicalId===c.radical);
 const historical=side===0?root?.baseForm:form;
 const normalized=(s:string)=>s.replace(/（[^）]*）|\([^)]*\)/g,'').replaceAll('糹','糸').replaceAll('⺼','肉').trim();
 const standalone=componentEvidence[form];
 const aliases=[form,historical,standalone?.traditional,form==='录'?'彔':undefined].filter(Boolean).map(f=>normalized(f!));
 const semanticForms=e.semanticParts.flatMap(p=>normalized(p).split(/[，,、/]/));
 const isSemantic=semanticForms.some(p=>aliases.includes(p));
 const isSound=e.phoneticPart&&aliases.includes(normalized(e.phoneticPart));
 if(isSemantic)return {label:'意义线索',detail:`${form}${historical&&historical!==form?`（联系${historical}）`:''}在这个字的构形中联系意义。`};
 if(isSound)return {label:'历史声旁',detail:`${form}主要提示历史读音；声调、声母或韵母在今天可能不同。`};
 if(e.kind==='simplified'||e.confidence==='modern-only')return {label:'简化后字形',detail:'今天认这个形；历史部件与作用请看下方说明，不用它的独立字义拼整字。'};
 return {label:'现代字形部件',detail:'这个位置的历史作用不能只凭外形判断，请结合下方构形依据。'};
}
