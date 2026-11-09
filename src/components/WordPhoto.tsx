import {getWordImage,getPictureWordChain} from '../lib/word-images';
import type {Word} from '../lib/types';
import './word-photo.css';

export default function WordPhoto({word}:{word:Word}){
 const picture=getWordImage(word);if(!picture)return null;
 return <figure className="word-photo" aria-label={`${word.hanzi}의 뜻 그림`}><img src={picture.src} alt={`${word.hanzi} · ${word.korean}. ${picture.caption}`}/><figcaption><strong>{word.hanzi}</strong><span>{picture.caption}</span>{picture.note&&<span lang="ko">{picture.note}</span>}<small>{picture.relation==='example-word'?'뜻의 예시 · ':'현재 뜻 · '}AI 참고 이미지</small></figcaption></figure>;
}
export function PhotoWordChain({character,words,onWord}:{character:string;words:Word[];onWord:(word:Word)=>void}){
 const chain=getPictureWordChain(character,words);if(!chain.length)return null;
 return <div className="photo-word-chain"><small>같은 그림으로 단어 연결</small><div>{chain.slice(0,12).map(word=><button type="button" key={word.id} onClick={()=>onWord(word)} title={`${word.pinyin} · ${word.korean}`}>{word.hanzi}</button>)}</div></div>;
}
