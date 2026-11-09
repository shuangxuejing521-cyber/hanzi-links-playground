import test from 'node:test';
import assert from 'node:assert/strict';
import {
  characters, radicals, lexicon, parts, combineParts,
  getCharactersForRadical, getCharactersForPart, getCompatibleParts,
  getWordsForCharacter, getWordsForRadical, searchWords,
} from '../src/lib/combine.ts';

test('氵 with 由 and 永 gives distinct real characters, meanings and linked vocabulary', () => {
  const oil = combineParts('氵', '由');
  const swim = combineParts('氵', '永');
  assert.equal(oil.status, 'found');
  assert.equal(swim.status, 'found');
  if (oil.status !== 'found' || swim.status !== 'found') return;
  assert.equal(oil.character.hanzi, '油');
  assert.equal(oil.character.pinyin, 'yóu');
  assert.match(oil.character.korean, /기름/);
  assert.equal(oil.character.scope, 'extension');
  assert.ok(oil.words.some(word => word.hanzi === '加油站'));
  assert.equal(swim.character.hanzi, '泳');
  assert.equal(swim.character.pinyin, 'yǒng');
  assert.ok(swim.words.some(word => word.hanzi === '游泳'));
});

test('an uncollected combination is not declared impossible', () => {
  for (const pair of [['氵', '马'], ['不存在', '青'], ['', '']]) {
    const result = combineParts(...pair as [string, string]);
    assert.equal(result.status, 'not-collected');
    assert.match(result.message, /暂未收录/);
    assert.doesNotMatch(result.message, /不存在|不是汉字/);
  }
  assert.equal(combineParts(' 氵 ', ' 由 ').status, 'found');
});

test('all 2500 source word records survive including homographs and levels', () => {
  assert.equal(lexicon.length, 2500);
  assert.equal(new Set(lexicon.map(word => word.id)).size, 2500);
  assert.deepEqual([1, 2, 3, 4, 5].map(level => lexicon.filter(w => w.level === level).length), [150, 150, 300, 600, 1300]);
  const sourceDuplicates = Object.values(Object.groupBy(lexicon, word => word.hanzi)).filter(rows => rows && rows.length > 1);
  assert.ok(sourceDuplicates.length > 0);
  for (const rows of sourceDuplicates) {
    for (const word of rows!) assert.ok(searchWords(word.hanzi).some(found => found.id === word.id));
  }
});

test('every configured combination has an unambiguous shape and reversible lookup', () => {
  assert.ok(radicals.length >= 20 && radicals.length <= 30);
  assert.ok(characters.length >= 100);
  assert.equal(new Set(characters.map(c => c.hanzi)).size, characters.length);
  assert.equal(new Set(characters.map(c => `${c.firstPart}|${c.secondPart}`)).size, characters.length);
  for (const character of characters) {
    const found = combineParts(character.firstPart, character.secondPart);
    assert.equal(found.status, 'found');
    if (found.status === 'found') assert.equal(found.character.id, character.id);
    assert.equal(character.ids, `⿰${character.firstPart}${character.secondPart}`);
    assert.equal(character.source.verifiedIds, character.ids);
    assert.ok(getCharactersForRadical(character.radical).includes(character));
    assert.ok(getCharactersForPart(character.firstPart).includes(character));
    assert.ok(getCharactersForPart(character.secondPart).includes(character));
    assert.ok(getCompatibleParts(character.firstPart, 'left').some(p => p.form === character.secondPart));
    assert.deepEqual(getWordsForCharacter(character.hanzi).map(w => w.id), character.wordIds);
    for (const word of getWordsForCharacter(character.hanzi)) assert.ok(word.hanzi.includes(character.hanzi));
  }
});

test('the 青 family links across semantic radicals and returns only collected partners', () => {
  const family = getCharactersForPart('青').map(c => c.hanzi);
  for (const character of ['清', '请', '情', '晴', '睛', '精', '猜']) assert.ok(family.includes(character));
  assert.ok(getCompatibleParts('青', 'right').length >= 7);
  for (const part of parts) assert.ok(getCharactersForPart(part.form).length > 0);
  assert.ok(getWordsForRadical('water').some(w => w.hanzi === '游泳'));
  assert.ok(getWordsForRadical('氵').some(w => w.hanzi === '加油站'));
  assert.equal(new Set(getWordsForRadical('water').map(w => w.id)).size, getWordsForRadical('water').length);
});

test('all configured glyphs match independently retained raw structure sources', async () => {
  const { readFile } = await import('node:fs/promises');
  const fixtures = JSON.parse(await readFile(new URL('./fixtures/structure-source-lines.json', import.meta.url), 'utf8'));
  for (const character of characters) {
    const source = fixtures[character.hanzi];
    assert.ok(source, `No independent source for ${character.hanzi}`);
    if (character.source.id === 'makemeahanzi') {
      assert.equal(character.ids, source.makeMeAHanziDecomposition);
    } else {
      const candidates = source.cjkviRawLine.split('\t').slice(2).map((ids: string) => ids.replace(/\[[^\]]+\]/g, ''));
      assert.ok(candidates.includes(character.ids), `${character.hanzi}: ${character.ids} not in raw CJKVI source`);
    }
  }
  assert.equal(combineParts('纟', '柬').status, 'not-collected');
  const practice = combineParts('纟', '𫠣');
  assert.equal(practice.status, 'found');
  if (practice.status === 'found') assert.equal(practice.character.hanzi, '练');
});

test('vocabulary lookup extends beyond combination cards without dropping polyphonic words', () => {
  assert.ok(getWordsForCharacter('学').some(word => word.hanzi === '学校'));
  const oil = characters.find(c => c.hanzi === '油')!;
  assert.deepEqual(getWordsForCharacter(oil.id), getWordsForCharacter('油'));
  assert.ok(getWordsForRadical('thread').some(word => word.hanzi === '继续'));
  assert.ok(getWordsForRadical('thread').some(word => word.hanzi === '紫'));
  const dirty = characters.find(c => c.hanzi === '脏')!;
  assert.equal(dirty.pinyin, 'zāng');
  assert.equal(dirty.example.hanzi, '脏');
  assert.ok(getWordsForCharacter('脏').some(word => word.hanzi === '心脏' && word.pinyin === 'xīnzàng'));
  assert.ok(searchWords('학교', 1).some(word => word.hanzi === '学校'));
  assert.equal(searchWords('不会有的词').length, 0);
});
