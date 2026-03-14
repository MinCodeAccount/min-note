const { execSync } = require('child_process');
const fs = require('fs');

const commit = process.argv[2] || 'HEAD';
const file = process.argv[3] || 'src/content/blog/first-post.md';

try {
    const content = execSync(`git show ${commit}:${file}`).toString('utf8');
    console.log('--- CONTENT START ---');
    console.log(content.split('\n').slice(0, 10).join('\n'));
    console.log('--- CONTENT END ---');
} catch (e) {
    console.error('Error:', e.message);
}
