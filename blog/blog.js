(() => {
  try { const saved = localStorage.getItem('site-color-mode'); document.documentElement.dataset.theme = saved === 'light' || saved === 'dark' ? saved : (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); } catch (_) {}
  const esc = (s) => s.replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const main = document.querySelector('.blog-main'), content = document.querySelector('#blog-content');
  fetch('/blog/posts.json', {cache:'no-cache'}).then((r) => { if (!r.ok) throw Error(); return r.json(); }).then((posts) => {
    content.innerHTML = `<h1>Writing</h1><p class="blog-lede">Notes on AI/ML, MLOps, and building reliable software.</p>${posts.length ? `<div class="post-list">${posts.map((p) => `<a class="post-row" href="/blog/${encodeURIComponent(p.slug)}/"><time>${esc(p.date)}</time><h2>${esc(p.title)}</h2>${p.summary ? `<p>${esc(p.summary)}</p>` : ''}</a>`).join('')}</div>` : '<p class="empty-state">New posts coming soon.</p>'}`;
  }).catch(() => { content.innerHTML = '<h1>Writing</h1><p class="empty-state">Posts are temporarily unavailable.</p>'; });
})();
