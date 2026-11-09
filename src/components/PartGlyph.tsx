import {characters} from '../lib/combine';
import GlyphDrawing from './GlyphDrawing';
export default function PartGlyph({part,className=''}:{part:string;className?:string}){
 const rare=[...part].some(c=>c.codePointAt(0)!>0xffff);
 const sample=rare?characters.find(c=>c.secondPart===part||c.firstPart===part):undefined;
 if(sample){const right=sample.secondPart===part;return <span className={`part-crop ${right?'crop-right':'crop-left'} ${className}`} role="img" aria-label={`${sample.hanzi}的${right?'右':'左'}部`}><GlyphDrawing form={part} fitted/></span>;}
 return <span className={`part-glyph ${className}`}>{part}</span>;
}
