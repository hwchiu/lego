/**
 * Extracts and parses the first JSON code block from a markdown string.
 *
 * Markdown data files store their payload inside a ```json … ``` fenced block.
 * This utility locates that block and returns the parsed value.
 */
export function extractJson<T>(markdownContent: string): T {
  const match = markdownContent.match(/```json\s*([\s\S]*?)\s*```/);
  if (!match || !match[1]) {
    throw new Error('No JSON block found in markdown content');
  }
  return JSON.parse(match[1]) as T;
}
