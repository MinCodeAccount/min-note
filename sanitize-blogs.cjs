const fs = require('fs');
const path = require('path');

const blogDir = 'src/content/blog';
const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));

files.forEach(file => {
    const filePath = path.join(blogDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    const newContent = content.replace(/<\/p>&mdash;/g, '&mdash;');
    
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Sanitized and saved (UTF-8): ${file}`);
});
