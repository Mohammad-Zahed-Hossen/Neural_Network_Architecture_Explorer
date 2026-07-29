import 'server-only';

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { ModelImplementationData, ModelImplementationDataSchema } from '../schema/implementation.schema';

/**
 * Server-only function to fetch curated implementation data for a given model ID.
 * Returns null if no custom implementation JSON file exists for the requested model.
 */
export function getImplementationData(slug: string): ModelImplementationData | null {
  const filePath = join(process.cwd(), 'data/implementations', `${slug}.json`);

  if (!existsSync(filePath)) {
    return null;
  }

  try {
    const content = readFileSync(filePath, 'utf-8');
    const json = JSON.parse(content);

    const parseResult = ModelImplementationDataSchema.safeParse(json);
    if (!parseResult.success) {
      console.error(
        `Implementation schema validation failed for "${slug}":`,
        parseResult.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')
      );
      return null;
    }

    return parseResult.data;
  } catch (error) {
    console.error(`Error reading implementation for "${slug}":`, error);
    return null;
  }
}
