import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
const base=process.env.HANZI_URL||'http://127.0.0.1:5184';
const output=path.resolve('output/browser');await fs.mkdir(output,{recursive:true});
const executablePath=process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||chromium.executablePath();
const browser=await chromium.launch({headless:true,executablePath});
const page=await browser.newPage({viewport:{width:1512,height:1100}});const errors=[];page.on('pageerror',e=>errors.push(e.message));const steps=[];const pass=s=>{steps.push(s);console.log('PASS '+s);};
async function tab(name){await page.locator('.site-header nav').getByRole('button',{name,exact:false}).click();}
async function part(text){await page.getByRole('button',{name:`选择右部 ${text}`,exact:true}).click();}
async function combine(){await page.getByRole('button',{name:'组合，看看会发生什么',exact:true}).click();}
async function glyph(text){assert.equal(await page.locator('.meaning-copy .character-title h2').textContent(),text);}
try{
 await page.goto(base);await page.locator('.character-card').first().waitFor();
 assert.equal(await page.title(),'字有意思 · 汉字部件实验室');assert.equal(await page.locator('.radical-list>button').count(),26);await glyph('红');
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:path.join(output,'desktop-explore.png'),fullPage:true});pass('Thread family opens with real pictures, 26 radical categories and responsive layout');
 await page.locator('.radical-list button').filter({hasText:'三点水'}).click();await glyph('油');
 await page.locator('.character-card').filter({has:page.locator('strong').filter({hasText:/^泳$/})}).click();await glyph('泳');
 await page.locator('.linked-word').filter({hasText:'游泳'}).click();await page.locator('dialog[open]').waitFor();assert.ok((await page.locator('dialog[open]').textContent()).includes('수영'));await page.keyboard.press('Escape');pass('Radical exploration connects swimming to the HSK word and Korean meaning');
 await tab('自由组字');assert.equal(await page.locator('.left-slot .part-glyph').textContent(),'氵');await part('由');await combine();await glyph('油');assert.ok((await page.locator('.game-feedback').textContent()).includes('组合成功'));
 await part('永');await combine();await glyph('泳');await page.screenshot({path:path.join(output,'desktop-combination.png'),fullPage:true});pass('氵+由 creates 油, while 氵+永 creates 泳 with distinct pictures, meaning and words');
 await page.getByRole('button',{name:'全部部件',exact:true}).click();await part('火');await combine();assert.ok((await page.locator('.game-feedback').textContent()).includes('暂未收录'));assert.equal(await page.locator('.meaning-card').count(),0);
 await page.getByRole('button',{name:'选择右部 永',exact:true}).dragTo(page.locator('.right-slot'));await combine();await glyph('泳');pass('Unknown combinations are honest and dragging a part works');
 await part('青');await combine();await glyph('清');await page.locator('.related-characters button').filter({hasText:'请'}).click();await glyph('请');assert.ok((await page.locator('.family-intro').textContent()).includes('言'));pass('The 青 part links across 清 and 请 rather than staying within one radical');
 await tab('看图挑战');assert.ok((await page.locator('.challenge-goal').textContent()).includes('기름'));await part('永');await combine();assert.ok((await page.locator('.game-feedback').textContent()).includes('再看看'));
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('hanzi-playground-v1')).correct),0);
 await part('由');await combine();assert.ok((await page.locator('.game-feedback').textContent()).includes('答对'));await combine();assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('hanzi-playground-v1')).correct),1);
 await page.getByRole('button',{name:'下一题',exact:true}).click();await part('永');await combine();assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('hanzi-playground-v1')).correct),2);pass('Picture challenges distinguish wrong answers and score each round once');
 await tab('我的连接');assert.ok((await page.locator('.connections-summary').textContent()).includes('已点亮'));assert.ok(await page.locator('.discovered-card').count()>=4);const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('hanzi-playground-v1')));await page.reload();await tab('我的连接');assert.equal(await page.locator('.discovered-card').count(),saved.discovered.length);pass('Discovered character connections and challenge scores persist on reload');
 await page.getByRole('textbox',{name:'搜索汉字 拼音 韩语词汇'}).fill('주유소');await page.locator('.search-results>button').first().click();assert.ok((await page.locator('dialog[open]').textContent()).includes('加油站'));await page.keyboard.press('Escape');pass('Korean search finds an HSK word without a character-card restriction');
 await page.getByRole('button',{name:/跟着一根线学字/}).click();await page.locator('.video-lesson').waitFor();await page.getByRole('button',{name:'隐藏轮廓',exact:true}).click();assert.equal(await page.getByRole('button',{name:'描出轮廓',exact:true}).getAttribute('aria-pressed'),'false');await page.getByRole('button',{name:'描出轮廓',exact:true}).click();await page.screenshot({path:path.join(output,'thread-morph.png'),fullPage:true});await page.locator('.lesson-word-links').getByRole('button',{name:'丝线',exact:false}).click();assert.ok((await page.locator('dialog[open]').textContent()).includes('课程扩展词'));await page.keyboard.press('Escape');for(let i=0;i<3;i++)await page.getByRole('button',{name:'继续看下一步',exact:true}).click();await page.getByRole('button',{name:'去探索纟字族',exact:true}).click();await glyph('红');assert.ok((await page.locator('.family-intro').textContent()).includes('纟'));pass('The four visual story steps return to a consistent thread family');
 await page.locator('.radical-list button').filter({hasText:'绞丝旁'}).click();const practice=page.locator('.character-card').filter({has:page.locator('strong').filter({hasText:/^练$/})});await practice.click();assert.equal(await page.locator('.right-slot .part-crop').count(),1);await page.screenshot({path:path.join(output,'rare-component.png'),fullPage:true});pass('The rare modern right component of 练 is shown using its actual glyph crop');
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>scrollTo(0,0));assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:path.join(output,'mobile-explore.png'),fullPage:true});
 await tab('自由组字');await part('永');await combine();await glyph('泳');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:path.join(output,'mobile-game.png'),fullPage:true});pass('390px students can select, combine and read the result without horizontal overflow');
 await page.locator('.site-header').getByRole('button',{name:'学习方法与来源',exact:true}).click();await page.locator('dialog[open]').waitFor();assert.ok((await page.locator('dialog[open]').textContent()).includes('记忆联想'));await page.keyboard.press('Escape');
 const response=await page.request.get(base+'/sources/NOTICE.txt');assert.equal(response.status(),200);assert.deepEqual(errors,[]);pass('Method distinctions and source licenses are available; no JavaScript errors');
 await fs.writeFile(path.join(output,'results.json'),JSON.stringify({base,steps,errors,checked:new Date().toISOString()},null,2));
}catch(e){console.error(e);process.exitCode=1;await page.screenshot({path:path.join(output,'failure.png'),fullPage:true}).catch(()=>{});}finally{await browser.close();}
