const fs = require('fs');
const path = require('path');

const blogDir = 'src/content/blog';
try {
    const files = fs.readdirSync(blogDir);
    console.log(`Found ${files.length} files`);

    const dateGroups = {};
    files.forEach(file => {
        const match = file.match(/^(\d{4}-\d{2}-\d{2})/);
        if (match) {
            const date = match[1];
            if (!dateGroups[date]) dateGroups[date] = [];
            dateGroups[date].push(file);
        }
    });

    Object.keys(dateGroups).forEach(date => {
        const group = dateGroups[date].sort();
        group.forEach((oldName, index) => {
            const ext = path.extname(oldName);
            const newName = (index === 0) ? `${date}${ext}` : `${date}-${index + 1}${ext}`;
            
            if (oldName !== newName) {
                const oldPath = path.join(blogDir, oldName);
                const newPath = path.join(blogDir, newName);
                if (!fs.existsSync(newPath)) {
                    fs.renameSync(oldPath, newPath);
                    console.log(`Renamed: ${oldName} -> ${newName}`);
                } else {
                    console.log(`Conflict: ${newName} already exists`);
                }
            }
        });
    });
} catch (err) {
    console.error('FATAL ERROR:', err.message);
    process.exit(1);
}
