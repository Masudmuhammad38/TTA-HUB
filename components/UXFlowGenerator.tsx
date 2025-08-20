
import React, { useState, useCallback } from 'react';
import { generateUXFlow } from '../services/geminiService';
import type { UXFlowResult } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';

// Simple inline icons for the flow steps
const UserActionIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);

const SystemResponseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
);


export const UXFlowGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('An e-commerce app where users can browse products, add them to a cart, and checkout.');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [result, setResult] = useState<UXFlowResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) {
            setError('Please describe your application or feature.');
            return;
        }
        setIsLoading(true);
        setResult(null);
        setError(null);
        try {
            const flowResult = await generateUXFlow(prompt);
            setResult(flowResult);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [prompt]);

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Panel */}
                <div>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="prompt-input" className="block text-sm font-medium text-slate-300 mb-2">
                                Describe your App or Feature
                            </label>
                            <textarea
                                id="prompt-input"
                                rows={10}
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-3 text-sm text-slate-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-colors"
                                placeholder="e.g., A photo sharing app with social features like comments and likes."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="mt-6 w-full flex items-center justify-center bg-brand-primary hover:bg-indigo-500 text-white font-semibold py-2.5 px-6 rounded-full transition-all duration-300 transform hover:-translate-y-0.5 disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating Flow...
                            </>
                        ) : (
                             <>
                                <SparklesIcon className="w-5 h-5 mr-2" />
                                Generate UX Flow
                            </>
                        )}
                    </button>
                    {error && <p className="mt-4 text-sm text-red-400 bg-red-900/50 p-3 rounded-md">{error}</p>}
                </div>
                
                {/* Output Panel */}
                <div className="bg-gray-900/30 rounded-2xl p-4 border border-gray-700/50 h-full min-h-[500px] flex flex-col">
                    <h3 className="text-lg font-semibold text-white mb-4">User Experience Flow</h3>
                    {isLoading && (
                        <div className="flex-grow flex items-center justify-center">
                            <div className="text-center">
                                <SparklesIcon className="w-10 h-10 text-brand-primary animate-pulse mx-auto"/>
                                <p className="mt-2 text-slate-400">AI is designing the user journey...</p>
                            </div>
                        </div>
                    )}
                    {result && !isLoading && (
                        <div className="flex-grow overflow-y-auto pr-2">
                            <div className="relative pl-6">
                                {/* Vertical line for timeline */}
                                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-700" style={{ transform: 'translateX(2.5px)' }}></div>
                                <div className="space-y-8">
                                    {result.flow.map((step, index) => (
                                        <div key={index} className="relative">
                                            <div className="absolute -left-6 top-1 w-6 h-6 bg-brand-primary rounded-full flex items-center justify-center text-xs font-bold text-white ring-8 ring-gray-800/50">
                                                {step.step}
                                            </div>
                                            <div className="ml-6">
                                                <h4 className="font-semibold text-slate-100">{step.title}</h4>
                                                <div className="mt-2 space-y-3">
                                                    <div className="flex items-start">
                                                        <UserActionIcon className="w-5 h-5 text-brand-secondary flex-shrink-0 mr-3 mt-0.5" />
                                                        <p className="text-sm text-slate-300"><span className="font-semibold text-slate-200">User Action:</span> {step.userAction}</p>
                                                    </div>
                                                    <div className="flex items-start">
                                                        <SystemResponseIcon className="w-5 h-5 text-brand-secondary flex-shrink-0 mr-3 mt-0.5" />
                                                        <p className="text-sm text-slate-300"><span className="font-semibold text-slate-200">System Response:</span> {step.systemResponse}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    {!result && !isLoading && (
                         <div className="flex-grow flex items-center justify-center">
                            <div className="text-center text-slate-500">
                                <p>Your generated UX flow will appear here.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
