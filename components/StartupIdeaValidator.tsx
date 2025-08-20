
import React, { useState, useCallback } from 'react';
import { validateStartupIdea } from '../services/geminiService';
import type { StartupValidationResult } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { CheckIcon } from './icons/CheckIcon';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';
import { ArrowRightIcon } from './icons/ArrowRightIcon';

export const StartupIdeaValidator: React.FC = () => {
    const [idea, setIdea] = useState<string>('A mobile app that connects local artisans in Ghana with international buyers using AI-powered logistics.');
    const [market, setMarket] = useState<string>('Ghana, with plans to expand to Nigeria and Kenya.');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [result, setResult] = useState<StartupValidationResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleValidation = useCallback(async () => {
        if (!idea.trim() || !market.trim()) {
            setError('Please provide both a startup idea and a target market.');
            return;
        }
        setIsLoading(true);
        setResult(null);
        setError(null);
        try {
            const validationResult = await validateStartupIdea(idea, market);
            setResult(validationResult);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [idea, market]);

    const getScoreColor = (score: number) => {
        if (score >= 8) return 'text-green-400';
        if (score >= 5) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Panel */}
                <div>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="idea-input" className="block text-sm font-medium text-slate-300 mb-2">
                                Your Startup Idea
                            </label>
                            <textarea
                                id="idea-input"
                                rows={5}
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-3 text-sm text-slate-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-colors"
                                placeholder="Describe your business idea clearly and concisely..."
                                value={idea}
                                onChange={(e) => setIdea(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="market-input" className="block text-sm font-medium text-slate-300 mb-2">
                                Target Market
                            </label>
                            <input
                                id="market-input"
                                type="text"
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-3 text-sm text-slate-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-colors"
                                placeholder="e.g., Nigeria, Kenya, Pan-African"
                                value={market}
                                onChange={(e) => setMarket(e.target.value)}
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleValidation}
                        disabled={isLoading}
                        className="mt-6 w-full flex items-center justify-center bg-brand-primary hover:bg-indigo-500 text-white font-semibold py-2.5 px-6 rounded-full transition-all duration-300 transform hover:-translate-y-0.5 disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Analyzing...
                            </>
                        ) : (
                             <>
                                <SparklesIcon className="w-5 h-5 mr-2" />
                                Validate My Idea
                            </>
                        )}
                    </button>
                    {error && <p className="mt-4 text-sm text-red-400 bg-red-900/50 p-3 rounded-md">{error}</p>}
                </div>
                
                {/* Output Panel */}
                <div className="bg-gray-900/30 rounded-2xl p-4 border border-gray-700/50 h-full min-h-[400px] flex flex-col">
                    <h3 className="text-lg font-semibold text-white mb-4">Validation Report</h3>
                    {isLoading && (
                        <div className="flex-grow flex items-center justify-center">
                            <div className="text-center">
                                <SparklesIcon className="w-10 h-10 text-brand-primary animate-pulse mx-auto"/>
                                <p className="mt-2 text-slate-400">AI is evaluating your idea...</p>
                            </div>
                        </div>
                    )}
                    {result && !isLoading && (
                        <div className="flex-grow flex flex-col space-y-6 overflow-y-auto pr-2">
                           <div className="text-center bg-gray-800/80 p-6 rounded-2xl border border-gray-700">
                                <h4 className="text-sm font-medium text-slate-300">Feasibility Score</h4>
                                <p className={`text-5xl font-bold ${getScoreColor(result.feasibilityScore)}`}>
                                    {result.feasibilityScore}/10
                                </p>
                           </div>
                            
                            <div>
                                <h4 className="flex items-center text-md font-semibold text-green-400 mb-2">
                                    <LightbulbIcon className="w-5 h-5 mr-2" />
                                    Opportunities
                                </h4>
                                <ul className="space-y-2">
                                    {result.opportunities.map((item, index) => (
                                        <li key={index} className="flex items-start text-sm text-slate-300">
                                            <CheckIcon className="w-4 h-4 mr-2 mt-1 text-green-500 flex-shrink-0" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                             <div>
                                <h4 className="flex items-center text-md font-semibold text-red-400 mb-2">
                                    <AlertTriangleIcon className="w-5 h-5 mr-2" />
                                    Potential Risks
                                </h4>
                                 <ul className="space-y-2">
                                    {result.risks.map((item, index) => (
                                        <li key={index} className="flex items-start text-sm text-slate-300">
                                            <AlertTriangleIcon className="w-4 h-4 mr-2 mt-1 text-red-500 flex-shrink-0" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="flex items-center text-md font-semibold text-brand-primary mb-2">
                                    <ArrowRightIcon className="w-5 h-5 mr-2" />
                                    Actionable Next Steps
                                </h4>
                                 <ul className="space-y-2">
                                    {result.nextSteps.map((item, index) => (
                                        <li key={index} className="flex items-start text-sm text-slate-300">
                                            <ArrowRightIcon className="w-4 h-4 mr-2 mt-1 text-brand-primary flex-shrink-0" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                    {!result && !isLoading && (
                         <div className="flex-grow flex items-center justify-center">
                            <div className="text-center text-slate-500">
                                <p>Your validation report will appear here.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
