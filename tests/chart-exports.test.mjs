import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('chat chart imports are all exported by the chart module', () => {
  const module = readFileSync(new URL('../src/components/InteractiveChartRenderer.tsx', import.meta.url), 'utf8');
  const consumers = [
    '../src/components/FormattedMessage.tsx',
    '../src/components/DiagnosticsView.tsx',
  ];
  for (const path of consumers) {
    const source = readFileSync(new URL(path, import.meta.url), 'utf8');
    const imports = [...source.matchAll(/import\s*\{([^}]+)\}\s*from\s*['"]\.\/InteractiveChartRenderer['"]/g)];
    assert.ok(imports.length, `missing chart import in ${path}`);
    for (const [, names] of imports) {
      for (const entry of names.split(',').map(s => s.trim()).filter(Boolean)) {
        const name = entry.split(/\s+as\s+/)[0];
        assert.match(module, new RegExp(`export\\s+(?:const|function|class)\\s+${name}\\b`),
          `Missing chart export ${name} required by ${path}`);
      }
    }
  }
});
