import { knowledgeRepository } from '@/lib/knowledge/repository/repository';
import type { KnowledgeObjectType } from '@/lib/knowledge/schema/knowledge-object.types';

export interface EntityLinkInfo {
  id: string;
  slug: string;
  title: string;
  type: KnowledgeObjectType;
  href: string;
  isKnown: boolean;
}

/**
 * Resolves any entity ID, slug, or title string to its canonical application route.
 */
export function resolveEntityLink(identifier: string, typeHint?: KnowledgeObjectType): EntityLinkInfo {
  if (!identifier) {
    return {
      id: '',
      slug: '',
      title: 'Unknown Entity',
      type: (typeHint || 'model') as KnowledgeObjectType,
      href: '#',
      isKnown: false,
    };
  }

  // 1. Check exact lookup in Knowledge Repository
  const directObj = knowledgeRepository.getKnowledgeObject(identifier);
  if (directObj) {
    return buildLinkInfo(directObj);
  }

  // 2. Search by title match in Knowledge Repository
  const allObjects = knowledgeRepository.getKnowledgeObjects();
  const titleMatch = allObjects.find(
    (o) => o.identity.title.toLowerCase() === identifier.toLowerCase() ||
           o.identity.slug.toLowerCase() === identifier.toLowerCase()
  );
  if (titleMatch) {
    return buildLinkInfo(titleMatch);
  }

  // 3. Fallback resolution for raw slugs or unknown items
  const cleanToken = identifier
    .replace(/^(model|pattern|paper|concept):/, '')
    .trim();
  const slug = cleanToken.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  let inferredType: KnowledgeObjectType = typeHint || 'model';
  if (identifier.startsWith('paper:') || identifier.toLowerCase().includes('paper')) {
    inferredType = 'paper';
  } else if (identifier.startsWith('pattern:') || identifier.toLowerCase().includes('residual') || identifier.toLowerCase().includes('attention')) {
    inferredType = 'pattern';
  } else if (identifier.startsWith('concept:')) {
    inferredType = 'concept';
  }

  const href = getHrefForType(slug, inferredType);

  return {
    id: identifier,
    slug,
    title: cleanToken || identifier,
    type: inferredType,
    href,
    isKnown: false,
  };
}

import type { KnowledgeObject } from '@/lib/knowledge/schema/knowledge-object.types';

function buildLinkInfo(obj: KnowledgeObject): EntityLinkInfo {
  const type = obj.identity.type as KnowledgeObjectType;
  const slug = obj.identity.slug;
  const href = getHrefForType(slug, type);

  return {
    id: obj.identity.id,
    slug,
    title: obj.identity.title,
    type,
    href,
    isKnown: true,
  };
}

function getHrefForType(slug: string, type: KnowledgeObjectType): string {
  switch (type) {
    case 'model':
      return `/models/${slug}`;
    case 'paper':
      return `/papers/${slug}`;
    case 'pattern':
      return `/architecture-patterns#${slug}`;
    case 'concept':
      return `/concepts/training-dynamics?concept=${slug}`;
    default:
      return `/models/${slug}`;
  }
}
