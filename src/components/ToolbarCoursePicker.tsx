import {useRef} from 'react';
import {ChevronDown} from 'lucide-react';
import type {CourseSelection} from '../lib/hsk';
import './toolbar-course-picker.css';

interface Props{selection:CourseSelection;onChange:(selection:CourseSelection)=>void;wordCount:number;pictureCount:number}
export default function ToolbarCoursePicker({selection,onChange,wordCount,pictureCount}:Props){
 const ref=useRef<HTMLDetailsElement>(null);
 const choose=(next:CourseSelection)=>{onChange(next);if(ref.current)ref.current.open=false;};
 const title=selection.course==='legacy5'?'기존 5급':selection.level===7&&selection.range==='cumulative'?'전체':selection.level===7?'7–9급':`${selection.level}급`;
 return <details className="toolbar-course-picker" ref={ref}><summary aria-label="HSK 급수 범위 설정">HSK · {title}<ChevronDown size={12}/></summary><div className="toolbar-course-popover"><label>HSK 급수<select aria-label="HSK 급수 선택" value={selection.course==='legacy5'?'legacy5':String(selection.level)} onChange={event=>choose(event.target.value==='legacy5'?{course:'legacy5',level:5,range:'cumulative'}:{course:'official',level:Number(event.target.value),range:selection.range})}><option value="legacy5">기존 5급 · 2,500</option><optgroup label="공식 HSK 3.0">{[1,2,3,4,5,6,7].map(level=><option value={level} key={level}>{level===7?'7–9급':`${level}급`}</option>)}</optgroup></select></label><div role="group" aria-label="단어 범위"><button type="button" disabled={selection.course==='legacy5'} aria-pressed={selection.range==='cumulative'} onClick={()=>choose({...selection,range:'cumulative'})}>누적</button><button type="button" disabled={selection.course==='legacy5'} aria-pressed={selection.range==='level'} onClick={()=>choose({...selection,range:'level'})}>이 급수만</button></div><p>{wordCount.toLocaleString()}개 단어 · {pictureCount}개 사진 한자</p></div></details>;
}
