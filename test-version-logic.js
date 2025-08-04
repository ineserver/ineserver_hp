const versionString = '1.21.3-1.21.7';
const protocol = 771;

// バージョン範囲を解析
function parseVersionRange(versionString) {
  const rangeMatch = versionString.match(/^(\d+\.\d+(?:\.\d+)?)-(\d+\.\d+(?:\.\d+)?)$/);
  if (rangeMatch) {
    return {
      min: rangeMatch[1],
      max: rangeMatch[2]
    };
  }
  return null;
}

console.log('Version string:', versionString);
console.log('Protocol:', protocol);
console.log('Parsed range:', parseVersionRange(versionString));

// 1.21.4が範囲内にあるかチェック
const range = parseVersionRange(versionString);
if (range) {
  console.log('Range detected:', range.min, 'to', range.max);
  console.log('1.21.4 is in range:', '1.21.4' >= range.min && '1.21.4' <= range.max);
}
