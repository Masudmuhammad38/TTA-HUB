
import React, { useState, useCallback, useMemo } from 'react';
import { generateRegex } from '../services/geminiService';
import { SparklesIcon } from './icons/SparklesIcon';

export const RegexGenerator: React.FC = () => {
    const [aiPrompt, setAiPrompt] = useState<string>('match a valid email address');
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [regexPattern, setRegexPattern] = useState<string>('');
    const [regexExplanation, setRegexExplanation] = useState<string>('');
    const [testString, setTestString] = useState<string>('Try this: test@example.com or this: invalid-email@.');
    
    const handleGenerate = useCallback(async () => {
        if (!aiPrompt.trim()) {
            setError('Please enter a description for the regex.');
            return;
        }
        setIsGenerating(true);
        setError(null);
        setRegexExplanation('');

        try {
            const result = await generateRegex(aiPrompt);
            setRegexPattern(result.pattern);
            setRegexExplanation(result.explanation);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsGenerating(false);
        }
    }, [aiPrompt]);

    const { matches, isValidRegex } = useMemo(() => {
        if (!regexPattern.trim()) {
            return { matches: [], isValidRegex: true };
        }
        try {
            const regex = new RegExp(regexPattern, 'g');
            const foundMatches = testString.match(regex) || [];
            return { matches: foundMatches, isValidRegex: true };
        } catch (e) {
            return { matches: [], isValidRegex: false };
        }
    }, [regexPattern, testString]);

    const HighlightedText = useMemo(() => {
        if (!isValidRegex || !regexPattern || !testString || matches.length === 0) {
            return <>{testString}</>;
        }
        const regex = new RegExp(regexPattern, 'g');
        const parts = testString.split(regex);
        
        return (
            <>
                {parts.map((part, i) => (
                    <React.Fragment key={i}>
                        {part}
                        {i < matches.length && (
                            <span className="bg-brand-primary/40 rounded">{matches[i]}</span>
                        )}
                    </React.Fragment>
                ))}
            </>
        );
    }, [testString, regexPattern, isValidRegex, matches]);

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            {error && <p className="mb-4 text-sm text-red-400 bg-red-900/50 p-3 rounded-md">{error}</p>}
            
            {/* AI Generator Section */}
            <div className="bg-gray-800/60 rounded-2xl p-6 border border-gray-700/80">
                <h3 className="text-lg font-semibold text-white mb-4">1. Generate with AI</h3>
                <label htmlFor="ai-prompt" className="block text-sm font-medium text-slate-300 mb-2">
                    Describe the pattern you need
                </label>
                <textarea
                    id="ai-prompt"
                    rows={3}
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-3 font-mono text-sm text-slate-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                    placeholder="e.g., 'match a 10-digit phone number'"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                />
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="mt-4 w-full sm:w-auto flex items-center justify-center bg-brand-primary hover:bg-indigo-500 text-white font-semibold py-2.5 px-6 rounded-full transition-all duration-200 disabled:bg-gray-600"
                >
                    {isGenerating ? 'Generating...' : <><SparklesIcon className="w-5 h-5 mr-2" /> Generate Regex</>}
                </button>

                {isGenerating && (
                    <div className="mt-4 text-center text-slate-400">
                        <p>AI is thinking...</p>
                    </div>
                )}

                {regexExplanation && !isGenerating && (
                    <div className="mt-4 space-y-2">
                        <div>
                            <label className="text-sm font-medium text-slate-300">Generated Pattern:</label>
                            <pre className="bg-gray-900/70 rounded-xl p-3 text-sm font-mono text-brand-secondary overflow-x-auto mt-1"><code>{regexPattern}</code></pre>
                        </div>
                         <div>
                            <label className="text-sm font-medium text-slate-300">Explanation:</label>
                            <p className="text-sm text-slate-300 bg-gray-900/70 p-3 rounded-xl mt-1">{regexExplanation}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Tester Section */}
            <div className="bg-gray-800/60 rounded-2xl p-6 border border-gray-700/80">
                 <h3 className="text-lg font-semibold text-white mb-4">2. Test Your Regex</h3>
                 <div className="space-y-4">
                     <div>
                        <label htmlFor="regex-pattern-input" className="block text-sm font-medium text-slate-300 mb-2">
                            Regex Pattern
                        </label>
                        <input
                            id="regex-pattern-input"
                            type="text"
                            value={regexPattern}
                            onChange={(e) => setRegexPattern(e.target.value)}
                            className={`w-full bg-gray-900/50 border rounded-xl px-3 py-2 font-mono text-sm text-white focus:ring-2 focus:ring-brand-primary ${!isValidRegex ? 'border-red-500' : 'border-gray-700'}`}
                            placeholder="/your-regex/g"
                        />
                         {!isValidRegex && <p className="mt-1 text-xs text-red-400">Invalid regular expression.</p>}
                     </div>
                     <div>
                        <label htmlFor="test-string-input" className="block text-sm font-medium text-slate-300 mb-2">
                            Test String
                        </label>
                        <textarea
                            id="test-string-input"
                            rows={5}
                            value={testString}
                            onChange={(e) => setTestString(e.target.value)}
                            className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-3 text-sm text-slate-200 focus:ring-2 focus:ring-brand-primary"
                            placeholder="Enter text to test against..."
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                           Result ({matches.length} {matches.length === 1 ? 'match' : 'matches'})
                        </label>
                        <div className="w-full bg-gray-900/70 border border-gray-700 rounded-xl p-3 text-sm text-slate-200 min-h-[100px] whitespace-pre-wrap break-words">
                           {HighlightedText}
                        </div>
                     </div>
                      {matches.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Matched Groups
                            </label>
                            <ul className="bg-gray-900/70 rounded-xl p-3 text-sm space-y-1">
                                {matches.map((match, index) => (
                                    <li key={index} className="font-mono text-slate-300 break-all">{match}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                 </div>
            </div>
        </div>
    );
};
