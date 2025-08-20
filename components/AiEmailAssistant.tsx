
import React, { useState, useCallback } from 'react';
import { generateEmail } from '../services/geminiService';
import type { EmailResult } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';

type Tone = 'Formal' | 'Casual' | 'Direct' | 'Friendly';
type Length = 'Short' | 'Medium' | 'Long';

const tones: { id: Tone; label: string }[] = [
    { id: 'Formal', label: 'Formal' },
    { id: 'Casual', label: 'Casual' },
    { id: 'Direct', label: 'Direct' },
    { id: 'Friendly', label: 'Friendly' },
];

const lengths: { id: Length; label: string }[] = [
    { id: 'Short', label: 'Short' },
    { id: 'Medium', label: 'Medium' },
    { id: 'Long', label: 'Long' },
];

export const AiEmailAssistant: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('Write an email to my manager, Sarah, asking for next Friday off for a personal appointment.');
    const [tone, setTone] = useState<Tone>('Friendly');
    const [length, setLength] = useState<Length>('Medium');
    
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [result, setResult] = useState<EmailResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState<boolean>(false);

    const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) {
            setError('Please describe the email you want to write.');
            return;
        }
        setIsLoading(true);
        setResult(null);
        setError(null);
        try {
            const emailResult = await generateEmail(prompt, tone, length);
            setResult(emailResult);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [prompt, tone, length]);

    const handleCopy = useCallback(() => {
        if (result?.body) {
            navigator.clipboard.writeText(result.body);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    }, [result]);

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Panel */}
                <div>
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="prompt-input" className="block text-sm font-medium text-slate-300 mb-2">
                                What should the email be about?
                            </label>
                            <textarea
                                id="prompt-input"
                                rows={6}
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-3 text-sm text-slate-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                                placeholder="e.g., 'Follow up on my job application for the Software Engineer role.'"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Tone of Voice
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {tones.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setTone(t.id)}
                                        className={`w-full text-center px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 ${
                                            tone === t.id ? 'bg-brand-primary text-white' : 'bg-gray-900/50 border border-gray-700 text-slate-300 hover:bg-gray-700'
                                        }`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Email Length
                            </label>
                            <div className="flex bg-gray-900/50 border border-gray-700 rounded-full p-1 space-x-1">
                                {lengths.map(l => (
                                    <button
                                        key={l.id}
                                        onClick={() => setLength(l.id)}
                                        className={`w-full text-center px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-200 ${
                                            length === l.id ? 'bg-brand-secondary text-white' : 'text-slate-300 hover:bg-gray-700'
                                        }`}
                                    >
                                        {l.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="mt-6 w-full flex items-center justify-center bg-brand-primary hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 transform hover:-translate-y-0.5 disabled:bg-gray-600"
                    >
                        {isLoading ? 'Drafting Email...' : <><SparklesIcon className="w-5 h-5 mr-2" /> Generate Email</>}
                    </button>
                    {error && <p className="mt-4 text-sm text-red-400 bg-red-900/50 p-3 rounded-xl">{error}</p>}
                </div>
                
                {/* Output Panel */}
                <div className="bg-gray-900/30 rounded-3xl p-4 border border-gray-700/50 h-full min-h-[500px] flex flex-col">
                    <h3 className="text-lg font-semibold text-white mb-4 px-2">Generated Email</h3>
                    {isLoading && (
                        <div className="flex-grow flex items-center justify-center">
                            <div className="text-center">
                                <SparklesIcon className="w-10 h-10 text-brand-primary animate-pulse mx-auto"/>
                                <p className="mt-2 text-slate-400">AI is writing your email...</p>
                            </div>
                        </div>
                    )}
                    {result && !isLoading && (
                        <div className="flex-grow flex flex-col space-y-4 overflow-y-auto pr-2">
                            <div>
                                <label className="text-sm font-semibold text-slate-300">Subject:</label>
                                <p className="mt-1 text-slate-100 bg-gray-800/50 p-3 rounded-xl">{result.subject}</p>
                            </div>
                            <div className="flex-grow flex flex-col min-h-0">
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-sm font-semibold text-slate-300">Body:</label>
                                    <button onClick={handleCopy} className="p-1.5 bg-gray-700/80 hover:bg-gray-700 rounded-lg text-slate-300 transition-colors">
                                        {isCopied ? <CheckIcon className="w-4 h-4 text-brand-secondary" /> : <ClipboardIcon className="w-4 h-4" />}
                                    </button>
                                </div>
                                <div className="flex-grow bg-gray-800/50 p-3 rounded-xl overflow-y-auto">
                                    <p className="text-slate-200 whitespace-pre-wrap">{result.body}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    {!result && !isLoading && (
                         <div className="flex-grow flex items-center justify-center">
                            <div className="text-center text-slate-500">
                                <p>Your generated email will appear here.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
