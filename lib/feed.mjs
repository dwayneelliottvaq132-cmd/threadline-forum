/** @param {string} value */
export function safeLink(value) {
  try { const url = new URL(value.trim()); return ['https:', 'http:'].includes(url.protocol) ? url.href : null; } catch { return null; }
}
/** @template {{text: string, author: string, community: string, saved?: boolean}} T
 * @param {T[]} posts @param {string} mode @param {string[]} joined @param {string} query */
export function filterPosts(posts, mode, joined = [], query = '') {
  const term = query.trim().toLowerCase();
  return posts.filter(post => {
    if (mode === 'saved' && !post.saved) return false;
    if (mode === 'following' && !joined.includes(post.community)) return false;
    if (mode === 'local' && !/fort worth|dfw/i.test(post.community)) return false;
    return `${post.text} ${post.author} ${post.community}`.toLowerCase().includes(term);
  });
}
