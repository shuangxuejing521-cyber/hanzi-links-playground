import {ArrowRight,Plus} from 'lucide-react';
import type {Character} from '../lib/types';
import GlyphDrawing from './GlyphDrawing';
import PartGlyph from './PartGlyph';
import {roleFor} from '../lib/evidence';
const roleLabels:Record<string,string>={'现代部件':'현대 글자 요소','意义线索':'뜻의 단서','历史声旁':'옛 소리의 단서','简化后字形':'간체 형태','现代字形部件':'현대 글자 요소'};
export default function ConstructionDiagram({character:c,compact=false}:{character:Character;compact?:boolean}){
 if(compact)return <div className="compact-construction" aria-label={`${c.hanzi}: ${c.firstPart}와 ${c.secondPart}의 조합`}><GlyphDrawing form={c.hanzi} colored/><span><PartGlyph part={c.firstPart}/> + <PartGlyph part={c.secondPart}/></span></div>;
 return <div className="construction-diagram" aria-label={`${c.hanzi}의 구성 요소`}><div><GlyphDrawing form={c.firstPart} fitted/><span>{roleLabels[roleFor(c,0).label]??'글자 요소'}</span></div><Plus size={15}/><div><GlyphDrawing form={c.secondPart} fitted/><span>{roleLabels[roleFor(c,1).label]??'글자 요소'}</span></div><ArrowRight size={18}/><div className="whole-construction"><GlyphDrawing form={c.hanzi} colored/><span>완성된 글자 · {c.hanzi}</span></div></div>;
}
