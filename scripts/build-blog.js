const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const postsDirectory = path.join(root, 'public', 'blog', 'posts');
const outputArg = process.argv.indexOf('--output');
const outputDirectory = outputArg >= 0
  ? path.resolve(root, process.argv[outputArg + 1])
  : path.join(root, 'public', 'blog');

function readPost(file) {
  const source = fs.readFileSync(path.join(postsDirectory, file), 'utf8').replace(/\r\n/g, '\n');
  const match = source.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) throw new Error(`${file} needs YAML front matter with title and date.`);
  const metadata = {};
  match[1].split('\n').forEach((line) => {
    const field = line.match(/^([a-z]+):\s*(.*)$/i);
    if (field) metadata[field[1]] = field[2].replace(/^['"]|['"]$/g, '').trim();
  });
  const slug = path.basename(file, '.md');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(`${file} must use a lowercase, hyphenated filename.`);
  if (!metadata.title || !metadata.date || !/^\d{4}-\d{2}-\d{2}$/.test(metadata.date)) {
    throw new Error(`${file} needs a title and date in YYYY-MM-DD format.`);
  }
  return { slug, title: metadata.title, date: metadata.date, summary: metadata.summary || '', body: match[2].trim() };
}

const files = fs.existsSync(postsDirectory)
  ? fs.readdirSync(postsDirectory).filter((file) => file.endsWith('.md')).sort().reverse()
  : [];
const posts = files.map(readPost).sort((a, b) => b.date.localeCompare(a.date));
fs.mkdirSync(outputDirectory, { recursive: true });
fs.writeFileSync(path.join(outputDirectory, 'posts.json'), JSON.stringify(posts.map(({ slug, title, date, summary }) => ({ slug, title, date, summary })), null, 2) + '\n');

function page(slug) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#fbfbf9"><meta name="description" content="Writing by Zach Soles, Senior AI/ML Engineer."><link rel="stylesheet" href="/blog/blog.css"><title>Blog · Zach Soles</title></head>
<body><header class="blog-header"><a class="wordmark" href="/">Zach Soles<span>.</span></a><nav><a href="/">Home</a><a href="/blog/">Blog</a></nav></header><main class="blog-main"${slug ? ` data-post="${slug}"` : ''}><a class="back-link" href="/blog/">← All posts</a><div id="blog-content"><p class="loading">Loading posts…</p></div></main><footer class="blog-footer">© ${new Date().getFullYear()} Zach Soles</footer><script src="/blog/blog.js" defer></script></body></html>`;
}

fs.writeFileSync(path.join(outputDirectory, 'index.html'), page(''));
posts.forEach((post) => {
  const postDirectory = path.join(outputDirectory, post.slug);
  fs.mkdirSync(postDirectory, { recursive: true });
  fs.writeFileSync(path.join(postDirectory, 'index.html'), page(post.slug));
});
