import fs from "fs";

try {
  fs.writeFileSync(
    'dist/_headers',
    fs.readFileSync('_headers').toString()
  );

  console.log('Header copied to "dist/_headers.txt"');
} catch (e) {
  console.error(e);
}
