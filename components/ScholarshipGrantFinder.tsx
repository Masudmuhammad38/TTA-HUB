import React, { useState, useCallback } from 'react';
import { findScholarships } from '../services/geminiService';
import type { ScholarshipResult } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import { CheckIcon } from './icons/CheckIcon';

const studyLevels = [
    { value: 'Undergraduate', label: 'Undergraduate' },
    { value: 'Masters', label: 'Masters' },
    { value: 'PhD', label: 'PhD' },
    { value: 'Postdoctoral', label: 'Postdoctoral' },
    { value: 'Any', label: 'Any' },
];

export const ScholarshipGrantFinder: React.FC = () => {
    const [fieldOfStudy, setFieldOfStudy] = useState<string>('Computer Science');
    const [levelOfStudy, setLevelOfStudy] = useState<string>('Masters');
    const [country, setCountry] = useState<string>('Nigeria');
    const [interests, setInterests] = useState<string>('Artificial Intelligence, women in tech');
    
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [result, setResult] = useState<ScholarshipResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = useCallback(async () => {
        if (!fieldOfStudy.trim() || !country.trim()) {
            setError('Please provide at least a field of study and your country.');
            return;
        }
        setIsLoading(true);
        setResult(null);
        setError(null);
        try {
            const pathResult = await findScholarships({ fieldOfStudy, levelOfStudy, country, interests });
            setResult(pathResult);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [fieldOfStudy, levelOfStudy, country, interests]);

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Panel */}
                <div>
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="field-of-study" className="block text-sm font-medium text-slate-300 mb-2">
                                Field of Study
                            </label>
                            <input
                                id="field-of-study"
                                type="text"
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-3 text-sm text-slate-200 focus:ring-2 focus:ring-brand-primary"
                                placeholder="e.g., 'Software Engineering', 'Public Health'"
                                value={fieldOfStudy}
                                onChange={(e) => setFieldOfStudy(e.target.value)}
                            />
                        </div>
                         <div>
                            <label htmlFor="level-of-study" className="block text-sm font-medium text-slate-300 mb-2">
                                Level of Study
                            </label>
                            <div className="relative">
                                <select
                                    id="level-of-study"
                                    value={levelOfStudy}
                                    onChange={(e) => setLevelOfStudy(e.target.value)}
                                    className="w-full appearance-none bg-gray-900/50 border border-gray-700 rounded-xl px-3 py-2 pr-10 text-slate-200 focus:ring-2 focus:ring-brand-primary"
                                >
                                    {studyLevels.map(level => (
                                        <option key={level.value} value={level.value} className="bg-gray-800">{level.label}</option>
                                    ))}
                                </select>
                                <ChevronDownIcon className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="country" className="block text-sm font-medium text-slate-300 mb-2">
                                Your Country of Residence/Origin
                            </label>
                            <input
                                id="country"
                                type="text"
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-3 text-sm text-slate-200 focus:ring-2 focus:ring-brand-primary"
                                placeholder="e.g., 'Kenya', 'Ghana'"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="interests" className="block text-sm font-medium text-slate-300 mb-2">
                                Specific Interests (Optional)
                            </label>
                            <input
                                id="interests"
                                type="text"
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-3 text-sm text-slate-200 focus:ring-2 focus:ring-brand-primary"
                                placeholder="e.g., 'leadership', 'climate change'"
                                value={interests}
                                onChange={(e) => setInterests(e.target.value)}
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="mt-6 w-full flex items-center justify-center bg-brand-primary hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 transform hover:-translate-y-0.5 disabled:bg-gray-600"
                    >
                        {isLoading ? 'Searching...' : <><SparklesIcon className="w-5 h-5 mr-2" /> Find Scholarships</>}
                    </button>
                    {error && <p className="mt-4 text-sm text-red-400 bg-red-900/50 p-3 rounded-xl">{error}</p>}
                </div>
                
                {/* Output Panel */}
                <div className="bg-gray-900/30 rounded-3xl p-4 border border-gray-700/50 h-full min-h-[500px] flex flex-col">
                    <h3 className="text-lg font-semibold text-white mb-4 px-2">Opportunities Found</h3>
                    {isLoading && (
                        <div className="flex-grow flex items-center justify-center">
                            <div className="text-center">
                                <SparklesIcon className="w-10 h-10 text-brand-primary animate-pulse mx-auto"/>
                                <p className="mt-2 text-slate-400">Searching for funding opportunities...</p>
                            </div>
                        </div>
                    )}
                    {result && !isLoading && (
                        <div className="flex-grow flex flex-col space-y-4 overflow-y-auto pr-2">
                           {result.scholarships.length > 0 ? (
                                result.scholarships.map((item, index) => (
                                    <div key={index} className="bg-gray-800/70 p-4 rounded-2xl border border-gray-700 flex flex-col justify-between">
                                        <div>
                                            <p className="font-semibold text-brand-primary">{item.name}</p>
                                            <p className="text-sm text-slate-300 mt-1 font-medium">{item.organization}</p>
                                            <p className="text-sm text-slate-400 mt-2">{item.description}</p>
                                            <div className="mt-3">
                                                <h5 className="text-xs font-semibold text-slate-300 mb-2">Key Eligibility:</h5>
                                                <ul className="space-y-1.5">
                                                    {item.eligibility.map((req, i) => (
                                                        <li key={i} className="flex items-start text-xs text-slate-300">
                                                          <CheckIcon className="w-3 h-3 mr-2 mt-0.5 text-brand-secondary flex-shrink-0" />
                                                          <span>{req}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                        <a 
                                            href={item.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-4 inline-flex items-center justify-center text-sm font-semibold text-white bg-brand-secondary hover:bg-emerald-400 rounded-full py-2 px-4 transition-colors self-start"
                                        >
                                            Learn More & Apply
                                            <ArrowRightIcon className="w-4 h-4 ml-2" />
                                        </a>
                                    </div>
                                ))
                           ) : (
                               <div className="flex-grow flex items-center justify-center text-center p-4">
                                    <p className="text-slate-400">No specific scholarships found for your criteria. Try broadening your search.</p>
                                </div>
                           )}
                        </div>
                    )}
                    {!result && !isLoading && (
                         <div className="flex-grow flex items-center justify-center">
                            <div className="text-center text-slate-500">
                                <p>Scholarship & grant opportunities will appear here.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};