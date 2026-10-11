(() => {
  try {
    const saved = localStorage.getItem('site-color-mode');
    document.documentElement.dataset.theme = saved === 'light' || saved === 'dark' ? saved : (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  } catch (_) {}
  const escapeHtml = (value) => value.replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
  const inline = (value) => escapeHtml(value)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" rel="noreferrer">$1</a>');
  function markdown(source) {
    const lines = source.replace(/\r\n/g, '\n').split('\n');
    const out = []; let paragraph = []; let list = ''; let code = false; let codeLines = [];
    const flushParagraph = () => { if (paragraph.length) { out.push(`<p>${inline(paragraph.join(' '))}</p>`); paragraph = []; } };
    const flushList = () => { if (list) { out.push(`</${list}>`); list = ''; } };
    lines.forEach((line) => {
      if (line.startsWith('```')) { flushParagraph(); flushList(); if (code) { out.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`); codeLines = []; } code = !code; return; }
      if (code) { codeLines.push(line); return; }
      const heading = line.match(/^(#{1,3})\s+(.+)$/); const bullet = line.match(/^\s*[-*+]\s+(.+)$/); const numbered = line.match(/^\s*\d+\.\s+(.+)$/);
      if (!line.trim() || heading || bullet || numbered || /^>\s?/.test(line) || /^---+$/.test(line)) flushParagraph();
      if (heading) { flushList(); const level = heading[1].length; out.push(`<h${level}>${inline(heading[2])}</h${level}>`); }
      else if (bullet || numbered) { const next = bullet ? 'ul' : 'ol'; if (list && list !== next) flushList(); if (!list) { list = next; out.push(`<${list}>`); } out.push(`<li>${inline((bullet || numbered)[1])}</li>`); }
      else if (/^>\s?/.test(line)) { flushList(); out.push(`<blockquote>${inline(line.replace(/^>\s?/, ''))}</blockquote>`); }
      else if (/^---+$/.test(line)) { flushList(); out.push('<hr>'); }
      else if (line.trim()) { flushList(); paragraph.push(line.trim()); }
      else flushList();
    });
    flushParagraph(); flushList(); if (code) out.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`); return out.join('\n');
  }
  const main = document.querySelector('.blog-main'); const content = document.querySelector('#blog-content');
  fetch('/blog/posts.json', { cache: 'no-cache' }).then((response) => { if (!response.ok) throw new Error('Posts unavailable'); return response.json(); }).then((posts) => {
    const slug = main.dataset.post;
    if (slug) {
      const post = posts.find((item) => item.slug === slug); if (!post) throw new Error('Post not found');
      document.title = `${post.title} · Zach Soles`;
      const date = new Date(`${post.date}T12:00:00`).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric', timeZone:'UTC' });
      content.innerHTML = `<p class="post-date">${date}</p><h1>${escapeHtml(post.title)}</h1>${post.summary ? `<p class="blog-lede">${escapeHtml(post.summary)}</p>` : ''}<article class="post-content">Loading article…</article>`;
      return fetch(`/blog/posts/${encodeURIComponent(slug)}.md`).then((response) => { if (!response.ok) throw new Error('Article unavailable'); return response.text(); }).then((source) => { content.querySelector('.post-content').innerHTML = markdown(source.replace(/^---\n[\s\S]*?\n---\n?/, '').trim()); });
    }
    content.innerHTML = `<h1>Writing</h1><p class="blog-lede">Notes on AI/ML, MLOps, and building reliable software.</p>${posts.length ? `<div class="post-list">${posts.map((post) => `<a class="post-row" href="/blog/${encodeURIComponent(post.slug)}/"><time datetime="${post.date}">${new Date(`${post.date}T12:00:00`).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric', timeZone:'UTC' })}</time><h2>${escapeHtml(post.title)}</h2>${post.summary ? `<p>${escapeHtml(post.summary)}</p>` : ''}</a>`).join('')}</div>` : '<p class="empty-state">New posts coming soon.</p>'}`;
  }).catch(() => { content.innerHTML = '<h1>Writing</h1><p class="empty-state">Posts are temporarily unavailable.</p>'; });
})();
