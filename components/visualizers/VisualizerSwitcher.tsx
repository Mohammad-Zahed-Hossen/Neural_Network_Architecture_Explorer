'use client';

import React from 'react';

export interface VisualizerPluginOption {
  id: string;
  name: string;
  category?: string;
}

interface VisualizerSwitcherProps {
  plugins: readonly VisualizerPluginOption[];
  activePluginId: string;
  onSelectPlugin: (id: string) => void;
}

export function VisualizerSwitcher({
  plugins,
  activePluginId,
  onSelectPlugin,
}: VisualizerSwitcherProps) {
  return (
    <div className="flex items-center gap-1.5 p-1 bg-zinc-900/80 border border-zinc-800 rounded-lg overflow-x-auto">
      {plugins.map((plugin) => {
        const isActive = plugin.id === activePluginId;
        return (
          <button
            key={plugin.id}
            onClick={() => onSelectPlugin(plugin.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              isActive
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            {plugin.name}
          </button>
        );
      })}
    </div>
  );
}
