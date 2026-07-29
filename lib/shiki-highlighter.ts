import { codeToHtml } from 'shiki';

export interface HighlightOptions {
  code: string;
  language?: string;
  theme?: string;
  highlightLines?: number[];
  showLineNumbers?: boolean;
}

export interface HighlightedLine {
  lineIndex: number; // 1-indexed
  content: string;
  isHighlighted: boolean;
}

/**
 * Highlights code using Shiki with theme matching the app's glassmorphism style.
 */
export async function highlightCode({
  code,
  language = 'python',
  theme = 'one-dark-pro',
  highlightLines = [],
}: HighlightOptions): Promise<{ html: string; rawLines: string[] }> {
  const normalizedLang = mapLanguage(language);
  const rawLines = code.split('\n');

  try {
    const html = await codeToHtml(code, {
      lang: normalizedLang,
      theme: theme,
      transformers: [
        {
          line(node, line) {
            // line is 1-indexed in Shiki
            if (highlightLines.includes(line)) {
              const currentClass = (node.properties.class as string) || '';
              node.properties.class = currentClass ? `${currentClass} highlighted-line` : 'highlighted-line';
            }
            node.properties['data-line-number'] = line;
          },
        },
      ],
    });

    return { html, rawLines };
  } catch (error) {
    console.warn(`Shiki syntax highlighting fallback for language "${language}":`, error);
    // Fallback escaped HTML
    const escaped = escapeHtml(code);
    const fallbackHtml = `<pre class="shiki"><code>${escaped}</code></pre>`;
    return { html: fallbackHtml, rawLines };
  }
}

function mapLanguage(lang: string): string {
  const lower = lang.toLowerCase();
  if (lower === 'tf' || lower === 'tensorflow' || lower === 'keras' || lower === 'pytorch') {
    return 'python';
  }
  if (lower === 'sh' || lower === 'shell' || lower === 'terminal') {
    return 'bash';
  }
  if (lower === 'yml') return 'yaml';
  return lower;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
