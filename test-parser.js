const fs = require('fs');

// front-matter-parserが.tsファイルなので、直接テスト用の関数を作成
function parseFrontMatter(fileContents) {
  const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = fileContents.match(frontMatterRegex);
  
  if (!match) {
    return {
      data: {},
      content: fileContents
    };
  }
  
  const yamlContent = match[1];
  const markdownContent = match[2];
  
  console.log('YAML Content:');
  console.log(yamlContent);
  console.log('---');
  
  // 改良されたYAMLパーサー（ネストした構造と配列に対応）
  const data = parseYaml(yamlContent);
  
  return {
    data,
    content: markdownContent
  };
}

function parseYaml(yamlContent) {
  const lines = yamlContent.split('\n');
  const result = {};
  const stack = [{ obj: result, indent: -1 }];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue;
    }
    
    const indent = line.length - line.trimStart().length;
    console.log(`Line ${i}: indent=${indent}, line="${line}"`);
    
    // インデントレベルに基づいてスタックを調整
    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
      stack.pop();
    }
    
    const current = stack[stack.length - 1];
    
    if (trimmedLine.startsWith('- ')) {
      // 配列アイテム
      const itemValue = trimmedLine.slice(2).trim();
      console.log(`Array item: "${itemValue}"`);
      
      if (!Array.isArray(current.obj)) {
        // 親が配列でない場合、新しい配列を作成
        if (current.key && typeof current.obj === 'object' && current.obj !== null) {
          current.obj[current.key] = [];
          current.obj = current.obj[current.key];
        }
      }
      
      if (Array.isArray(current.obj)) {
        if (itemValue.includes(':')) {
          // オブジェクトアイテム
          const newObj = {};
          current.obj.push(newObj);
          stack.push({ obj: newObj, indent });
          
          const colonIndex = itemValue.indexOf(':');
          const key = itemValue.slice(0, colonIndex).trim();
          const value = itemValue.slice(colonIndex + 1).trim();
          newObj[key] = parseValue(value);
        } else if (itemValue === '|-' || itemValue === '|') {
          // マルチライン文字列の開始
          const multilineValue = parseMultilineString(lines, i + 1, indent + 2);
          current.obj.push(multilineValue.value);
          i = multilineValue.nextIndex - 1; // ループのi++を考慮
        } else {
          // 単純な値
          current.obj.push(parseValue(itemValue));
        }
      }
    } else if (trimmedLine.includes(':')) {
      // キー・バリューペア
      const colonIndex = trimmedLine.indexOf(':');
      const key = trimmedLine.slice(0, colonIndex).trim();
      const value = trimmedLine.slice(colonIndex + 1).trim();
      console.log(`Key-value: "${key}" = "${value}"`);
      
      if (typeof current.obj === 'object' && current.obj !== null && !Array.isArray(current.obj)) {
        if (value === '') {
          // 空の値は次の行でネストした構造が続く可能性
          current.obj[key] = {};
          stack.push({ obj: current.obj[key], key, indent });
        } else {
          current.obj[key] = parseValue(value);
        }
      }
    }
  }
  
  return result;
}

function parseMultilineString(lines, startIndex, expectedIndent) {
  const multilineLines = [];
  let i = startIndex;
  
  while (i < lines.length) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    if (!trimmedLine) {
      // 空行はスキップ
      multilineLines.push('');
      i++;
      continue;
    }
    
    const indent = line.length - line.trimStart().length;
    
    if (indent < expectedIndent && trimmedLine) {
      // インデントが浅くなったら終了
      break;
    }
    
    // インデントを除去して追加
    multilineLines.push(line.slice(expectedIndent) || '');
    i++;
  }
  
  return {
    value: multilineLines.join('\n').trim(),
    nextIndex: i
  };
}

function parseValue(value) {
  // 値の型を推測して変換
  if (value === 'true') {
    return true;
  } else if (value === 'false') {
    return false;
  } else if (value === 'null') {
    return null;
  } else if (/^\d+$/.test(value)) {
    return parseInt(value, 10);
  } else if (/^\d+\.\d+$/.test(value)) {
    return parseFloat(value);
  } else if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1);
  } else if (value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1);
  } else if (value.endsWith('Z') || value.includes('T')) {
    // ISO 8601日付形式の場合
    return value;
  }
  
  return value;
}

// テスト実行
const content = fs.readFileSync('./content/patch-notes/1-0.md', 'utf8');
const result = parseFrontMatter(content);
console.log('\nParsed result:');
console.log(JSON.stringify(result.data, null, 2));
