#!/usr/bin/env node
/**
 * One-time migration: removes stray </div> tags that appear right after
 * </section> closings inside blog post content. These extra </div> tags
 * break the <article class="post-content"> container, ejecting subsequent
 * content from the article element so CSS rules don't apply.
 */
const fs = require('fs');
const path = require('path');

const SRC_BLOG = path.resolve(__dirname, '..', 'src', 'blog');
const PATTERN = '</section></div>';
const REPLACEMENT = '</section>';

let totalFixed = 0;
let filesFixed = 0;

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) {
      walk(full);
    } else if (name.endsWith('.html')) {
      let content = fs.readFileSync(full, 'utf8');
      const count = content.split(PATTERN).length - 1;
      if (count > 0) {
        content = content.replaceAll(PATTERN, REPLACEMENT);
        fs.writeFileSync(full, content, 'utf8');
        const rel = path.relative(SRC_BLOG, full);
        console.log(`  Fixed ${count} stray </div> tags in ${rel}`);
        totalFixed += count;
        filesFixed++;
      }
    }
  }
}

console.log('Removing stray </div> after </section> in src/blog/ ...\n');
walk(SRC_BLOG);
console.log(`\nDone: removed ${totalFixed} stray </div> tags across ${filesFixed} files.`);
