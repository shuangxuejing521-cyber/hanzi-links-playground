import {ArrowRight} from 'lucide-react';
import type {Character} from '../lib/types';
import {characterEvidence} from '../lib/evidence';
import GlyphDrawing,{geometry} from './GlyphDrawing';
/** These are readable regular-script comparisons, not dated ancient inscriptions. */
export default function HistoricalComparison({character:c}:{character:Character}){
 const e=characterEvidence[c.hanzi];if(!e)return null;
 const sound=e.phoneticPart?.replace(/（[^）]*）|\([^)]*\)/g,'').trim()??'';
 const soundDifferent=[...sound].length===1&&sound!==c.secondPart&&geometry[sound];
 if(e.traditional===c.hanzi&&!soundDifferent)return null;
 return <div className="historical-comparison" aria-label={`${c.hanzi}的历史构形字形对照`}>
  <div className="historical-glyphs">{soundDifferent&&<figure><GlyphDrawing form={sound}/><figcaption>历史声旁 · {sound}</figcaption></figure>}{e.traditional!==c.hanzi&&geometry[e.traditional]&&<><figure><GlyphDrawing form={e.traditional}/><figcaption>传统字形 · {e.traditional}</figcaption></figure><ArrowRight size={17}/></>}<figure><GlyphDrawing form={c.hanzi} colored/><figcaption>现代字形 · {c.hanzi}</figcaption></figure></div>
  <p>用楷书轮廓比较构形来源与现代写法；古文字原图请查看下方字库链接。</p>
 </div>;
}
