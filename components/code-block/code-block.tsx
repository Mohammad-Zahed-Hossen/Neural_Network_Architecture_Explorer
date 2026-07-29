'use client';

import React, { useState } from 'react';
import { CodeBlockProps, FrameworkType, CodeSnippet } from './code-block.types';
import { CodeBlockHeader } from './code-block-header';
import { CodeBlockMetadata } from './code-block-metadata';
import { CodeBlockHighlighter } from './code-block-highlighter';
import { CodeBlockCallouts } from './code-block-callouts';
import { CodeBlockFooter } from './code-block-footer';

export const CodeBlock: React.FC<CodeBlockProps> = ({
  modelName,
  subtitle,
  difficulty = 'Intermediate',
  isTransferLearning = true,
  implementationType,
  exampleCategory,
  isProductionReady = true,
  metadata,
  variants,
  code: defaultCode,
  language: defaultLanguage = 'python',
  framework: defaultFramework = 'tensorflow',
  filename: defaultFilename = 'model.py',
  highlightLines: defaultHighlightLines = [],
  sections: defaultSections = [],
  initialLinesVisible = 18,
  collapsible = true,
  showLineNumbers = true,
  callouts,
  footer,
  className = '',
}) => {
  // Variant Selection State (e.g., PyTorch vs TensorFlow vs HuggingFace)
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    variants && variants.length > 0 ? variants[0].id : 'default'
  );

  // Active Variant
  const activeVariant = variants?.find((v) => v.id === selectedVariantId) || variants?.[0];

  // Snippet Selection State (Multi-file tabs within selected variant)
  const activeSnippets: CodeSnippet[] = activeVariant
    ? activeVariant.snippets
    : [
        {
          id: 'single',
          filename: defaultFilename,
          language: defaultLanguage,
          framework: defaultFramework,
          code: defaultCode || '# No code provided',
          highlightLines: defaultHighlightLines,
          sections: defaultSections,
        },
      ];

  const [selectedSnippetId, setSelectedSnippetId] = useState<string>(
    activeSnippets.length > 0 ? activeSnippets[0].id : 'single'
  );

  // Active Snippet
  const activeSnippet =
    activeSnippets.find((s) => s.id === selectedSnippetId) || activeSnippets[0];

  const currentCode = activeSnippet.code;
  const currentLanguage = activeSnippet.language;
  const currentFramework: FrameworkType = activeSnippet.framework || activeVariant?.framework || defaultFramework;
  const currentFilename = activeSnippet.filename;
  const currentHighlightLines = activeSnippet.highlightLines || [];
  const currentSections = activeSnippet.sections || [];

  return (
    <div
      className={`relative my-6 overflow-hidden rounded-2xl border border-cyan-500/20 bg-slate-950/80 shadow-2xl backdrop-blur-xl transition-all hover:border-cyan-500/35 ${className}`}
    >
      {/* Header with Model Badge & Framework Tabs */}
      <CodeBlockHeader
        modelName={modelName}
        subtitle={subtitle}
        difficulty={difficulty}
        isTransferLearning={isTransferLearning}
        implementationType={implementationType}
        exampleCategory={exampleCategory}
        isProductionReady={isProductionReady}
        currentFramework={currentFramework}
        currentFilename={currentFilename}
        variants={variants}
        selectedVariantId={selectedVariantId}
        onSelectVariant={(variantId) => {
          setSelectedVariantId(variantId);
          const newVariant = variants?.find((v) => v.id === variantId);
          if (newVariant && newVariant.snippets.length > 0) {
            setSelectedSnippetId(newVariant.snippets[0].id);
          }
        }}
        snippets={activeSnippets}
        selectedSnippetId={selectedSnippetId}
        onSelectSnippet={setSelectedSnippetId}
      />

      {/* Metadata Spec Bar */}
      <CodeBlockMetadata
        metadata={metadata}
        frameworkVersion={activeSnippet.frameworkVersion}
      />

      {/* Shiki Syntax Highlighter View */}
      <CodeBlockHighlighter
        code={currentCode}
        language={currentLanguage}
        modelName={modelName}
        highlightLines={currentHighlightLines}
        sections={currentSections}
        initialLinesVisible={initialLinesVisible}
        collapsible={collapsible}
        showLineNumbers={showLineNumbers}
      />

      {/* Educational Callout Section Cards */}
      <CodeBlockCallouts callouts={callouts} />

      {/* Contextual Educational Footer */}
      <CodeBlockFooter
        footer={footer}
        codeToDownload={currentCode}
        filenameToDownload={currentFilename}
      />
    </div>
  );
};
