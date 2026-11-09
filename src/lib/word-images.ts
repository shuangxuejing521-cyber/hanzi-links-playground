import linksData from '../data/word-image-links.json';
import type {Word} from './types';

export interface WordImage{character:string;src:string;caption:string;relation:'same-meaning'|'example-word';note?:string}
const links=linksData as Record<string,WordImage>;
export function getWordImage(word:Pick<Word,'id'>):WordImage|undefined{return links[word.id];}
/** Only reviewed near-synonyms/examples share a scene; spelling alone is not evidence. */
export function getPictureWordChain(character:string,words:Word[]):Word[]{
 return words.filter(word=>links[word.id]?.character===character);
}
