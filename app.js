const projectList = document.querySelector('#project-list');
const projectNote = document.querySelector('#project-note');
document.querySelector('#year').textContent = new Date().getFullYear();

const themeToggle = document.querySelector('#theme-toggle');
const themeAuto = document.querySelector('#theme-auto');
const themePreference = window.matchMedia('(prefers-color-scheme: dark)');

function applyTheme(theme, automatic) {
  document.documentElement.dataset.theme = theme;
  themeToggle.setAttribute('aria-checked', String(theme === 'dark'));
  themeAuto.setAttribute('aria-pressed', String(automatic));
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#171b19' : '#fbfbf9');
}

function useSystemTheme() {
  return themePreference.matches ? 'dark' : 'light';
}

function storedTheme() {
  try {
    const value = localStorage.getItem('site-color-mode');
    return value === 'light' || value === 'dark' ? value : null;
  } catch (_) { return null; }
}

applyTheme(storedTheme() || useSystemTheme(), !storedTheme());
themeToggle.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('site-color-mode', next); } catch (_) {}
  applyTheme(next, false);
});
themeAuto.addEventListener('click', () => {
  try { localStorage.removeItem('site-color-mode'); } catch (_) {}
  applyTheme(useSystemTheme(), true);
});
themePreference.addEventListener('change', (event) => {
  if (!storedTheme()) applyTheme(event.matches ? 'dark' : 'light', true);
});

const fallbackProjects = fetch('/repos.json', { cache: 'no-cache' })
  .then((response) => {
    if (!response.ok) throw new Error('Project list unavailable');
    return response.json();
  })
  .then((data) => data.repositories || []);

function renderProjects(projects, source) {
  if (!projects.length) {
    projectList.innerHTML = '<p class="loading-copy">No projects are available right now. <a href="https://github.com/ZachSoles?tab=repositories">Browse all repositories ↗</a></p>';
    return;
  }

  projectList.innerHTML = projects.slice(0, 8).map((repo) => {
    const row = document.createElement('a');
    row.className = 'project-row';
    row.href = /^https:\/\/github\.com\/ZachSoles\/[\w.-]+$/.test(repo.url) ? repo.url : 'https://github.com/ZachSoles';
    row.target = '_blank';
    row.rel = 'noreferrer';

    const detail = document.createElement('span');
    detail.className = 'project-detail';
    const name = document.createElement('strong');
    name.textContent = repo.name || 'Project';
    detail.append(name);
    if (repo.description) {
      const description = document.createElement('span');
      description.textContent = repo.description;
      detail.append(description);
    }

    const language = document.createElement('span');
    language.className = 'project-language';
    language.textContent = repo.language || 'Other';
    const arrow = document.createElement('span');
    arrow.className = 'project-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '↗';
    row.append(detail, language, arrow);
    return row.outerHTML;
  }).join('');

  projectNote.textContent = source === 'github'
    ? 'Recent public repositories · live from GitHub'
    : 'Showing saved projects · GitHub could not be reached';
}

fetch('https://api.github.com/users/ZachSoles/repos?per_page=100&sort=pushed', {
  headers: { Accept: 'application/vnd.github+json' }
})
  .then((response) => {
    if (!response.ok) throw new Error('GitHub project list unavailable');
    return response.json();
  })
  .then((repositories) => repositories
    .filter((repo) => !repo.fork && !repo.archived && !['zachsoles.github.io', 'zachsoles'].includes(repo.name.toLowerCase()))
    .sort((a, b) => new Date(b.pushed_at || 0) - new Date(a.pushed_at || 0))
    .slice(0, 12)
    .map((repo) => ({ name: repo.name, description: repo.description, language: repo.language, url: repo.html_url })))
  .then((repositories) => renderProjects(repositories, 'github'))
  .catch(() => fallbackProjects
    .then((data) => renderProjects(data, 'fallback'))
    .catch(() => renderProjects([], 'fallback')));
