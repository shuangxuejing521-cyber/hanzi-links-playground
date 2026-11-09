import test from 'node:test';
import assert from 'node:assert/strict';
import {decodeProgress,discoverCharacter,scoreAnswer} from '../src/lib/progress';
test('corrupt or unrecognized saved progress safely starts empty',()=>{
  assert.deepEqual(decodeProgress('{broken',new Set(['油'])),{discovered:[],favorites:[],correct:0,completedRounds:[]});
  assert.deepEqual(decodeProgress('{"discovered":["油","fake","油"],"correct":-9}',new Set(['油'])).discovered,['油']);
});
test('discovering a real character twice counts once and never records an unknown character',()=>{
  const valid=new Set(['油','泳']);let state=decodeProgress(null,valid);
  state=discoverCharacter(state,'油',valid);state=discoverCharacter(state,'油',valid);state=discoverCharacter(state,'fake',valid);
  assert.deepEqual(state.discovered,['油']);
});
test('a challenge scores once for a round, while wrong answers never score',()=>{
  let state=decodeProgress(null,new Set(['油']));
  state=scoreAnswer(state,'round-1',false);assert.equal(state.correct,0);
  state=scoreAnswer(state,'round-1',true);state=scoreAnswer(state,'round-1',true);assert.equal(state.correct,1);
  state=scoreAnswer(state,'round-2',true);assert.equal(state.correct,2);
});
