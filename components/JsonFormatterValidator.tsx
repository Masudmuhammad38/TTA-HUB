import React, { useState, useCallback } from 'react';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';
import { TrashIcon } from './icons/TrashIcon';

// A simple component to render syntax-highlighted JSON
const JsonSyntaxHighlighter: React.FC<{ jsonString: string }> = ({ jsonString }) => {
    const highlighted = jsonString
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') // HTML escape
        .replace(/"([^"]+)":/g, '<span class="text-pink-400">"$1"</span>:') // Keys
        .replace(/: "([^"]*)"/g, ': <span class="text-green-400">"$1"</span>') // Strings
        .replace(/: (\d+\.?\d*)/g, ': <span class="text-blue-400">$1</span>') // Numbers
        .replace(/: (true|false)/g, ': <span class="text-yellow-400">$1</span>') // Booleans
        .replace(/: (null)/g, ': <span class="text-gray-500">$1</span>'); // Null

    return <pre className="bg-gray-900/70 rounded-xl p-3 text-sm font-mono text-slate-200 h-full overflow-auto" dangerouslySetInnerHTML={{ __html: highlighted }} />;
};


export const JsonFormatterValidator: React.FC = () => {
    const [inputJson, setInputJson] = useState<string>('{"name": "John Doe", "age": 30, "isStudent": false, "courses": [{"title": "History", "credits": 3}, {"title": "Math", "credits": 4}], "address": null}');
    const [formattedJson, setFormattedJson] = useState<string>('');
    const [isValid, setIsValid] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState<boolean>(false);

    const handleFormat = useCallback(() => {
        if (!inputJson.trim()) {
            setIsValid(null);
            setError(null);
            setFormattedJson('');
            return;
        }
        try {
            const parsed = JSON.parse(inputJson);
            const formatted = JSON.stringify(parsed, null, 2);
            setFormattedJson(formatted);
            setIsValid(true);
            setError(null);
        } catch (e) {
            setFormattedJson('');
            setIsValid(false);
            setError(e instanceof Error ? e.message : 'An unknown error occurred.');
        }
    }, [inputJson]);
    
    const handleCopy = useCallback(() => {
        if (formattedJson) {
            navigator.clipboard.writeText(formattedJson);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    }, [formattedJson]);
    
    const handleClear = useCallback(() => {
        setInputJson('');
        setFormattedJson('');
        setIsValid(null);
        setError(null);
    }, []);

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Panel */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                         <label htmlFor="json-input" className="text-sm font-medium text-slate-300">
                            Your JSON Data
                        </label>
                    </div>
                    <textarea
                        id="json-input"
                        rows={20}
                        className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-3 font-mono text-sm text-slate-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-colors"
                        placeholder='Paste your JSON here...'
                        value={inputJson}
                        onChange={(e) => setInputJson(e.target.value)}
                        spellCheck="false"
                    />
                    <div className="mt-4 flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={handleFormat}
                            className="w-full flex items-center justify-center bg-brand-primary hover:bg-indigo-500 text-white font-semibold py-2.5 px-6 rounded-full transition-all duration-300"
                        >
                            Format & Validate
                        </button>
                         <button
                            onClick={handleClear}
                            className="w-full sm:w-auto flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2.5 px-6 rounded-full transition-all duration-300"
                        >
                            <TrashIcon className="w-5 h-5 mr-2" />
                            Clear
                        </button>
                    </div>
                </div>
                
                {/* Output Panel */}
                <div className="bg-gray-900/30 rounded-2xl p-4 border border-gray-700/50 h-full min-h-[400px] flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-white">Result</h3>
                        {isValid === true && <span className="text-sm font-semibold bg-green-500/20 text-green-300 px-3 py-1 rounded-full">Valid JSON</span>}
                        {isValid === false && <span className="text-sm font-semibold bg-red-500/20 text-red-300 px-3 py-1 rounded-full">Invalid JSON</span>}
                    </div>
                    
                    <div className="flex-grow flex flex-col relative">
                        {isValid === false && error && (
                             <div className="flex-grow flex items-center justify-center text-center p-4 bg-red-900/30 border border-red-500/50 rounded-2xl">
                                <div>
                                    <h4 className="font-semibold text-red-300">Validation Error:</h4>
                                    <p className="mt-2 text-sm text-slate-300 font-mono">{error}</p>
                                </div>
                            </div>
                        )}
                         {isValid === true && formattedJson && (
                             <div className="relative h-full">
                                <JsonSyntaxHighlighter jsonString={formattedJson} />
                                <button onClick={handleCopy} className="absolute top-2 right-2 p-1.5 bg-gray-700/80 hover:bg-gray-700 rounded-lg text-slate-300 transition-colors">
                                    {isCopied ? <CheckIcon className="w-4 h-4 text-brand-secondary" /> : <ClipboardIcon className="w-4 h-4" />}
                                </button>
                            </div>
                        )}
                        {isValid === null && (
                            <div className="flex-grow flex items-center justify-center">
                                <div className="text-center text-slate-500">
                                    <p>Your formatted and validated JSON will appear here.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
