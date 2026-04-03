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

/**
 * Extracts and parses the first JSON code block within a named `## Section` in a markdown string.
 *
 * Use this when a markdown file contains multiple JSON blocks under different section headings.
 */
export function extractJsonBySection<T>(markdownContent: string, sectionName: string): T {
  const sectionRegex = new RegExp(
    `##\\s+${sectionName}[\\s\\S]*?\`\`\`json\\s*([\\s\\S]*?)\\s*\`\`\``,
  );
  const match = markdownContent.match(sectionRegex);
  if (!match || !match[1]) {
    throw new Error(`No JSON block found in section "${sectionName}"`);
  }
  return JSON.parse(match[1]) as T;
}
