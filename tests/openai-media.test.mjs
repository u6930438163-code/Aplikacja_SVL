import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateImage, analyzeImage, generateImage, mediaStatus } from '../server/openai-media.ts';
test('reject unsafe or unsupported images', () => {
  for (const value of ['https://localhost/private', 'data:image/svg+xml;base64,PHN2Zz4=', null, 'data:image/png;base64,!!!!']) assert.throws(() => validateImage(value));
  assert.equal(validateImage('data:image/png;base64,aGVsbG8='), 'data:image/png;base64,aGVsbG8=');
});
test('missing key produces explicit error', async () => {
  delete process.env.OPENAI_API_KEY;
  assert.equal(mediaStatus().configured, false);
  await assert.rejects(generateImage('test'), /OPENAI_API_KEY/);
});
test('vision sends image pixels and returns text; generation decodes actual image', async () => {
  const original = globalThis.fetch;
  process.env.OPENAI_API_KEY = 'test-only';
  try {
    globalThis.fetch = async (url, options) => {
      const body = JSON.parse(options.body);
      if (url.endsWith('/responses')) {
        assert.equal(body.store, false);
        assert.equal(body.input.at(-1).content[1].image_url, 'data:image/png;base64,aGVsbG8=');
        return { ok: true, json: async () => ({ output: [{ content: [{ type: 'output_text', text: 'Opis' }] }] }) };
      }
      assert.equal(body.n, 1);
      return { ok: true, json: async () => ({ data: [{ b64_json: 'aGVsbG8=' }] }) };
    };
    assert.equal(await analyzeImage('SI_1', 'opis', 'data:image/png;base64,aGVsbG8='), 'Opis');
    assert.equal((await generateImage('obraz')).toString(), 'hello');
    globalThis.fetch = async () => ({ ok: false, status: 429 });
    await assert.rejects(generateImage('obraz'), /429/);
  } finally { globalThis.fetch = original; delete process.env.OPENAI_API_KEY; }
});
