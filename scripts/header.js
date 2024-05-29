import fs from "fs";

try {
  fs.writeFileSync(
    'dist/_headers.txt',
    fs.readFileSync('_headers.txt').toString()
  );

  console.log('Header copied to "dist/_headers.txt"');
} catch (e) {
  console.error(e);
}
