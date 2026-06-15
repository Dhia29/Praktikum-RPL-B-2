const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.jsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('/Users/user/Praktikum-RPL-B-2/Praktikum-RPL-B-2/src/locker_project/resources/js');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Remove imports
    content = content.replace(/import\s+\{[^}]*\}\s+from\s+['"][^'"]+globalModal['"];?\n?/g, '');

    // Replace function calls
    content = content.replace(/await\s+showCustomConfirm/g, 'window.confirm');
    content = content.replace(/showCustomConfirm/g, 'window.confirm');
    content = content.replace(/showCustomAlert/g, 'window.alert');
    
    // Remove showLoading / hideLoading calls
    content = content.replace(/showLoading\([^)]*\);?\n?/g, '');
    content = content.replace(/hideLoading\([^)]*\);?\n?/g, '');

    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log(`Updated ${file}`);
    }
});
