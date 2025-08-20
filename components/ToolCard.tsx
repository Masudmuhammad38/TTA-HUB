
import React from 'react';
import type { Tool } from '../types';

interface ToolCardProps {
  tool: Tool;
  onSelect: () => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onSelect }) => {
  const Icon = tool.icon;
  return (
    <button
      onClick={onSelect}
      className="bg-gray-800 p-6 rounded-2xl border border-gray-700 hover:border-brand-primary/50 hover:bg-gray-800/50 transition-all duration-200 cursor-pointer flex flex-col text-left w-full h-full"
    >
      <div className="flex items-start space-x-4 mb-4">
        <div className="bg-gray-700 p-3 rounded-lg flex-shrink-0">
           <Icon className="w-6 h-6 text-slate-300" />
        </div>
        <div>
          <h3 className="text-md font-semibold text-slate-100">{tool.name}</h3>
          <p className="text-slate-400 text-sm mt-1">{tool.description}</p>
        </div>
      </div>
    </button>
  );
};
