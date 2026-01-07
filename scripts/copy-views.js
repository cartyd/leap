const fs = require('fs');
const path = require('path');

function copyRecursive(src, dest) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // Read source directory
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copy views
const viewsSourceDir = path.join(__dirname, '..', 'src', 'views');
const viewsTargetDir = path.join(__dirname, '..', 'dist', 'views');
console.log('Copying views from src/views to dist/views...');
copyRecursive(viewsSourceDir, viewsTargetDir);
console.log('Views copied successfully!');

// Copy public folder
const publicSourceDir = path.join(__dirname, '..', 'public');
const publicTargetDir = path.join(__dirname, '..', 'dist', 'public');
console.log('Copying public folder...');
copyRecursive(publicSourceDir, publicTargetDir);
console.log('Public folder copied successfully!');
