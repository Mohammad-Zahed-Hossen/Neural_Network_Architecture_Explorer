import https from 'node:https';
import http from 'node:http';
import models from '../data/models.json';
import papers from '../data/papers.json';

async function checkUrl(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    const timeout = 10000; // 10 second timeout

    protocol.get(url, (res) => {
      resolve(res.statusCode !== undefined && res.statusCode < 400);
    }).on('error', () => resolve(false));

    // Set timeout
    setTimeout(() => resolve(false), timeout);
  });
}

async function validateLinks(): Promise<void> {
  const paperUrls = papers.map((p: { paperUrl?: string }) => p.paperUrl).filter(Boolean) as string[];
  const docsUrls = models.map((m: { docsUrl?: string }) => m.docsUrl).filter(Boolean) as string[];
  const allUrls = [...new Set([...paperUrls, ...docsUrls])];

  console.log(`Validating ${allUrls.length} URLs...`);
  let broken = 0;
  let checked = 0;

  for (const url of allUrls) {
    const valid = await checkUrl(url);
    checked++;
    if (!valid) {
      console.log(`BROKEN: ${url}`);
      broken++;
    }
    // Progress indicator
    if (checked % 10 === 0) {
      console.log(`Progress: ${checked}/${allUrls.length} checked...`);
    }
  }

  console.log(`\nLink validation complete!`);
  console.log(`Found ${broken} broken links out of ${allUrls.length}`);

  if (broken > 0) {
    process.exit(1);
  }
}

validateLinks();
