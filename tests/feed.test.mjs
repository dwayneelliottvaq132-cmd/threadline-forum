import test from 'node:test';
import assert from 'node:assert/strict';
import { filterPosts, safeLink } from '../lib/feed.mjs';
const posts = [{ text: 'Dinner', author: 'Maya', community: 'Fort Worth Social', saved: true }, { text: 'Design ideas', author: 'Jordan', community: 'Build In Public' }];
test('saved and group feeds use current posts and preserve object identity', () => {
  assert.deepEqual(filterPosts(posts, 'saved'), [posts[0]]);
  assert.deepEqual(filterPosts(posts, 'following', ['Build In Public']), [posts[1]]);
  assert.equal(filterPosts(posts, 'local')[0], posts[0]);
  assert.deepEqual(filterPosts(posts, 'following', []), []);
});
test('search matches author, community and content, ignoring case', () => {
  assert.deepEqual(filterPosts(posts, 'all', [], ' JORDAN '), [posts[1]]);
  assert.deepEqual(filterPosts(posts, 'saved', [], 'design'), []);
});
test('links allow web URLs only', () => {
  assert.equal(safeLink(' https://example.com '), 'https://example.com/');
  for (const value of ['javascript:alert(1)', 'data:text/html,hello', '/relative', 'bad url']) assert.equal(safeLink(value), null);
});
