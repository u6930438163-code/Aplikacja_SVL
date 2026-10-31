import { test } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createSvlMcpServer, mountSvlMcp, projectState } from '../server/mcp.ts';
const deps = { getState: async () => ({ store: { config: { sys_version: '8.5', token: 'secret' }, chat_history: [{ agent: 'Aria', tekst: 'hello', file: { dataUrl: 'secret' } }] } }), aiStatus: () => ({ configured: false }), listExports: async () => [{ name: 'report.txt', size: 4 }] };
test('MCP SDK discovers and calls tools without leaking config or attachments', async () => {
  const server = createSvlMcpServer(deps, true);
  const client = new Client({ name: 'test', version: '1' });
  const [a, b] = InMemoryTransport.createLinkedPair();
  await server.connect(a); await client.connect(b);
  try {
    assert.equal((await client.listTools()).tools.length, 3);
    const status = await client.callTool({ name: 'svl_status', arguments: {} });
    assert.ok(!JSON.stringify(status).includes('secret'));
    const chat = await client.callTool({ name: 'svl_recent_messages', arguments: { limit: 1 } });
    assert.match(JSON.stringify(chat), /hello/); assert.ok(!JSON.stringify(chat).includes('secret'));
    const invalid = await client.callTool({ name: 'svl_recent_messages', arguments: { limit: 999 } });
    assert.equal(invalid.isError, true);
  } finally { await client.close(); await server.close(); }
});
test('chat tool disabled by default', async () => {
  const server = createSvlMcpServer(deps, false); const client = new Client({ name: 'test', version: '1' });
  const [a,b] = InMemoryTransport.createLinkedPair(); await server.connect(a); await client.connect(b);
  try { assert.deepEqual((await client.listTools()).tools.map(t => t.name).sort(), ['svl_list_exports', 'svl_status']); }
  finally { await client.close(); await server.close(); }
});
test('HTTP disabled endpoint; OAuth discovery and unauthenticated rejection', async () => {
  for (const enabled of [false, true]) {
    process.env.MCP_ENABLED = String(enabled);
    process.env.MCP_PUBLIC_URL = 'https://svl.example/mcp'; process.env.MCP_OAUTH_ISSUER = 'https://auth.example/';
    process.env.MCP_OAUTH_JWKS_URL = 'https://auth.example/jwks'; process.env.MCP_ALLOWED_SUBJECTS = 'owner';
    const app = express(); app.use(express.json()); mountSvlMcp(app, deps);
    const http = app.listen(0, '127.0.0.1'); await new Promise<void>(r => http.once('listening', r));
    const address = http.address() as any; const base = `http://127.0.0.1:${address.port}`;
    try {
      const response = await fetch(base + '/mcp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      assert.equal(response.status, enabled ? 401 : 503);
      if (enabled) {
        assert.match(response.headers.get('www-authenticate') || '', /resource_metadata/);
        const metadata = await (await fetch(base + '/.well-known/oauth-protected-resource/mcp')).json();
        assert.equal(metadata.resource, 'https://svl.example/mcp');
      }
    } finally { await new Promise<void>(r => http.close(() => r())); }
  }
  process.env.MCP_ENABLED = 'false';
});
