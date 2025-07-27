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
  
  // シンプルなYAMLパーサー（基本的な形式のみ対応）
  const data: Record<string, unknown> = {};
  
  const lines = yamlContent.split('\n');
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue;
    }
    
    const colonIndex = trimmedLine.indexOf(':');
    if (colonIndex === -1) {
      continue;
    }
    
    const key = trimmedLine.slice(0, colonIndex).trim();
    let value: unknown = trimmedLine.slice(colonIndex + 1).trim();
    
    // 値の型を推測して変換
    if (value === 'true') {
      value = true;
    } else if (value === 'false') {
      value = false;
    } else if (value === 'null') {
      value = null;
    } else if (typeof value === 'string' && /^\d+$/.test(value)) {
      value = parseInt(value, 10);
    } else if (typeof value === 'string' && /^\d+\.\d+$/.test(value)) {
      value = parseFloat(value);
    } else if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    } else if (typeof value === 'string' && value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    }
    
    data[key] = value;
  }
  
  return {
    data,
    content: markdownContent
  };
}
