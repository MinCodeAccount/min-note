const fs = require('fs');
const path = require('path');

const blogDir = 'src/content/blog';
const files = fs.readdirSync(blogDir);

const dateMap = new Map();

const fileInfo = files.map(file => {
    const match = file.match(/^(\d{4}-\d{2}-\d{2})/);
    const date = match ? match[1] : null;
    return { name: file, date: date, ext: path.extname(file) };
}).filter(f => f.date);

fileInfo.sort((a, b) => a.name.localeCompare(b.name));

fileInfo.forEach(info => {
    let count = dateMap.get(info.date) || 0;
    count++;
    dateMap.set(info.date, count);

    const newBasename = count === 1 ? info.date : `${info.date}-${count}`;
    const newName = `${newBasename}${info.ext}`;
    
    const oldPath = path.join(blogDir, info.name);
    const newPath = path.join(blogDir, newName);
    
    if (info.name !== newName) {
        if (fs.existsSync(newPath)) {
             console.log(`Warning: ${newName} already exists. Skipping.`);
        } else {
             fs.renameSync(oldPath, newPath);
             console.log(`Renamed: ${info.name} -> ${newName}`);
        }
    }
});
