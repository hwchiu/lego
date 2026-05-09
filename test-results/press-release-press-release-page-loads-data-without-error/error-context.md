# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: press-release.spec.js >> press release page loads data without error
- Location: ../../../../../tmp/press-release-check/press-release.spec.js:3:1

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 0
Received:   0

Call Log:
- Timeout 5000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - heading "Error response" [level=1] [ref=e2]
  - paragraph [ref=e3]: "Error code: 404"
  - paragraph [ref=e4]: "Message: File not found."
  - paragraph [ref=e5]: "Error code explanation: 404 - Nothing matches the given URI."
```

# Test source

```ts
  1 | const { test, expect } = require('/home/runner/work/lego/lego/node_modules/@playwright/test');
  2 | 
  3 | test('press release page loads data without error', async ({ page }) => {
  4 |   await page.goto('http://127.0.0.1:3000/lego/press-release/');
  5 |   await page.waitForLoadState('networkidle');
  6 |   await expect(page.getByText(/Failed to load:/)).toHaveCount(0);
> 7 |   await expect.poll(async () => await page.locator('.pr-archive-group').count()).toBeGreaterThan(0);
    |   ^ Error: expect(received).toBeGreaterThan(expected)
  8 | });
  9 | 
```