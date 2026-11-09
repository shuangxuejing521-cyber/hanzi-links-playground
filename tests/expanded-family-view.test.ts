import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {officialVocabulary} from '../src/lib/hsk.ts';
import {sidebarFamilies,getSidebarFamilyCharacters} from '../src/lib/sidebar-families.ts';

// Node renders actual TSX while CSS remains a browser concern.
const require=createRequire(import.meta.url);
require.extensions['.css']=()=>{};
function views(){
 try{return require('../src/components/ExpandedFamilyView.tsx');}
 catch(error){assert.fail(`The expanded family view must render current-scope learning data: ${String(error)}`);}
}
const noop=()=>{};

test('an expanded dictionary family opens a scoped character lesson and its related words',()=>{
 const {default:View}=views();
 const family=sidebarFamilies.find(family=>family.dictionaryId==='40')!;
 const word=officialVocabulary.find(word=>word.hanzi==='安全')!;
 const html=renderToStaticMarkup(createElement(View,{family,words:[word],selectedHanzi:'钙',showKo:true,speak:noop,onCharacter:noop,onWord:noop}));
 assert.match(html,/center-column/);
 assert.match(html,/connection-panel/);
 assert.match(html,/正在加载 安 的字源字形/);
 assert.match(html,/安全/);
 assert.match(html,/辞书部首分类/);
 assert.doesNotMatch(html,/combine-button|next-question/);
 assert.doesNotMatch(html,/正在加载 钙/);
});

test('additional family cards paginate real glyphs and exclude original teaching cards',()=>{
 const {ExtendedFamilyCards}=views();
 const family=sidebarFamilies.find(family=>family.dictionaryId==='30')!;
 assert.ok(getSidebarFamilyCharacters(family.id,officialVocabulary).length>24);
 const html=renderToStaticMarkup(createElement(ExtendedFamilyCards,{family,words:officialVocabulary,showKo:false,onCharacter:noop,exclude:['吃']}));
 assert.equal((html.match(/class="character-card expanded-family-card/g)??[]).length,24);
 assert.match(html,/下一页/);
 assert.match(html,/aria-label="上一页汉字" disabled=""/);
 assert.doesNotMatch(html,/data-hanzi="吃"/);
 assert.doesNotMatch(html,/\/images\/words\/|\/images\/characters\/|\/images\/roots\//);
});

test('a family with no remaining scoped characters adds no empty card section',()=>{
 const {ExtendedFamilyCards}=views();
 const family=sidebarFamilies.find(family=>family.dictionaryId==='40')!;
 const word=officialVocabulary.find(word=>word.hanzi==='安全')!;
 const excluded=getSidebarFamilyCharacters(family.id,[word]);
 const html=renderToStaticMarkup(createElement(ExtendedFamilyCards,{family,words:[word],showKo:true,onCharacter:noop,exclude:excluded}));
 assert.equal(html,'');
});
