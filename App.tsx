import React, { useState, useMemo } from 'react';
import { AiCodeDebugger } from './components/AiCodeDebugger';
import { ApiEndpointTester } from './components/ApiEndpointTester';
import { RegexGenerator } from './components/RegexGenerator';
import { SQLQueryBuilder } from './components/SQLQueryBuilder';
import { StartupIdeaValidator } from './components/StartupIdeaValidator';
import { CareerPathBuilder } from './components/CareerPathBuilder';
import { AiTextSummarizer } from './components/AiTextSummarizer';
import { SocialMediaPostGenerator } from './components/SocialMediaPostGenerator';
import { AiEmailAssistant } from './components/AiEmailAssistant';
import { AiContentImprover } from './components/AiContentImprover';
import { Tool, ToolCategory } from './types';
import { TOOLS } from './constants';
import { ToolCard } from './components/ToolCard';
import { ResumeCoverLetterGenerator } from './components/ResumeCoverLetterGenerator';
import { UXFlowGenerator } from './components/UXFlowGenerator';
import { JsonFormatterValidator } from './components/JsonFormatterValidator';
import { GitCommitGenerator } from './components/GitCommitGenerator';
import { DevOpsCommandGenerator } from './components/DevOpsCommandGenerator';

import { FilterIcon } from './components/icons/FilterIcon';
import { CodeIcon } from './components/icons/CodeIcon';
import { LightbulbIcon } from './components/icons/LightbulbIcon';
import { BriefcaseIcon } from './components/icons/BriefcaseIcon';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { SearchIcon } from './components/icons/SearchIcon';

const TTA_LOGO_URL = 'https://media.licdn.com/dms/image/D4D0BAQG0YwE5X-YvhA/company-logo_200_200/0/1715809747953/talktechafrica_logo?e=2147483647&v=beta&t=xH1gO9eWjM3sA0vF5bY2bZ_4jX8yY9eW8zX8kL4rW4s';

const categoryIcons: Record<ToolCategory, React.FC<React.SVGProps<SVGSVGElement>>> = {
  [ToolCategory.Developers]: CodeIcon,
  [ToolCategory.Startups]: LightbulbIcon,
  [ToolCategory.Career]: BriefcaseIcon,
  [ToolCategory.Everyday]: SparklesIcon,
};
const categoryOrder = [ToolCategory.Developers, ToolCategory.Startups, ToolCategory.Career, ToolCategory.Everyday];


const App: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<ToolCategory | 'all'>(ToolCategory.Developers);
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTools = useMemo(() => {
    return TOOLS.filter(tool => {
      const categoryMatch = activeCategory === 'all' || tool.category === activeCategory;
      const searchMatch = searchQuery === '' ||
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      return categoryMatch && searchMatch;
    });
  }, [activeCategory, searchQuery]);


  const renderActiveTool = () => {
    if (!activeTool) return null;

    switch (activeTool.id) {
      case 'ai-code-debugger':
        return <AiCodeDebugger />;
      case 'api-endpoint-tester':
        return <ApiEndpointTester />;
      case 'regex-generator':
        return <RegexGenerator />;
      case 'sql-query-builder':
        return <SQLQueryBuilder />;
      case 'json-formatter-validator':
        return <JsonFormatterValidator />;
      case 'git-commit-generator':
        return <GitCommitGenerator />;
      case 'devops-command-generator':
        return <DevOpsCommandGenerator />;
      case 'startup-idea-validator':
        return <StartupIdeaValidator />;
      case 'social-media-post-generator':
        return <SocialMediaPostGenerator />;
      case 'ai-content-improver':
        return <AiContentImprover />;
      case 'ux-flow-generator':
        return <UXFlowGenerator />;
      case 'career-path-builder':
        return <CareerPathBuilder />;
      case 'resume-cover-letter-generator':
        return <ResumeCoverLetterGenerator />;
      case 'ai-text-summarizer':
        return <AiTextSummarizer />;
      case 'ai-email-assistant':
        return <AiEmailAssistant />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gray-800/50 rounded-2xl">
            <h2 className="text-2xl font-bold text-slate-50 mb-2">{activeTool.name}</h2>
            <p className="text-slate-400">This tool is under construction. Come back soon!</p>
          </div>
        );
    }
  };

  const handleBack = () => {
    setActiveTool(null);
  }

  const ToolHubView = () => (
    <>
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-50">AI Hub</h1>
        <p className="mt-4 text-lg text-slate-300">
          Explore over 20 free AI-powered tools from Talk Tech Africa to boost your productivity.
        </p>
      </div>

      <div className="mt-8 max-w-xl mx-auto w-full">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="search"
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-full border-0 bg-gray-800 py-3 pl-12 pr-4 text-slate-100 placeholder:text-gray-400 ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-brand-primary"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-center flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory('all')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${activeCategory === 'all'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-800 text-slate-300 hover:bg-gray-700 hover:text-white'
            }`}
        >
          <FilterIcon className="w-4 h-4" />
          All
        </button>
        {categoryOrder.map(category => {
          const Icon = categoryIcons[category];
          return (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${activeCategory === category
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-slate-300 hover:bg-gray-700 hover:text-white'
                }`}
            >
              <Icon className="w-4 h-4" />
              {category === ToolCategory.Developers ? "Developer" : category.split('&')[0]}
            </button>
          )
        })}
      </div>

      <div className="mt-12">
        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map(tool => (
              <ToolCard key={tool.id} tool={tool} onSelect={() => setActiveTool(tool)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-slate-400">No tools found matching your search.</p>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-900 font-sans text-slate-50 flex flex-col">
      <header className="bg-gray-900/80 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <img className="h-8 w-8 rounded-full" src={TTA_LOGO_URL} alt="Talk Tech Africa Logo" />
               <span className="text-lg font-medium text-slate-50">Talk Tech Africa</span>
            </div>
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-300">
              <a href="#" className="hover:text-white transition-colors">Developers</a>
              <a href="#" className="hover:text-white transition-colors">Creators</a>
              <a href="#" className="hover:text-white transition-colors">Education</a>
              <a href="#" className="hover:text-white transition-colors">By Talk Tech Africa</a>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {activeTool ? (
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <button onClick={handleBack} className="text-sm font-medium text-brand-primary hover:underline">
                &larr; Back to all tools
              </button>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-50 mt-2">{activeTool.name}</h1>
              <p className="mt-1 text-slate-300 max-w-3xl">{activeTool.description}</p>
            </div>
            <div className="bg-gray-800/50 rounded-3xl shadow-lg border border-gray-700 min-h-[600px]">
              {renderActiveTool()}
            </div>
          </div>
        ) : (
          <ToolHubView />
        )}
      </main>
      <footer className="py-4 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} Talk Tech Africa. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
