#!/usr/bin/env node
/**
 * One-time migration: strips the hardcoded inline style from content images
 * in src/blog/ files. The equivalent CSS is now in templates/blog-fixes.css.
 */
const fs = require('fs');
const path = require('path');

const SRC_BLOG = path.resolve(__dirname, '..', 'src', 'blog');
const TARGET_STYLE = ' style="max-width:100%;height:auto;border-radius:8px;margin:24px 0;"';

let totalFixed = 0;
let filesFixed = 0;

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) {
      walk(full);
    } else if (name.endsWith('.html')) {
      let content = fs.readFileSync(full, 'utf8');
      const escaped = TARGET_STYLE.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const matches = content.match(new RegExp(escaped, 'g'));
      const count = matches ? matches.length : 0;
      if (count > 0) {
        content = content.replaceAll(TARGET_STYLE, '');
        fs.writeFileSync(full, content, 'utf8');
        const rel = path.relative(SRC_BLOG, full);
        console.log(`  Fixed ${count} inline styles in ${rel}`);
        totalFixed += count;
        filesFixed++;
      }
    }
  }
}

console.log('Stripping inline image styles from src/blog/ ...\n');
walk(SRC_BLOG);
console.log(`\nDone: removed ${totalFixed} inline styles across ${filesFixed} files.`);
