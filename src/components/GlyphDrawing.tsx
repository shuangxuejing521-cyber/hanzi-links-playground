import geometryData from '../data/glyph-geometry.json';
interface Geometry {strokes:string[];sides?:number[];medians:number[][][];bounds:number[];extractedFrom?:string}
export const geometry=geometryData as Record<string,Geometry>;
export default function GlyphDrawing({form,colored=false,trace=false,fitted=false,className=''}:{form:string;colored?:boolean;trace?:boolean;fitted?:boolean;className?:string}){
 const g=geometry[form];
 if(!g)return <span className="missing-glyph">{form}<small>字形待补</small></span>;
 const [x,y,w,h]=g.bounds;const view=fitted?`${x} ${y} ${w} ${h}`:'0 0 1024 1024';
 return <svg viewBox={view} className={`glyph-drawing ${className}`} role="img" aria-label={`${form}的真实笔画${colored?'，左右部件分别着色':''}`} data-glyph={form}>
  <g transform="scale(1,-1) translate(0,-900)">{g.strokes.map((d,i)=><path key={i} d={d} fill={colored?(g.sides?.[i]===0?'#dd5369':'#24765e'):'#dd5369'} opacity={trace ? .13 : 1}/>)}</g>
  {trace&&<g transform="scale(1,-1) translate(0,-900)" fill="none" stroke="#dd5369" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round">{g.medians.map((points,i)=><polyline key={i} points={points.map(p=>p.join(',')).join(' ')} className="glyph-trace" style={{animationDelay:`${i*.15}s`}}/>)}</g>}
 </svg>;
}
