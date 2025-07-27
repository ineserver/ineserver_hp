// 軽量なfront matterパーサー（gray-matterの代替）
export interface ParsedMatter {
  data: Record<string, unknown>;
  content: string;
}

export function parseFrontMatter(fileContents: string): ParsedMatter {
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
  
  // 特別にパッチノート用のYAMLパーサー
  const data = parseSpecialYaml(yamlContent);
  
  return {
    data,
    content: markdownContent
  };
}

function parseSpecialYaml(yamlContent: string): Record<string, unknown> {
  const lines = yamlContent.split('\n');
  const result: Record<string, unknown> = {};
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      i++;
      continue;
    }
    
    if (trimmedLine.includes(':')) {
      const colonIndex = trimmedLine.indexOf(':');
      const key = trimmedLine.slice(0, colonIndex).trim();
      const value = trimmedLine.slice(colonIndex + 1).trim();
      
      if (key === 'sections' && value === '') {
        // sections配列の処理
        const sectionsResult = parseSections(lines, i + 1);
        result[key] = sectionsResult.sections;
        i = sectionsResult.nextIndex;
      } else {
        result[key] = parseValue(value);
        i++;
      }
    } else {
      i++;
    }
  }
  
  return result;
}

function parseSections(lines: string[], startIndex: number): { sections: unknown[]; nextIndex: number } {
  const sections: unknown[] = [];
  let i = startIndex;
  
  while (i < lines.length) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      i++;
      continue;
    }
    
    const indent = line.length - line.trimStart().length;
    
    // sections配列のインデントレベル（2スペース）でない場合は終了
    if (indent === 0) {
      break;
    }
    
    if (indent === 2 && trimmedLine.startsWith('- type:')) {
      // 新しいセクションアイテム
      const typeValue = trimmedLine.replace('- type:', '').trim();
      const section: Record<string, unknown> = { type: typeValue };
      
      // items配列を探す
      i++;
      while (i < lines.length) {
        const itemLine = lines[i];
        const itemTrimmed = itemLine.trim();
        const itemIndent = itemLine.length - itemLine.trimStart().length;
        
        if (itemIndent === 4 && itemTrimmed === 'items:') {
          // items配列の開始
          const itemsResult = parseItems(lines, i + 1);
          section.items = itemsResult.items;
          i = itemsResult.nextIndex;
          break;
        } else if (itemIndent <= 2 && itemTrimmed) {
          // 次のセクションまたは終了
          break;
        } else {
          i++;
        }
      }
      
      sections.push(section);
    } else {
      i++;
    }
  }
  
  return { sections, nextIndex: i };
}

function parseItems(lines: string[], startIndex: number): { items: string[]; nextIndex: number } {
  const items: string[] = [];
  let i = startIndex;
  
  while (i < lines.length) {
    const line = lines[i];
    const trimmedLine = line.trim();
    const indent = line.length - line.trimStart().length;
    
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      i++;
      continue;
    }
    
    // items配列のアイテムレベル（6スペース）でない場合は終了
    if (indent < 6) {
      break;
    }
    
    if (indent === 6 && trimmedLine.startsWith('- ')) {
      const itemValue = trimmedLine.slice(2).trim();
      
      if (itemValue === '|-') {
        // マルチライン文字列
        const multilineResult = parseMultilineString(lines, i + 1, 8);
        items.push(multilineResult.value);
        i = multilineResult.nextIndex;
      } else {
        // 単一行アイテム
        items.push(itemValue);
        i++;
      }
    } else {
      i++;
    }
  }
  
  return { items, nextIndex: i };
}

function parseMultilineString(lines: string[], startIndex: number, expectedIndent: number): { value: string; nextIndex: number } {
  const multilineLines: string[] = [];
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

function parseValue(value: string): unknown {
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
