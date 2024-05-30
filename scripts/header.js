import fs from 'fs';

try {
  fs.writeFileSync('dist/_headers', fs.readFileSync('_headers').toString());
  console.log('Header copied to "dist/_headers"');
} catch (e) {
  console.error(e);
}
