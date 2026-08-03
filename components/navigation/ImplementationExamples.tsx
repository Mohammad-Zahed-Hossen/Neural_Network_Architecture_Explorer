'use client';

import React from 'react';
import Link from 'next/link';
import { KnowledgeObject } from '@/lib/knowledge/schema/knowledge-object.types';
import { Code2, ExternalLink } from 'lucide-react';

interface ImplementationExamplesProps {
  implementations: readonly KnowledgeObject[];
  className?: string;
}

export function ImplementationExamples({
  implementations,
  className = '',
}: ImplementationExamplesProps) {
  if (!implementations || implementations.length === 0) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <Code2 className="w-4 h-4 text-blue-400" />
        <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
          Code Implementation Reference
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {implementations.map((impl) => (
          <Link
            key={impl.identity.id}
            href={`/models/${impl.identity.slug}?tab=implementation`}
            className="group p-3 rounded-lg border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 transition-colors flex items-center justify-between"
          >
            <div>
              <span className="text-[10px] font-mono text-blue-400 font-bold uppercase">
                PyTorch / TensorFlow Reference
              </span>
              <h4 className="text-xs font-semibold text-zinc-100 group-hover:text-blue-300">
                {impl.identity.title} Guide
              </h4>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-blue-400 shrink-0 ml-2" />
          </Link>
        ))}
      </div>
    </div>
  );
}
