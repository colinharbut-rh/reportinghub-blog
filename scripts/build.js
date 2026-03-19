#!/usr/bin/env node
/**
 * Build script: inlines templates/header.html and templates/footer.html
 * into src/blog/*.html placeholders and writes output to blog/.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TEMPLATES_DIR = path.join(ROOT, 'templates');
const SRC_BLOG = path.join(ROOT, 'src', 'blog');
const OUT_BLOG = path.join(ROOT, 'blog');

const headerContent = fs.readFileSync(path.join(TEMPLATES_DIR, 'header.html'), 'utf8');
const footerContent = fs.readFileSync(path.join(TEMPLATES_DIR, 'footer.html'), 'utf8');
const fixesCSS = fs.readFileSync(path.join(TEMPLATES_DIR, 'blog-fixes.css'), 'utf8');
const FIXES_INJECTION = `<style id="blog-fixes">\n${fixesCSS}\n</style>\n</head>`;

const HEADER_PLACEHOLDER = '<!-- INCLUDE header -->';
const FOOTER_PLACEHOLDER = '<!-- INCLUDE footer -->';

/**
 * Remove stray </div> tags inside <article class="post-content">...</article>
 * that break the article container. Webflow exports sometimes include extra
 * closing </div> tags that don't have matching openers.
 */
function balanceArticleDivs(html) {
  const openTag = '<article class="post-content">';
  const closeTag = '</article>';
  const startIdx = html.indexOf(openTag);
  const endIdx = html.indexOf(closeTag);
  if (startIdx === -1 || endIdx === -1) return html;

  const before = html.slice(0, startIdx + openTag.length);
  const articleContent = html.slice(startIdx + openTag.length, endIdx);
  const after = html.slice(endIdx);

  // Walk through the article content tracking div depth.
  // Any </div> that would drop below depth 0 is stray and must be removed.
  let fixed = '';
  let depth = 0;
  let removed = 0;
  let i = 0;
  while (i < articleContent.length) {
    if (articleContent.slice(i, i + 4).toLowerCase() === '<div' &&
        (articleContent[i + 4] === ' ' || articleContent[i + 4] === '>')) {
      depth++;
      fixed += articleContent[i];
      i++;
    } else if (articleContent.slice(i, i + 6).toLowerCase() === '</div>') {
      if (depth > 0) {
        depth--;
        fixed += '</div>';
      } else {
        // Stray </div> — skip it
        removed++;
      }
      i += 6;
    } else {
      fixed += articleContent[i];
      i++;
    }
  }

  if (removed > 0) {
    const rel = arguments[1] || '';
    console.log(`  Balanced ${removed} stray </div> tag(s) in ${rel}`);
  }

  return before + fixed + after;
}

function buildFile(srcPath) {
  const rel = path.relative(SRC_BLOG, srcPath);
  const outPath = path.join(OUT_BLOG, rel);

  let content = fs.readFileSync(srcPath, 'utf8');
  content = balanceArticleDivs(content, rel);
  content = content.replace(HEADER_PLACEHOLDER, headerContent);
  content = content.replace(FOOTER_PLACEHOLDER, footerContent);
  content = content.replace('</head>', FIXES_INJECTION);

  const outDir = path.dirname(outPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  fs.writeFileSync(outPath, content, 'utf8');
}

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) {
      walk(full);
    } else if (name.endsWith('.html')) {
      buildFile(full);
    }
  }
}

if (!fs.existsSync(SRC_BLOG)) {
  console.error('Missing src/blog directory.');
  process.exit(1);
}

walk(SRC_BLOG);
console.log('Build complete: blog/ updated from src/blog/ and templates/.');
