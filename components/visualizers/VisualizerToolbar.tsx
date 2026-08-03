'use client';

import React from 'react';
import { VisualizerSwitcher, VisualizerPluginOption } from './VisualizerSwitcher';

interface VisualizerToolbarProps {
  plugins: readonly VisualizerPluginOption[];
  activePluginId: string;
  onSelectPlugin: (id: string) => void;
  statusText?: string;
  onResetView?: () => void;
}

export function VisualizerToolbar({
  plugins,
  activePluginId,
  onSelectPlugin,
  statusText = 'Live Engine Snapshot',
  onResetView,
}: VisualizerToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-zinc-950/80 border-b border-zinc-800/80 rounded-t-xl">
      <VisualizerSwitcher
        plugins={plugins}
        activePluginId={activePluginId}
        onSelectPlugin={onSelectPlugin}
      />
      <div className="flex items-center gap-2 text-xs text-zinc-400">
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          {statusText}
        </span>
        {onResetView && (
          <button
            onClick={onResetView}
            className="px-2.5 py-1 text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800 rounded-md hover:bg-zinc-800 transition-colors"
          >
            Reset View
          </button>
        )}
      </div>
    </div>
  );
}
