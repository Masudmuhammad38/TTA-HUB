
import React, { useState, useCallback } from 'react';
import { summarizeText } from '../services/geminiService';
import type { TextSummaryResult } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';

type SummaryFormat = 'short' | 'medium' | 'bullets';

const summaryFormats: { id: SummaryFormat; label: string }[] = [
    { id: 'short', label: 'Short Summary' },
    { id: 'medium', label: 'Paragraph' },
    { id: 'bullets', label: 'Bulleted List' },
];

export const AiTextSummarizer: React.FC = () => {
    const [text, setText] = useState<string>('The James Webb Space Telescope (JWST) is a space telescope designed primarily to conduct infrared astronomy. As the largest optical telescope in space, its high resolution and sensitivity allow it to view objects too old, distant, or faint for the Hubble Space Telescope. This will enable a broad range of investigations across the fields of astronomy and cosmology, such as observation of the first stars and the formation of the first galaxies, and detailed atmospheric characterization of potentially habitable exoplanets.');
    const [format, setFormat] = useState<SummaryFormat>('short');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [result, setResult] = useState<TextSummaryResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState<boolean>(false);

    const handleSummarize = useCallback(async () => {
        if (!text.trim()) {
            setError('Please enter some text to summarize.');
            return;
        }
        setIsLoading(true);
        setResult(null);
        setError(null);
        try {
            const summaryResult = await summarizeText(text, format);
            setResult(summaryResult);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [text, format]);

    const handleCopy = useCallback(() => {
        if (result?.summary) {
            navigator.clipboard.writeText(result.summary);
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
                            <label htmlFor="text-input" className="block text-sm font-medium text-slate-300 mb-2">
                                Text to Summarize
                            </label>
                            <textarea
                                id="text-input"
                                rows={15}
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-3 text-sm text-slate-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-colors"
                                placeholder="Paste your article, notes, or document here..."
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Summary Format
                            </label>
                            <div className="flex bg-gray-900/50 border border-gray-700 rounded-full p-1 space-x-1">
                                {summaryFormats.map(f => (
                                    <button
                                        key={f.id}
                                        onClick={() => setFormat(f.id)}
                                        className={`w-full text-center px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-200 ${
                                            format === f.id ? 'bg-brand-primary text-white' : 'text-slate-300 hover:bg-gray-700'
                                        }`}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleSummarize}
                        disabled={isLoading}
                        className="mt-6 w-full flex items-center justify-center bg-brand-primary hover:bg-indigo-500 text-white font-semibold py-2.5 px-6 rounded-full transition-all duration-300 transform hover:-translate-y-0.5 disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Summarizing...
                            </>
                        ) : (
                             <>
                                <SparklesIcon className="w-5 h-5 mr-2" />
                                Summarize Text
                            </>
                        )}
                    </button>
                    {error && <p className="mt-4 text-sm text-red-400 bg-red-900/50 p-3 rounded-md">{error}</p>}
                </div>
                
                {/* Output Panel */}
                <div className="bg-gray-900/30 rounded-2xl p-4 border border-gray-700/50 h-full min-h-[400px] flex flex-col">
                    <h3 className="text-lg font-semibold text-white mb-4">Summary</h3>
                    {isLoading && (
                        <div className="flex-grow flex items-center justify-center">
                            <div className="text-center">
                                <SparklesIcon className="w-10 h-10 text-brand-primary animate-pulse mx-auto"/>
                                <p className="mt-2 text-slate-400">AI is condensing your text...</p>
                            </div>
                        </div>
                    )}
                    {result && !isLoading && (
                        <div className="flex-grow flex flex-col space-y-6">
                           <div className="relative flex-grow">
                                <div className="absolute inset-0 overflow-y-auto pr-2">
                                    <p className="text-slate-200 whitespace-pre-wrap">{result.summary}</p>
                                </div>
                                <button onClick={handleCopy} className="absolute top-0 right-0 p-1.5 bg-gray-700/80 hover:bg-gray-700 rounded-lg text-slate-300 transition-colors">
                                    {isCopied ? <CheckIcon className="w-4 h-4 text-brand-secondary" /> : <ClipboardIcon className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    )}
                    {!result && !isLoading && (
                         <div className="flex-grow flex items-center justify-center">
                            <div className="text-center text-slate-500">
                                <p>Your summary will appear here.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
