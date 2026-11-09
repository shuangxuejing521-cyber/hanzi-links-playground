import {useEffect,useState} from 'react';
import {ArrowLeft} from 'lucide-react';
import {getCourseWordCharacters,getCourseCharacter} from '../lib/course';
import type {Word} from '../lib/types';
import CourseCharacterCard from './CourseCharacterCard';
import './word-learning-panel.css';

interface Props{word:Word;words:Word[];showKo:boolean;speak:(text:string)=>void;onWord:(word:Word)=>void;onLearn:(hanzi:string)=>void;onFavorite:(hanzi:string)=>void;favorites:string[]}
export default function WordLearningPanel({word,words,showKo,speak,onWord,onLearn,onFavorite,favorites}:Props){
 const chars=getCourseWordCharacters(word);
 const [selected,setSelected]=useState(chars[0]??'');
 useEffect(()=>{const first=getCourseWordCharacters(word)[0]??'';setSelected(first);if(first)onLearn(first);},[word.id,onLearn]);
 const choose=(hanzi:string)=>{setSelected(hanzi);onLearn(hanzi);};
 const outside=!chars.includes(selected);
 return <div className="word-learning-panel">
  <div className="word-learning-tabs" role="group" aria-label="단어 속 한자 선택">{chars.map(char=><button type="button" key={char} className={char===selected?'selected':''} aria-pressed={char===selected} onClick={()=>choose(char)}>{char}<small>구성 보기</small></button>)}</div>
  {outside&&<button type="button" className="word-learning-back" onClick={()=>setSelected(chars[0])}><ArrowLeft size={14}/>{word.hanzi}의 한자로 돌아가기</button>}
  {selected&&getCourseCharacter(selected)&&<CourseCharacterCard key={selected} hanzi={selected} words={words} showKo={showKo} speak={speak} onCharacter={choose} onWord={onWord} saved={favorites.includes(selected)} onFavorite={()=>onFavorite(selected)}/>}
 </div>;
}
