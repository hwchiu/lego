/**
 * Wraps all occurrences of `keyword` in `<mark class="cp-irt-highlight">` tags
 * within the text nodes of an HTML string.  HTML tag markup (including
 * attribute values) is left untouched.
 */
export function highlightHtml(html: string, keyword: string): string {
  if (!keyword.trim()) return html;
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const kwRe = new RegExp(`(${escaped})`, 'gi');
  // Split on HTML tags; replace only the text-node segments.
  return html.replace(/(<[^>]*>)|([^<]+)/g, (match, tag: string | undefined, text: string | undefined) => {
    if (tag) return tag;
    if (text) return text.replace(kwRe, '<mark class="cp-irt-highlight">$1</mark>');
    return match;
  });
}
