import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');
const outDir = path.join(repoRoot, 'out');

function collectHtmlFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return collectHtmlFiles(fullPath);
    }

    return entry.isFile() && entry.name.endsWith('.html') ? [fullPath] : [];
  });
}

function findMissingCompanyProfilePages() {
  if (!fs.existsSync(outDir)) {
    throw new Error('Static export not found. Run `npm run build` before running this test.');
  }

  const htmlFiles = collectHtmlFiles(outDir);
  const missing = new Set();
  const hrefPattern = /href="(\/lego\/company-profile\/[^"?#]+\/)"/g;

  for (const htmlFile of htmlFiles) {
    const html = fs.readFileSync(htmlFile, 'utf8');

    for (const match of html.matchAll(hrefPattern)) {
      const href = match[1];
      const routePath = href.slice('/lego/'.length);
      const targetPath = path.join(outDir, routePath, 'index.html');

      if (!fs.existsSync(targetPath)) {
        missing.add(href);
      }
    }
  }

  return [...missing].sort();
}

test('static export includes every linked company profile page', () => {
  const missingPages = findMissingCompanyProfilePages();

  assert.deepEqual(missingPages, []);
});
