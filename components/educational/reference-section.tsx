import React from 'react';
import { BookOpen, ExternalLink } from 'lucide-react';
import { Reference } from '@/lib/types/training-dynamics';

interface ReferenceSectionProps {
  references: Reference[];
  className?: string;
}

export default function ReferenceSection({ references, className = '' }: ReferenceSectionProps) {
  if (!references || references.length === 0) return null;

  return (
    <div className={`space-y-2 border-t border-border/10 pt-4 ${className}`}>
      <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
        <BookOpen className="h-3 w-3 text-primary" />
        Key Academic References
      </span>
      <div className="space-y-2">
        {references.map((ref, idx) => (
          <div
            key={idx}
            className="flex items-start justify-between gap-2 bg-slate-900/30 border border-border/15 p-2.5 rounded-lg text-xs"
          >
            <div className="space-y-0.5">
              <p className="font-semibold text-slate-200">{ref.title}</p>
              <p className="text-[10px] text-slate-400">
                {ref.author} {ref.year ? `(${ref.year})` : ''}
              </p>
            </div>
            {ref.url && (
              <a
                href={ref.url}
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:text-primary/80 shrink-0 p-1"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
