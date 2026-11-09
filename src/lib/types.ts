/** Editorial learning data. Shape hints describe modern glyphs, not word origins. */
export interface Word {
  id: string;
  hanzi: string;
  pinyin: string;
  korean: string;
  level: number;
  pos: string;
}
export interface Radical {
  id: string;
  form: string;
  name: string;
  korean: string;
  meaningHint: string;
  contrast: string;
  sceneKey: string;
  color: string;
}
export interface Character {
  id: string;
  hanzi: string;
  pinyin: string;
  meaningZh: string;
  korean: string;
  radical: string;
  otherPart: string;
  firstPart: string;
  secondPart: string;
  structure: 'left-right';
  ids: string;
  shapeNarrative: string;
  example: { hanzi: string; pinyin: string; korean: string };
  wordIds: string[];
  scope: 'hsk' | 'extension';
  inHskVocabulary: boolean;
  sceneKey: string;
  source: { id: string; url: string; verifiedIds: string };
}
export interface Part {
  id: string;
  form: string;
  /** One shape may appear on either side in different configured characters. */
  sides: Array<'left' | 'right'>;
  characterIds: string[];
  radicalIds: string[];
}
export type CombinationResult =
  | { status: 'found'; character: Character; words: Word[]; message: string }
  | { status: 'not-collected'; character: null; words: []; message: string };
