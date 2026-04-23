/**
 * Wraps all occurrences of `keyword` in `<mark class="cp-irt-highlight">` tags
 * within the text nodes of an HTML string.  HTML tag markup (including
 * attribute values) is left untouched.
 *
 * Limitations: does not handle HTML comments (`<!-- … -->`), CDATA sections,
 * or processing instructions.  These constructs are not expected in the
 * transcript HTML content this utility is designed for.
 */
export function highlightHtml(html: string, keyword: string): string {
  if (!keyword.trim()) return html;
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const kwRe = new RegExp(`(${escaped})`, 'gi');
  // Split on HTML tags; replace only the text-node segments.
  return html.replace(/(<[^>]*>)|([^<]+)/g, (match, tag: string | undefined, text: string | undefined) => {
    if (tag) return tag;
    if (text) {
      return text.replace(kwRe, (m) => {
        // HTML-encode the matched text defensively before inserting into markup.
        const safe = m.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return `<mark class="cp-irt-highlight">${safe}</mark>`;
      });
    }
    return match;
  });
}
