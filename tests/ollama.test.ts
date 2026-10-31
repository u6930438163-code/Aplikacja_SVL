import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ollamaConfig, ollamaReply, ollamaHealth } from '../server/ollama.ts';
test('Ollama applies bounded context, history, keep-alive and returns measured rate', async () => {
 process.env.OLLAMA_MODEL='test'; process.env.OLLAMA_NUM_CTX='9999999';
 const mock = (async (_url: any, init: any) => {
  const body = JSON.parse(init.body); assert.equal(body.options.num_ctx,4096); assert.equal(body.keep_alive,'10m');
  assert.ok(body.messages.length<=14); assert.match(body.messages[0].content,/Aria/);
  return {ok:true,json:async()=>({message:{content:'Odpowiedź'},eval_count:20,eval_duration:1e9})};
 }) as any;
 const reply=await ollamaReply('SI_1','test',Array.from({length:100},()=>({agent:'Aria',tekst:'x'.repeat(5000)})),mock);
 assert.equal(reply.tokensPerSecond,20); assert.equal(reply.text,'Odpowiedź');
});
test('HTTP failure releases concurrency lock and health reports offline',async()=>{
 const fail=(async()=>({ok:false,status:502})) as any;
 await assert.rejects(ollamaReply('SI_1','test',[],fail),/502/);
 await assert.rejects(ollamaReply('SI_1','test',[],fail),/502/);
 assert.equal((await ollamaHealth(fail)).reachable,false);
});
test('rejects parallel work rather than queueing indefinitely',async()=>{
 let release:any;const pending=new Promise(r=>release=r);
 const first=ollamaReply('SI_1','test',[],(async()=>{await pending;return {ok:true,json:async()=>({message:{content:'ok'}})};}) as any);
 await assert.rejects(ollamaReply('SI_1','test'),/inne zadanie/);release();await first;
});
