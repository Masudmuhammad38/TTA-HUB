

import React, { useState, useCallback } from 'react';
import { generateSocialMediaPost } from '../services/geminiService';
import type { SocialMediaPostResult } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';

type Platform = 'Twitter' | 'Facebook' | 'LinkedIn' | 'Instagram';
type Tone = 'Professional' | 'Casual' | 'Witty' | 'Inspirational';

const platforms: { id: Platform; label: string }[] = [
    { id: 'Twitter', label: 'Twitter' },
    { id: 'Facebook', label: 'Facebook' },
    { id: 'LinkedIn', label: 'LinkedIn' },
    { id: 'Instagram', label: 'Instagram' },
];

const tones: { id: Tone; label: string }[] = [
    { id: 'Professional', label: 'Professional' },
    { id: 'Casual', label: 'Casual' },
    { id: 'Witty', label: 'Witty' },
    { id: 'Inspirational', label: 'Inspirational' },
];

export const SocialMediaPostGenerator: React.FC = () => {
    const [topic, setTopic] = useState<string>('Announcing the launch of our new AI-powered developer tool that helps debug code faster.');
    const [platform, setPlatform] = useState<Platform>('Twitter');
    const [tone, setTone] = useState<Tone>('Witty');
    
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [result, setResult] = useState<SocialMediaPostResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState<boolean>(false);

    const handleGenerate = useCallback(async () => {
        if (!topic.trim()) {
            setError('Please enter a topic for your post.');
            return;
        }
        setIsLoading(true);
        setResult(null);
        setError(null);
        try {
            const postResult = await generateSocialMediaPost(topic, platform, tone);
            setResult(postResult);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [topic, platform, tone]);

    const handleCopy = useCallback(() => {
        if (result?.post) {
            navigator.clipboard.writeText(result.post);
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
                            <label htmlFor="topic-input" className="block text-sm font-medium text-slate-300 mb-2">
                                What is your post about?
                            </label>
                            <textarea
                                id="topic-input"
                                rows={6}
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-3 text-sm text-slate-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                                placeholder="e.g., 'A new feature launch for our app that allows users to collaborate in real-time.'"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Platform
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {platforms.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => setPlatform(p.id)}
                                        className={`w-full text-center px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 ${
                                            platform === p.id ? 'bg-brand-primary text-white' : 'bg-gray-900/50 border border-gray-700 text-slate-300 hover:bg-gray-700'
                                        }`}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
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
                                        className={`text-center px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 ${
                                            tone === t.id ? 'bg-brand-secondary text-white' : 'bg-gray-900/50 border border-gray-700 text-slate-300 hover:bg-gray-700'
                                        }`}
                                    >
                                        {t.label}
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
                        {isLoading ? 'Generating...' : <><SparklesIcon className="w-5 h-5 mr-2" /> Generate Post</>}
                    </button>
                    {error && <p className="mt-4 text-sm text-red-400 bg-red-900/50 p-3 rounded-xl">{error}</p>}
                </div>
                
                {/* Output Panel */}
                <div className="bg-gray-900/30 rounded-3xl p-4 border border-gray-700/50 h-full min-h-[500px] flex flex-col">
                    <h3 className="text-lg font-semibold text-white mb-4 px-2">Generated Post</h3>
                    {isLoading && (
                        <div className="flex-grow flex items-center justify-center">
                            <div className="text-center">
                                <SparklesIcon className="w-10 h-10 text-brand-primary animate-pulse mx-auto"/>
                                <p className="mt-2 text-slate-400">Crafting your social media post...</p>
                            </div>
                        </div>
                    )}
                    {result && !isLoading && (
                        <div className="relative flex-grow">
                            <div className="absolute inset-0 overflow-y-auto pr-2 bg-gray-800/50 p-4 rounded-xl">
                                <p className="text-slate-200 whitespace-pre-wrap">{result.post}</p>
                            </div>
                            <button onClick={handleCopy} className="absolute top-2 right-2 p-1.5 bg-gray-700/80 hover:bg-gray-700 rounded-lg text-slate-300 transition-colors">
                                {isCopied ? <CheckIcon className="w-4 h-4 text-brand-secondary" /> : <ClipboardIcon className="w-4 h-4" />}
                            </button>
                        </div>
                    )}
                    {!result && !isLoading && (
                         <div className="flex-grow flex items-center justify-center">
                            <div className="text-center text-slate-500">
                                <p>Your generated post will appear here.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};