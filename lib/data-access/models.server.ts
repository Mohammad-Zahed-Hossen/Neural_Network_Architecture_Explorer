import 'server-only';

import { readFileSync } from 'fs';
import { join } from 'path';
import { NeuralNetworkModel, NeuralNetworkModelSchema } from '../schema/model.schema';

export function getModel(id: string): NeuralNetworkModel {
  const modelPath = join(process.cwd(), 'data/models', `${id}.json`);
  const content = readFileSync(modelPath, 'utf-8');
  const model = JSON.parse(content);

  const validationResult = NeuralNetworkModelSchema.safeParse(model);
  if (!validationResult.success) {
    throw new Error(
      `Model "${id}" failed validation: ${validationResult.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join('; ')}`
    );
  }

  return validationResult.data;
}
