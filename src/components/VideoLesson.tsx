import {useState} from 'react';
import {ArrowRight,Play,ExternalLink,Check} from 'lucide-react';
import MeaningIllustration from './MeaningIllustration';
import ThreadMorph from './ThreadMorph';
import LearningPhoto from './LearningPhoto';
import {getCharacter} from '../lib/combine';
const steps=[
 {scene:'thread',title:'先看见一根线',ko:'실의 모양부터 살펴봐요',form:'糸 → 纟',text:'실타래와 糸의 모양을 비교해요. 纟는 오늘날의 간체 부수예요.',words:['丝线','纟','线']},
 {scene:'red-thread',title:'给丝线染上颜色',ko:'실에 색을 입혀요',form:'纟 ＋ 工 → 红',text:'붉은 실로 红을 기억해요. 纟는 뜻, 工은 소리의 단서예요. ‘빨간 공장’ 이야기는 암기용 연상이에요.',words:['红','红色','绿','紫']},
 {scene:'connect',title:'关联词语',ko:'연결해서 단어를 늘려요',form:'线 → 联系 → 关系',text:'사람을 잇는 실을 떠올리며 联系·关系·介绍를 연결해요. 뜻의 연상이며, 모든 글자에 纟가 들어가는 건 아니에요.',words:['联系','关系','介绍','继续']},
 {scene:'knot',title:'结字与词语',ko:'매듭을 짓고 계속해요',form:'纟 ＋ 吉 → 结',text:'매듭으로 结을 기억하고 结婚·结束로 이어 가요. 联系 liánxì와 练习 liànxí의 발음도 비교해요.',words:['结','结婚','结束','练习']}
];
export default function VideoLesson({onExplore,onWord}:{onExplore:()=>void;onWord:(s:string)=>void}){
 const [step,setStep]=useState(0);const s=steps[step];
 return <section className="video-lesson"><div className="lesson-heading"><span className="pill"><Play size={12}/>视频启发课</span><h2>丝线示范</h2><p>그림 → 글자 요소 → 연결된 단어</p></div><div className="lesson-layout"><div className="lesson-picture">{step===0?<ThreadMorph/>:step===1?<LearningPhoto character={getCharacter('红')!}/>:step===3?<LearningPhoto character={getCharacter('结')!}/>:<MeaningIllustration kind={s.scene} label={s.ko}/>}<span className="illustration-credit">그림으로 기억해요</span></div><div className="lesson-copy"><div className="lesson-steps">{steps.map((_,i)=><button key={i} onClick={()=>setStep(i)} className={i===step?'active':i<step?'done':''} aria-label={`${i+1}단계 보기`} aria-current={i===step?'step':undefined}>{i<step?<Check size={15}/>:`0${i+1}`}</button>)}</div><h3>{s.title}</h3><p lang="ko" className="korean-subtitle">{s.ko}</p><div className="lesson-form">{s.form}</div><p lang="ko">{s.text}</p><div className="lesson-word-links">{s.words.map(w=><button key={w} onClick={()=>onWord(w)}>{w}<ArrowRight size={12}/></button>)}</div><button className="primary-button" onClick={()=>step<3?setStep(step+1):onExplore()}>{step<3?'다음 단계':'纟 글자 탐색'}<ArrowRight size={15}/></button></div></div><div className="lesson-source"><span>참고 영상의 학습법을 새 그림으로 구성했어요.</span><a href="https://www.youtube.com/watch?v=0S1oUNGhEjs&t=137s" target="_blank" rel="noreferrer">원본 영상 02:17 <ExternalLink size={12}/></a></div></section>;
}
