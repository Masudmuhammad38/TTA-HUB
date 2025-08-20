import React, { useState, useCallback } from 'react';
import { debugCode } from '../services/geminiService';
import type { DebugResult } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'csharp', label: 'C#' },
    { value: 'php', label: 'PHP' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
];

export const AiCodeDebugger: React.FC = () => {
    const [code, setCode] = useState<string>('function greet(name) {\n  console.log("Hello, " + name);\n}');
    const [language, setLanguage] = useState<string>('javascript');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [result, setResult] = useState<DebugResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState<boolean>(false);

    const handleDebug = useCallback(async () => {
        if (!code.trim()) {
            setError('Please enter some code to debug.');
            return;
        }
        setIsLoading(true);
        setResult(null);
        setError(null);
        try {
            const debugResult = await debugCode(code, language);
            setResult(debugResult);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [code, language]);

    const handleCopy = useCallback(() => {
        if (result?.fixedCode) {
            navigator.clipboard.writeText(result.fixedCode);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    }, [result]);

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <div className="flex justify-between items-center mb-2">
                         <label htmlFor="language-select" className="text-sm font-medium text-slate-300">
                            Language
                        </label>
                    </div>
                    <div className="relative">
                        <select
                            id="language-select"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full appearance-none bg-gray-900/50 border border-gray-700 rounded-xl px-3 py-2 pr-10 text-slate-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                        >
                            {languages.map(lang => (
                                <option key={lang.value} value={lang.value} className="bg-gray-800">{lang.label}</option>
                            ))}
                        </select>
                        <ChevronDownIcon className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <div className="mt-4">
                        <label htmlFor="code-input" className="block text-sm font-medium text-slate-300 mb-2">
                            Code to Debug
                        </label>
                        <textarea
                            id="code-input"
                            rows={15}
                            className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-3 font-mono text-sm text-slate-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-colors"
                            placeholder="Paste your code here..."
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleDebug}
                        disabled={isLoading}
                        className="mt-4 w-full flex items-center justify-center bg-brand-primary hover:bg-indigo-500 text-white font-semibold py-2.5 px-6 rounded-full transition-all duration-300 transform hover:-translate-y-0.5 disabled:bg-gray-600 disabled:cursor-not-allowed"
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
                                Debug Code
                            </>
                        )}
                    </button>
                    {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
                </div>
                
                <div className="bg-gray-900/30 rounded-2xl p-4 border border-gray-700/50 h-full min-h-[400px] flex flex-col">
                    <h3 className="text-lg font-semibold text-white mb-4">Analysis Result</h3>
                    {isLoading && (
                        <div className="flex-grow flex items-center justify-center">
                            <div className="text-center">
                                <SparklesIcon className="w-10 h-10 text-brand-primary animate-pulse mx-auto"/>
                                <p className="mt-2 text-slate-400">AI is analyzing your code...</p>
                            </div>
                        </div>
                    )}
                    {result && !isLoading && (
                        <div className="flex-grow flex flex-col space-y-6 overflow-y-auto">
                            {result.errors.length > 0 ? (
                                <div>
                                    <h4 className="text-md font-semibold text-slate-200 mb-2">Errors Found:</h4>
                                    <ul className="space-y-3">
                                        {result.errors.map((err, index) => (
                                            <li key={index} className="border-b border-gray-700 last:border-b-0 py-3">
                                                <p className="font-mono text-sm text-red-400">
                                                    <span className="font-bold">Line {err.line}:</span> {err.error}
                                                </p>
                                                <p className="mt-1 text-sm text-slate-300">{err.explanation}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                               <div className="flex-grow flex items-center justify-center text-center p-4 bg-brand-secondary/10 border border-brand-secondary/30 rounded-2xl">
                                    <div>
                                        <CheckIcon className="w-8 h-8 mx-auto text-brand-secondary" />
                                        <p className="font-semibold text-white mt-2">No errors found!</p>
                                        <p className="text-sm text-slate-300">Your code looks clean.</p>
                                    </div>
                                </div>
                            )}

                            <div>
                                <h4 className="text-md font-semibold text-slate-200 mb-2">Suggested Fix:</h4>
                                <div className="relative">
                                    <pre className="bg-gray-900/70 rounded-xl p-3 text-sm font-mono text-slate-200 overflow-x-auto">
                                        <code>{result.fixedCode}</code>
                                    </pre>
                                    <button onClick={handleCopy} className="absolute top-2 right-2 p-1.5 bg-gray-700/80 hover:bg-gray-700 rounded-lg text-slate-300 transition-colors">
                                        {isCopied ? <CheckIcon className="w-4 h-4 text-brand-secondary" /> : <ClipboardIcon className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    {!result && !isLoading && (
                         <div className="flex-grow flex items-center justify-center">
                            <div className="text-center text-slate-500">
                                <p>Your debug results will appear here.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};