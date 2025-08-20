import React, { useState, useCallback } from 'react';
import { generateGitCommit } from '../services/geminiService';
import type { GitCommitResult } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';

export const GitCommitGenerator: React.FC = () => {
    const [description, setDescription] = useState<string>('Added a new button to the user profile page that allows users to delete their account. It also includes a confirmation modal before deletion.');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [result, setResult] = useState<GitCommitResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState<boolean>(false);

    const fullCommitMessage = result 
        ? `${result.type}${result.scope ? `(${result.scope})` : ''}: ${result.subject}\n\n${result.body}`
        : '';

    const handleGenerate = useCallback(async () => {
        if (!description.trim()) {
            setError('Please describe your changes.');
            return;
        }
        setIsLoading(true);
        setResult(null);
        setError(null);
        try {
            const commitResult = await generateGitCommit(description);
            setResult(commitResult);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [description]);

    const handleCopy = useCallback(() => {
        if (fullCommitMessage) {
            navigator.clipboard.writeText(fullCommitMessage);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    }, [fullCommitMessage]);

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Panel */}
                <div>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="description-input" className="block text-sm font-medium text-slate-300 mb-2">
                                Describe Your Changes
                            </label>
                            <textarea
                                id="description-input"
                                rows={10}
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-3 text-sm text-slate-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-colors"
                                placeholder="e.g., 'Fixed a bug where the login button was not working on mobile devices.'"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="mt-4 w-full flex items-center justify-center bg-brand-primary hover:bg-indigo-500 text-white font-semibold py-2.5 px-6 rounded-full transition-all duration-300 transform hover:-translate-y-0.5 disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating...
                            </>
                        ) : (
                             <>
                                <SparklesIcon className="w-5 h-5 mr-2" />
                                Generate Commit Message
                            </>
                        )}
                    </button>
                    {error && <p className="mt-4 text-sm text-red-400 bg-red-900/50 p-3 rounded-md">{error}</p>}
                </div>
                
                {/* Output Panel */}
                <div className="bg-gray-900/30 rounded-2xl p-4 border border-gray-700/50 h-full min-h-[400px] flex flex-col">
                    <h3 className="text-lg font-semibold text-white mb-4">Generated Commit</h3>
                    {isLoading && (
                        <div className="flex-grow flex items-center justify-center">
                            <div className="text-center">
                                <SparklesIcon className="w-10 h-10 text-brand-primary animate-pulse mx-auto"/>
                                <p className="mt-2 text-slate-400">AI is writing your commit message...</p>
                            </div>
                        </div>
                    )}
                    {result && !isLoading && (
                        <div className="flex-grow flex flex-col space-y-4">
                            <div className="relative">
                                <pre className="bg-gray-900/70 rounded-xl p-3 text-sm font-mono text-slate-200 overflow-x-auto whitespace-pre-wrap">
                                    <code>{fullCommitMessage}</code>
                                </pre>
                                <button onClick={handleCopy} className="absolute top-2 right-2 p-1.5 bg-gray-700/80 hover:bg-gray-700 rounded-lg text-slate-300 transition-colors">
                                    {isCopied ? <CheckIcon className="w-4 h-4 text-brand-secondary" /> : <ClipboardIcon className="w-4 h-4" />}
                                </button>
                            </div>
                             <div className="bg-gray-800/50 p-3 rounded-xl space-y-2 text-sm">
                                <div><span className="font-semibold text-slate-400 w-16 inline-block">Type:</span> <span className="font-mono text-brand-secondary">{result.type}</span></div>
                                {result.scope && <div><span className="font-semibold text-slate-400 w-16 inline-block">Scope:</span> <span className="font-mono text-brand-secondary">{result.scope}</span></div>}
                                <div><span className="font-semibold text-slate-400 w-16 inline-block">Subject:</span> <span className="text-slate-200">{result.subject}</span></div>
                            </div>
                        </div>
                    )}
                    {!result && !isLoading && (
                         <div className="flex-grow flex items-center justify-center">
                            <div className="text-center text-slate-500">
                                <p>Your generated commit message will appear here.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};