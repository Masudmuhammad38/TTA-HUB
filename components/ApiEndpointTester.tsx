import React, { useState, useCallback } from 'react';
import { generateApiRequest } from '../services/geminiService';
import type { ApiRequestTemplate, ApiResponse } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { SendIcon } from './icons/SendIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const BODY_METHODS = ['POST', 'PUT', 'PATCH'];

export const ApiEndpointTester: React.FC = () => {
    // AI state
    const [aiPrompt, setAiPrompt] = useState<string>('Create a POST request to reqres.in to create a new user named Morpheus who is a leader.');
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    
    // Request State
    const [url, setUrl] = useState<string>('https://reqres.in/api/users');
    const [method, setMethod] = useState<string>('GET');
    const [headers, setHeaders] = useState<{ id: number, key: string, value: string }[]>([{ id: 1, key: 'Content-Type', value: 'application/json' }]);
    const [body, setBody] = useState<string>('');
    
    // Response State
    const [response, setResponse] = useState<ApiResponse | null>(null);
    const [isSending, setIsSending] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // UI State
    const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('ai');
    const [responseTab, setResponseTab] = useState<'body' | 'headers'>('body');
    const [isCopied, setIsCopied] = useState<boolean>(false);

    const handleAddHeader = () => {
        setHeaders([...headers, { id: Date.now(), key: '', value: '' }]);
    };
    
    const handleRemoveHeader = (id: number) => {
        setHeaders(headers.filter(h => h.id !== id));
    };

    const handleHeaderChange = (id: number, field: 'key' | 'value', value: string) => {
        setHeaders(headers.map(h => h.id === id ? { ...h, [field]: value } : h));
    };

    const handleGenerate = useCallback(async () => {
        if (!aiPrompt.trim()) {
            setError('Please enter a description to generate a request.');
            return;
        }
        setIsGenerating(true);
        setError(null);
        try {
            const template = await generateApiRequest(aiPrompt);
            setUrl(template.url);
            setMethod(template.method.toUpperCase());
            setBody(template.body || '');
            const headerArray = Object.entries(template.headers || {}).map(([key, value], index) => ({ id: index, key, value }));
            setHeaders(headerArray);
            setActiveTab('manual');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsGenerating(false);
        }
    }, [aiPrompt]);

    const handleSend = useCallback(async () => {
        setIsSending(true);
        setError(null);
        setResponse(null);
        
        const requestHeaders: Record<string, string> = {};
        headers.forEach(h => {
            if (h.key.trim()) {
                requestHeaders[h.key.trim()] = h.value.trim();
            }
        });

        try {
            const options: RequestInit = {
                method,
                headers: requestHeaders,
            };

            if (BODY_METHODS.includes(method) && body.trim()) {
                options.body = body;
            }

            const res = await fetch(url, options);

            const responseHeaders: Record<string, string> = {};
            res.headers.forEach((value, key) => {
                responseHeaders[key] = value;
            });

            let responseBody: any;
            const contentType = res.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                responseBody = await res.json();
            } else {
                responseBody = await res.text();
            }
            
            setResponse({
                status: res.status,
                statusText: res.statusText,
                headers: responseHeaders,
                body: responseBody,
            });

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred. This might be a CORS issue. Check the browser console for details.');
        } finally {
            setIsSending(false);
        }
    }, [url, method, headers, body]);

    const handleCopyResponse = useCallback(() => {
        if (response?.body) {
            const bodyString = typeof response.body === 'string' ? response.body : JSON.stringify(response.body, null, 2);
            navigator.clipboard.writeText(bodyString);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    }, [response]);

    const renderRequestPanel = () => (
        <div>
            <div className="flex border-b border-gray-700 mb-4">
                <button onClick={() => setActiveTab('ai')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'ai' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-slate-400 hover:text-slate-50'}`}>AI Generator</button>
                <button onClick={() => setActiveTab('manual')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'manual' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-slate-400 hover:text-slate-50'}`}>Manual Request</button>
            </div>

            {activeTab === 'ai' && (
                <div>
                    <label htmlFor="ai-prompt" className="block text-sm font-medium text-slate-300 mb-2">
                        Describe the request you want to make
                    </label>
                    <textarea id="ai-prompt" rows={5} className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-3 font-mono text-sm text-slate-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary" placeholder="e.g., 'Get all posts from JSONPlaceholder'" value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} />
                    <button onClick={handleGenerate} disabled={isGenerating} className="mt-4 w-full flex items-center justify-center bg-brand-primary hover:bg-indigo-500 text-white font-semibold py-2.5 px-6 rounded-full transition-all duration-200 disabled:bg-gray-600">
                        {isGenerating ? 'Generating...' : <><SparklesIcon className="w-5 h-5 mr-2" /> Generate Template</>}
                    </button>
                </div>
            )}

            {activeTab === 'manual' && (
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <div className="relative">
                            <select value={method} onChange={(e) => setMethod(e.target.value)} className="appearance-none bg-gray-900/50 border border-gray-700 rounded-xl px-3 py-2 pr-10 text-slate-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary">
                                {METHODS.map(m => <option key={m} value={m} className="bg-gray-800">{m}</option>)}
                            </select>
                            <ChevronDownIcon className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        <input type="url" placeholder="https://api.example.com/data" value={url} onChange={(e) => setUrl(e.target.value)} className="flex-grow bg-gray-900/50 border border-gray-700 rounded-xl px-3 py-2 text-slate-200 focus:ring-2 focus:ring-brand-primary" />
                    </div>

                    <div>
                        <h4 className="text-md font-semibold text-slate-200 mb-2">Headers</h4>
                        <div className="space-y-2">
                        {headers.map((header) => (
                            <div key={header.id} className="flex gap-2 items-center">
                                <input type="text" placeholder="Key" value={header.key} onChange={e => handleHeaderChange(header.id, 'key', e.target.value)} className="w-1/2 bg-gray-900/50 border border-gray-700 rounded-xl px-3 py-2 text-sm text-slate-200" />
                                <input type="text" placeholder="Value" value={header.value} onChange={e => handleHeaderChange(header.id, 'value', e.target.value)} className="w-1/2 bg-gray-900/50 border border-gray-700 rounded-xl px-3 py-2 text-sm text-slate-200" />
                                <button onClick={() => handleRemoveHeader(header.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"><TrashIcon className="w-4 h-4" /></button>
                            </div>
                        ))}
                        </div>
                        <button onClick={handleAddHeader} className="mt-2 text-sm font-semibold text-brand-secondary hover:bg-brand-secondary/10 rounded-full py-1.5 px-3 flex items-center transition-colors"><PlusIcon className="w-4 h-4 mr-1" /> Add Header</button>
                    </div>

                    {BODY_METHODS.includes(method) && (
                        <div>
                            <h4 className="text-md font-semibold text-slate-200 mb-2">Body</h4>
                            <textarea rows={8} className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-3 font-mono text-sm text-slate-200 focus:ring-2 focus:ring-brand-primary" placeholder="Enter request body..." value={body} onChange={(e) => setBody(e.target.value)} />
                        </div>
                    )}
                    
                    <button onClick={handleSend} disabled={isSending} className="w-full flex items-center justify-center bg-brand-secondary hover:bg-emerald-400 text-white font-semibold py-2.5 px-6 rounded-full transition-all duration-200 disabled:bg-gray-600">
                        {isSending ? 'Sending...' : <><SendIcon className="w-5 h-5 mr-2" /> Send Request</>}
                    </button>
                </div>
            )}
        </div>
    );
    
    const renderResponsePanel = () => {
         const statusColor = response ? (response.status >= 200 && response.status < 300 ? 'text-green-400' : response.status >= 400 ? 'text-red-400' : 'text-yellow-400') : '';
        return (
            <div className="bg-gray-900/30 rounded-2xl p-4 border border-gray-700/50 h-full min-h-[400px] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">Response</h3>
                    {response && (
                        <span className={`font-mono text-sm font-bold ${statusColor}`}>
                            {response.status} {response.statusText}
                        </span>
                    )}
                </div>
                 {(isSending) && (
                    <div className="flex-grow flex items-center justify-center">
                        <div className="text-center">
                            <svg className="animate-spin h-8 w-8 text-brand-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <p className="mt-2 text-slate-400">Awaiting response...</p>
                        </div>
                    </div>
                )}
                {response && !isSending && (
                     <div className="flex-grow flex flex-col min-h-0">
                         <div className="flex border-b border-gray-700">
                            <button onClick={() => setResponseTab('body')} className={`px-4 py-2 text-sm font-medium ${responseTab === 'body' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-slate-400 hover:text-slate-50'}`}>Body</button>
                            <button onClick={() => setResponseTab('headers')} className={`px-4 py-2 text-sm font-medium ${responseTab === 'headers' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-slate-400 hover:text-slate-50'}`}>Headers</button>
                        </div>
                        <div className="relative flex-grow mt-2 overflow-y-auto">
                            {responseTab === 'body' && (
                                <>
                                    <pre className="bg-gray-900/70 rounded-xl p-3 text-sm font-mono text-slate-200 h-full">
                                        <code>{typeof response.body === 'string' ? response.body : JSON.stringify(response.body, null, 2)}</code>
                                    </pre>
                                    <button onClick={handleCopyResponse} className="absolute top-2 right-2 p-1.5 bg-gray-700/80 hover:bg-gray-700 rounded-lg text-slate-300">
                                        {isCopied ? <CheckIcon className="w-4 h-4 text-brand-secondary" /> : <ClipboardIcon className="w-4 h-4" />}
                                    </button>
                                </>
                            )}
                             {responseTab === 'headers' && (
                                <pre className="bg-gray-900/70 rounded-xl p-3 text-sm font-mono text-slate-200 h-full">
                                    <code>{JSON.stringify(response.headers, null, 2)}</code>
                                </pre>
                            )}
                        </div>
                     </div>
                )}
                 {!response && !isSending && (
                     <div className="flex-grow flex items-center justify-center">
                        <div className="text-center text-slate-500">
                            <p>API response will appear here.</p>
                             <p className="text-xs mt-2">(Note: Requests are sent from your browser and may be blocked by CORS policy.)</p>
                        </div>
                    </div>
                )}
            </div>
        )
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            {error && <p className="mb-4 text-sm text-red-400 bg-red-900/50 p-3 rounded-md">{error}</p>}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {renderRequestPanel()}
                {renderResponsePanel()}
            </div>
        </div>
    );
};