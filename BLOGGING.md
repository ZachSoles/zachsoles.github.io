# Adding a blog post

Add one Markdown file per post in `public/blog/posts/`, using a lowercase, hyphenated filename such as `my-first-post.md`.

Start each file with this front matter:

```md
---
title: My first post
date: 2026-10-10
summary: A short description shown in the post list.
---

Write the post here using headings, paragraphs, lists, quotes, links, and fenced code blocks.
```

The site builds the minimal post list and individual article pages automatically during deployment. Push the Markdown file to `master` and the existing GitHub Pages workflow publishes it.
