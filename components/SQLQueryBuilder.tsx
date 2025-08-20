
import React, { useState, useCallback } from 'react';
import { generateSqlQuery } from '../services/geminiService';
import type { SqlQueryResult } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';

const defaultSchema = `CREATE TABLE users (
  id INT PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  signup_date DATE
);

CREATE TABLE orders (
  order_id INT PRIMARY KEY,
  user_id INT,
  order_date DATE,
  amount DECIMAL(10, 2),
  FOREIGN KEY (user_id) REFERENCES users(id)
);`;

export const SQLQueryBuilder: React.FC = () => {
    const [prompt, setPrompt] = useState<string>("Get the name and email of users who signed up in the last 7 days and made an order worth more than $100.");
    const [schema, setSchema] = useState<string>(defaultSchema);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [result, setResult] = useState<SqlQueryResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState<boolean>(false);

    const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) {
            setError('Please describe the query you need.');
            return;
        }
        setIsLoading(true);
        setResult(null);
        setError(null);
        try {
            const queryResult = await generateSqlQuery(prompt, schema);
            setResult(queryResult);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [prompt, schema]);

    const handleCopy = useCallback(() => {
        if (result?.query) {
            navigator.clipboard.writeText(result.query);
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
                            <label htmlFor="schema-input" className="block text-sm font-medium text-slate-300 mb-2">
                                Database Schema (Optional)
                            </label>
                            <textarea
                                id="schema-input"
                                rows={8}
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-3 font-mono text-sm text-slate-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-colors"
                                placeholder="Paste your CREATE TABLE statements here..."
                                value={schema}
                                onChange={(e) => setSchema(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="prompt-input" className="block text-sm font-medium text-slate-300 mb-2">
                                Describe Your Query
                            </label>
                            <textarea
                                id="prompt-input"
                                rows={4}
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-3 text-sm text-slate-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-colors"
                                placeholder="e.g., 'Find all users from California with more than 5 orders'"
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
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating Query...
                            </>
                        ) : (
                             <>
                                <SparklesIcon className="w-5 h-5 mr-2" />
                                Generate SQL Query
                            </>
                        )}
                    </button>
                    {error && <p className="mt-4 text-sm text-red-400 bg-red-900/50 p-3 rounded-md">{error}</p>}
                </div>
                
                {/* Output Panel */}
                <div className="bg-gray-900/30 rounded-2xl p-4 border border-gray-700/50 h-full min-h-[400px] flex flex-col">
                    <h3 className="text-lg font-semibold text-white mb-4">Generated Query</h3>
                    {isLoading && (
                        <div className="flex-grow flex items-center justify-center">
                            <div className="text-center">
                                <SparklesIcon className="w-10 h-10 text-brand-primary animate-pulse mx-auto"/>
                                <p className="mt-2 text-slate-400">AI is building your query...</p>
                            </div>
                        </div>
                    )}
                    {result && !isLoading && (
                        <div className="flex-grow flex flex-col space-y-6 overflow-y-auto">
                            <div>
                                <h4 className="text-md font-semibold text-slate-200 mb-2">SQL Query</h4>
                                <div className="relative">
                                    <pre className="bg-gray-900/70 rounded-xl p-3 text-sm font-mono text-brand-secondary overflow-x-auto">
                                        <code>{result.query}</code>
                                    </pre>
                                    <button onClick={handleCopy} className="absolute top-2 right-2 p-1.5 bg-gray-700/80 hover:bg-gray-700 rounded-lg text-slate-300 transition-colors">
                                        {isCopied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <ClipboardIcon className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                             <div>
                                <h4 className="text-md font-semibold text-slate-200 mb-2">Explanation</h4>
                                <p className="text-sm text-slate-300">{result.explanation}</p>
                            </div>
                        </div>
                    )}
                    {!result && !isLoading && (
                         <div className="flex-grow flex items-center justify-center">
                            <div className="text-center text-slate-500">
                                <p>Your generated SQL query will appear here.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
