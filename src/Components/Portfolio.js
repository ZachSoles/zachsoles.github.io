import React, { useEffect, useState } from 'react';
import resume from './Resources/soles_resume.pdf';
import profilePhoto from './Resources/zach-soles-profile.jpg';

const githubReposUrl = 'https://github.com/ZachSoles?tab=repositories';

function Portfolio() {
  const [projects, setProjects] = useState(null);
  const [projectSource, setProjectSource] = useState('github');

  useEffect(() => {
    const toggle = document.querySelector('#theme-toggle');
    const automatic = document.querySelector('#theme-auto');
    const preference = window.matchMedia('(prefers-color-scheme: dark)');
    const readSaved = () => {
      try {
        const value = localStorage.getItem('site-color-mode');
        return value === 'light' || value === 'dark' ? value : null;
      } catch (_) { return null; }
    };
    const systemTheme = () => preference.matches ? 'dark' : 'light';
    const apply = (theme, followsSystem) => {
      document.documentElement.dataset.theme = theme;
      toggle.setAttribute('aria-checked', String(theme === 'dark'));
      automatic.setAttribute('aria-pressed', String(followsSystem));
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#171b19' : '#fbfbf9');
    };
    const onToggle = () => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('site-color-mode', next); } catch (_) {}
      apply(next, false);
    };
    const onAuto = () => {
      try { localStorage.removeItem('site-color-mode'); } catch (_) {}
      apply(systemTheme(), true);
    };
    const onPreferenceChange = (event) => {
      if (!readSaved()) apply(event.matches ? 'dark' : 'light', true);
    };

    apply(readSaved() || systemTheme(), !readSaved());
    toggle.addEventListener('click', onToggle);
    automatic.addEventListener('click', onAuto);
    preference.addEventListener('change', onPreferenceChange);
    return () => {
      toggle.removeEventListener('click', onToggle);
      automatic.removeEventListener('click', onAuto);
      preference.removeEventListener('change', onPreferenceChange);
    };
  }, []);

  useEffect(() => {
    const fallback = fetch('/repos.json', { cache: 'no-cache' })
      .then((response) => {
        if (!response.ok) throw new Error('Project list unavailable');
        return response.json();
      })
      .then((data) => Array.isArray(data.repositories) ? data.repositories : []);

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
      .then((items) => setProjects(items.slice(0, 8)))
      .catch(() => fallback
        .then((data) => {
          setProjectSource('saved');
          setProjects(data.slice(0, 8));
        })
        .catch(() => {
          setProjectSource('saved');
          setProjects([]);
        }));
  }, []);

  return (
    <div className="portfolio">
      <header className="site-header page-wrap">
        <a className="wordmark" href="#top">Zach Soles<span className="wordmark-dot">.</span></a>
        <nav className="main-nav" aria-label="Main navigation">
          <a href="#experience">Experience</a>
          <a href="#projects">Projects</a>
          <a href="/blog/">Blog</a>
          <a href={resume} target="_blank" rel="noreferrer">Résumé ↗</a>
          <div className="theme-control" aria-label="Color theme">
            <span>Light</span>
            <button className="theme-switch" id="theme-toggle" type="button" role="switch" aria-checked="false" aria-label="Dark mode"><span className="switch-track"><span className="switch-thumb" /></span></button>
            <span>Dark</span>
            <button className="theme-auto" id="theme-auto" type="button" aria-pressed="true" title="Follow device appearance">Auto</button>
          </div>
        </nav>
      </header>

      <main id="top" className="page-wrap">
        <section className="intro" aria-labelledby="name">
          <div className="intro-content">
            <p className="eyebrow">SENIOR AI / ML ENGINEER <span>·</span> PHILADELPHIA, PA</p>
            <h1 id="name">Zach Soles</h1>
            <p className="intro-copy">Senior AI/ML engineer specializing in MLOps and the end-to-end development of machine learning systems, from model training and evaluation to production deployment.</p>
            <div className="intro-links">
              <a href="mailto:zacsoles@gmail.com">zacsoles@gmail.com</a>
              <a href="https://github.com/ZachSoles" target="_blank" rel="noreferrer">GitHub ↗</a>
              <a href="https://www.linkedin.com/in/zachery-soles/" target="_blank" rel="noreferrer">LinkedIn ↗</a>
            </div>
          </div>
          <img className="profile-photo" src={profilePhoto} alt="Zach Soles" width="200" height="245" />
        </section>

        <section className="content-section" id="experience" aria-labelledby="experience-heading">
          <div className="section-label"><h2 id="experience-heading">Experience</h2><span>01</span></div>
          <div className="experience-list">
            <article className="experience-item">
              <p className="experience-date">FEB 2024 — PRESENT</p>
              <div><h3>IT Infrastructure Technician <span>·</span> U.S. Air Force</h3></div>
            </article>
            <article className="experience-item">
              <p className="experience-date">AUG 2023 — PRESENT</p>
              <div>
                <h3>Lockheed Martin</h3>
                <ul className="role-history">
                  <li><span className="role-history-date">MAY 2026 — PRESENT</span><span className="role-history-title">Senior AI Machine Learning Engineer</span></li>
                  <li><span className="role-history-date">JAN 2024 — MAY 2026</span><span className="role-history-title">AI Machine Learning Engineer</span></li>
                  <li><span className="role-history-date">SEP 2023 — JAN 2024</span><span className="role-history-title">AI/ML SkillBridge Intern</span></li>
                </ul>
              </div>
            </article>
            <article className="experience-item">
              <p className="experience-date">MAY 2023 — JUL 2025</p>
              <div><h3>Teaching Assistant <span>·</span> Georgia Institute of Technology</h3></div>
            </article>
            <article className="experience-item">
              <p className="experience-date">NOV 2022 — AUG 2023</p>
              <div><h3>Engineer <span>·</span> USAF Project Arc</h3></div>
            </article>
            <article className="experience-item">
              <p className="experience-date">FEB 2020 — FEB 2024</p>
              <div><h3>Aerospace Propulsion Journeyman <span>·</span> U.S. Air Force</h3></div>
            </article>
            <article className="experience-item">
              <p className="experience-date">JUN 2019 — AUG 2019</p>
              <div><h3>Software Engineering Intern <span>·</span> Kaleido Health Solutions</h3></div>
            </article>
          </div>
          <div className="education-line"><span>EDUCATION</span><p>M.S. Computer Science · Georgia Institute of Technology (2021–2024)<br />B.S. Computer Science · West Chester University (2016–2019)</p></div>
        </section>

        <section className="content-section projects-section" id="projects" aria-labelledby="projects-heading">
          <div className="section-label"><h2 id="projects-heading">Projects</h2><span>02</span></div>
          <div className="project-list" aria-live="polite">
            {projects === null && <p className="loading-copy">Loading recent public projects…</p>}
            {projects && projects.length === 0 && <p className="loading-copy">No projects are available right now. <a href={githubReposUrl}>Browse all repositories ↗</a></p>}
            {projects && projects.map((project) => (
              <a className="project-row" href={project.url || 'https://github.com/ZachSoles'} key={project.name} target="_blank" rel="noreferrer">
                <span className="project-detail"><strong>{project.name || 'Project'}</strong>{project.description && <span>{project.description}</span>}</span>
                <span className="project-language">{project.language || 'OTHER'}</span>
                <span className="project-arrow" aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
          <div className="projects-footer"><p>{projectSource === 'github' ? 'Recent public repositories · live from GitHub' : 'Showing saved projects · GitHub could not be reached'}</p><a href={githubReposUrl} target="_blank" rel="noreferrer">All repositories ↗</a></div>
        </section>
      </main>

      <footer className="site-footer page-wrap"><span>© {new Date().getFullYear()} Zach Soles</span><span>Built with care.</span></footer>
    </div>
  );
}

export default Portfolio;
