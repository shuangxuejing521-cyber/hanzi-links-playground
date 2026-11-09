import radicalData from '../data/radicals.json';
import characterData from '../data/characters.json';
import vocabularyData from '../data/lexicon.json';
import indexData from '../data/character-index.json';
import type { Character, Radical, Word, Part, CombinationResult } from './types';

export const radicals: Radical[] = radicalData;
export const characters: Character[] = characterData as Character[];
/** All 2500 source records, including repeated written forms with distinct IDs. */
export const lexicon: Word[] = vocabularyData;

const radicalById = new Map(radicals.map(radical => [radical.id, radical]));
const radicalByForm = new Map(radicals.map(radical => [radical.form, radical]));
const characterById = new Map(characters.map(character => [character.id, character]));
const characterByHanzi = new Map(characters.map(character => [character.hanzi, character]));
const wordById = new Map(lexicon.map(word => [word.id, word]));
const combinationIndex = new Map<string, Character>();
const characterIndex = indexData as Record<string, { wordIds: string[]; radicalIds: string[] }>;
const partIndex = new Map<string, Part>();

function pairKey(first: string, second: string): string {
  return `${first}\u0000${second}`;
}

for (const character of characters) {
  const key = pairKey(character.firstPart, character.secondPart);
  if (combinationIndex.has(key)) throw new Error(`Duplicate configured shape: ${character.ids}`);
  combinationIndex.set(key, character);
  for (const [form, side] of [[character.firstPart, 'left'], [character.secondPart, 'right']] as const) {
    const part = partIndex.get(form) ?? { id: form, form, sides: [], characterIds: [], radicalIds: [] };
    if (!part.sides.includes(side)) part.sides.push(side);
    if (!part.characterIds.includes(character.id)) part.characterIds.push(character.id);
    if (!part.radicalIds.includes(character.radical)) part.radicalIds.push(character.radical);
    partIndex.set(form, part);
  }
}

/** Actual selectable components, derived solely from attested configured pairs. */
export const parts: Part[] = [...partIndex.values()];

export function getRadical(idOrForm: string): Radical | undefined {
  return radicalById.get(idOrForm) ?? radicalByForm.get(idOrForm);
}

export function getCharacter(idOrHanzi: string): Character | undefined {
  return characterById.get(idOrHanzi) ?? characterByHanzi.get(idOrHanzi);
}

export function getCharactersForRadical(idOrForm: string): Character[] {
  const radical = getRadical(idOrForm);
  return radical ? characters.filter(character => character.radical === radical.id) : [];
}

export function getCharactersForPart(part: string): Character[] {
  const form = getRadical(part)?.form ?? part.trim();
  const entry = partIndex.get(form);
  return entry ? entry.characterIds.map(id => characterById.get(id)!) : [];
}

/** side is the selected part's position; the returned parts belong on the other side. */
export function getCompatibleParts(part: string, side: 'left' | 'right' = 'left'): Part[] {
  const form = getRadical(part)?.form ?? part.trim();
  const compatible = new Set(characters
    .filter(character => side === 'left' ? character.firstPart === form : character.secondPart === form)
    .map(character => side === 'left' ? character.secondPart : character.firstPart));
  return parts.filter(candidate => compatible.has(candidate.form));
}

/** Works for every character in the full vocabulary, beyond the 171 combination cards. */
export function getWordsForCharacter(idOrHanzi: string): Word[] {
  const hanzi = getCharacter(idOrHanzi)?.hanzi ?? idOrHanzi;
  const ids = characterIndex[hanzi]?.wordIds;
  return ids ? ids.map(id => wordById.get(id)!).filter(Boolean) : [];
}

/** Full-corpus radical index, with dictionary radical forms normalized to our learning families. */
export function getWordsForRadical(idOrForm: string): Word[] {
  const radical = getRadical(idOrForm);
  if (!radical) return [];
  const ids = new Set(Object.values(characterIndex)
    .filter(entry => entry.radicalIds.includes(radical.id))
    .flatMap(entry => entry.wordIds));
  return lexicon.filter(word => ids.has(word.id));
}

export function combineParts(firstPart: string, secondPart: string): CombinationResult {
  const character = combinationIndex.get(pairKey(firstPart.trim(), secondPart.trim()));
  if (!character) {
    return {
      status: 'not-collected', character: null, words: [],
      message: '这个部件组合暂未收录。可以换一个部件继续探索，或查看已收录的搭配。',
    };
  }
  return {
    status: 'found', character, words: getWordsForCharacter(character.hanzi),
    message: `${character.firstPart} + ${character.secondPart} = ${character.hanzi}`,
  };
}

/** A written form may return multiple records; no homograph is silently merged. */
export function searchWords(query: string, level?: number): Word[] {
  const needle = query.trim().toLocaleLowerCase();
  return lexicon.filter(word => (!level || word.level === level) && (
    !needle || word.hanzi.includes(needle) || word.korean.toLocaleLowerCase().includes(needle) ||
    word.pinyin.toLocaleLowerCase().includes(needle)
  ));
}
