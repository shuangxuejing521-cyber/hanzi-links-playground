import test from 'node:test';
import assert from 'node:assert/strict';
import {readCourseProgress,discoverCourseCharacter,scoreCourseAnswer,favoriteCourseCharacter} from '../src/lib/course-progress.ts';

test('course progress rejects corrupt state and invalid character records',()=>{
 assert.deepEqual(readCourseProgress('{bad'),{discovered:[],favorites:[],correct:0,scoredRounds:[]});
 const result=readCourseProgress(JSON.stringify({discovered:['安','安','全','安全','a','①',null],favorites:['安','安','?'],correct:-1,scoredRounds:['r1','r1',null]}));
 assert.deepEqual(result.discovered,['安','全']);
 assert.deepEqual(result.favorites,['安']);
 assert.equal(result.correct,0);
 assert.deepEqual(result.scoredRounds,['r1']);
});

test('discoveries and favorites support full-course characters without mutation',()=>{
 const empty=readCourseProgress(null);
 const learned=discoverCourseCharacter(empty,'安');
 assert.deepEqual(empty.discovered,[]);
 assert.deepEqual(learned.discovered,['安']);
 assert.equal(discoverCourseCharacter(learned,'安'),learned);
 assert.equal(discoverCourseCharacter(learned,'安全'),learned);
 const favorite=favoriteCourseCharacter(learned,'安');
 assert.deepEqual(favorite.favorites,['安']);
 assert.deepEqual(learned.favorites,[]);
 assert.deepEqual(favoriteCourseCharacter(favorite,'安').favorites,[]);
 assert.equal(favoriteCourseCharacter(favorite,'?'),favorite);
});

test('one challenge round can score only once and wrong answers never score',()=>{
 const empty=readCourseProgress(null);
 assert.equal(scoreCourseAnswer(empty,'round-1',false),empty);
 assert.equal(scoreCourseAnswer(empty,'',true),empty);
 const correct=scoreCourseAnswer(empty,'round-1',true);
 assert.equal(correct.correct,1);
 assert.deepEqual(correct.scoredRounds,['round-1']);
 assert.equal(scoreCourseAnswer(correct,'round-1',true),correct);
 assert.equal(scoreCourseAnswer(correct,'round-1',false),correct);
 assert.equal(scoreCourseAnswer(correct,'round-2',true).correct,2);
 assert.deepEqual(readCourseProgress(JSON.stringify(correct)),correct);
});
