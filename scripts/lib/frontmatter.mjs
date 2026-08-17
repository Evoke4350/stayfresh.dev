export function parseFrontmatter(raw) {
  // Split into lines
  const lines = raw.split('\n');

  // Find the front-matter delimiters
  if (lines[0] !== '---') {
    throw new Error('frontmatter must start with ---');
  }

  let endIndex = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === '---') {
      endIndex = i;
      break;
    }
  }

  if (endIndex === -1) {
    throw new Error('frontmatter must end with ---');
  }

  const fmLines = lines.slice(1, endIndex);
  const bodyLines = lines.slice(endIndex + 1);

  const data = {};

  // Parse front-matter lines
  for (const line of fmLines) {
    if (!line.trim()) continue;

    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.substring(0, colonIndex).trim();
    const value = line.substring(colonIndex + 1).trim();

    // Parse value based on format
    let parsedValue;

    // Check for array [a, b, c]
    if (value.startsWith('[') && value.endsWith(']')) {
      const arrayContent = value.slice(1, -1);
      parsedValue = arrayContent.split(',').map(s => s.trim()).filter(s => s !== '');
    }
    // Check for boolean
    else if (value === 'true') {
      parsedValue = true;
    }
    else if (value === 'false') {
      parsedValue = false;
    }
    // Default to string
    else {
      parsedValue = value;
    }

    data[key] = parsedValue;
  }

  // Apply defaults
  if (!data.tags) {
    data.tags = [];
  }
  if (!('draft' in data)) {
    data.draft = false;
  }

  // Check for required fields
  const required = ['title', 'description', 'section', 'date'];
  for (const field of required) {
    if (!(field in data)) {
      throw new Error(`frontmatter missing required field: ${field}`);
    }
  }

  // Extract body (everything after the closing ---)
  const body = bodyLines.join('\n');

  return { data, body };
}
