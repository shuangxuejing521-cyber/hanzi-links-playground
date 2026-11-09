import type {Character} from '../lib/types';
import manifestData from '../data/image-manifest.json';
const images=manifestData as Record<string,{src:string;caption:string;alt:string}>;
/** Concrete modern uses; the historical role is explained separately in the evidence panel. */
export const hasLearningPhoto=(hanzi:string)=>Boolean(images[hanzi]);
export default function LearningPhoto({character:c,compact=false,quiz=false}:{character:Character;compact?:boolean;quiz?:boolean}){
 const picture=images[c.hanzi];if(!picture)return null;
 return <figure className={`learning-photo ${compact?'compact':''}`}><img src={picture.src} alt={quiz?`${c.korean} 장면`:picture.alt} loading="lazy"/>{!compact&&<figcaption>{picture.caption}<small>AI 참고 이미지 · 현재 뜻</small></figcaption>}</figure>;
}
