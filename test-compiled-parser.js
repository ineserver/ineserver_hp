const { parseFrontMatter } = require('./temp/front-matter-parser.js');
const fs = require('fs');

const content = fs.readFileSync('./content/patch-notes/1-0.md', 'utf8');
const result = parseFrontMatter(content);
console.log('Parsed data:', JSON.stringify(result.data, null, 2));
