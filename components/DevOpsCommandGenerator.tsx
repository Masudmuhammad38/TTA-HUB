import React, { useState, useCallback } from 'react';
import { generateDevOpsCommand } from '../services/geminiService';
import type { DevOpsCommandResult } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

const platforms = [
    { value: 'Docker', label: 'Docker' },
    { value: 'Kubernetes (kubectl)', label: 'Kubernetes' },
    { value: 'AWS CLI', label: 'AWS CLI' },
    { value: 'gcloud CLI', label: 'Google Cloud CLI' },
    { value: 'Git', label: 'Git' },
];

export const DevOpsCommandGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('build a docker image from the current directory and tag it as my-app:latest');
    const [platform, setPlatform] = useState<string>('Docker');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [result, setResult] = useState<DevOpsCommandResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState<boolean>(false);

    const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) {
            setError('Please describe the command you need.');
            return;
        }
        setIsLoading(true);
        setResult(null);
        setError(null);
        try {
            const commandResult = await generateDevOpsCommand(prompt, platform);
            setResult(commandResult);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [prompt, platform]);

    const handleCopy = useCallback(() => {
        if (result?.command) {
            navigator.clipboard.writeText(result.command);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    }, [result]);

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Panel */}
                <div>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="platform-select" className="block text-sm font-medium text-slate-300 mb-2">
                                Select Platform
                            </label>
                            <div className="relative">
                                 <select
                                    id="platform-select"
                                    value={platform}
                                    onChange={(e) => setPlatform(e.target.value)}
                                    className="w-full appearance-none bg-gray-900/50 border border-gray-700 rounded-xl px-3 py-2 pr-10 text-slate-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                                >
                                    {platforms.map(p => (
                                        <option key={p.value} value={p.value} className="bg-gray-800">{p.label}</option>
                                    ))}
                                </select>
                                <ChevronDownIcon className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="prompt-input" className="block text-sm font-medium text-slate-300 mb-2">
                                Describe what you want to do
                            </label>
                            <textarea
                                id="prompt-input"
                                rows={8}
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-3 text-sm text-slate-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-colors"
                                placeholder="e.g., 'list all running docker containers'"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="mt-4 w-full flex items-center justify-center bg-brand-primary hover:bg-indigo-500 text-white font-semibold py-2.5 px-6 rounded-full transition-all duration-300 transform hover:-translate-y-0.5 disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Generating...' : <><SparklesIcon className="w-5 h-5 mr-2" /> Generate Command</>}
                    </button>
                    {error && <p className="mt-4 text-sm text-red-400 bg-red-900/50 p-3 rounded-md">{error}</p>}
                </div>
                
                {/* Output Panel */}
                <div className="bg-gray-900/30 rounded-2xl p-4 border border-gray-700/50 h-full min-h-[400px] flex flex-col">
                    <h3 className="text-lg font-semibold text-white mb-4">Generated Command</h3>
                    {isLoading && (
                        <div className="flex-grow flex items-center justify-center">
                            <div className="text-center">
                                <SparklesIcon className="w-10 h-10 text-brand-primary animate-pulse mx-auto"/>
                                <p className="mt-2 text-slate-400">AI is fetching the command...</p>
                            </div>
                        </div>
                    )}
                    {result && !isLoading && (
                        <div className="flex-grow flex flex-col space-y-6 overflow-y-auto">
                            <div>
                                <h4 className="text-md font-semibold text-slate-200 mb-2">Command</h4>
                                <div className="relative">
                                    <pre className="bg-gray-900/70 rounded-xl p-3 text-sm font-mono text-brand-secondary overflow-x-auto">
                                        <code>{result.command}</code>
                                    </pre>
                                    <button onClick={handleCopy} className="absolute top-2 right-2 p-1.5 bg-gray-700/80 hover:bg-gray-700 rounded-lg text-slate-300 transition-colors">
                                        {isCopied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <ClipboardIcon className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                             <div>
                                <h4 className="text-md font-semibold text-slate-200 mb-2">Explanation</h4>
                                <p className="text-sm text-slate-300 bg-gray-800/50 p-3 rounded-xl">{result.explanation}</p>
                            </div>
                        </div>
                    )}
                    {!result && !isLoading && (
                         <div className="flex-grow flex items-center justify-center">
                            <div className="text-center text-slate-500">
                                <p>Your generated command will appear here.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
