import React, { useState, useCallback } from 'react';
import { generateCareerPath } from '../services/geminiService';
import type { CareerPathResult, CareerPathStepResource } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { CheckIcon } from './icons/CheckIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { PlayIcon } from './icons/PlayIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

const experienceLevels = [
    { value: 'Beginner', label: 'Beginner (0-2 years)' },
    { value: 'Intermediate', label: 'Intermediate (2-5 years)' },
    { value: 'Advanced', label: 'Advanced (5+ years)' },
];

const ResourceIcon: React.FC<{ type: CareerPathStepResource['type'] }> = ({ type }) => {
    switch (type) {
        case 'book':
        case 'article':
        case 'documentation':
            return <BookOpenIcon className="w-4 h-4 text-brand-secondary" />;
        case 'course':
        case 'video':
            return <PlayIcon className="w-4 h-4 text-brand-secondary" />;
        default:
            return <CheckIcon className="w-4 h-4 text-brand-secondary" />;
    }
};


export const CareerPathBuilder: React.FC = () => {
    const [currentRole, setCurrentRole] = useState<string>('Junior Frontend Developer with React skills.');
    const [goal, setGoal] = useState<string>('Become a Full-Stack Engineer specializing in MERN stack.');
    const [experience, setExperience] = useState<string>('Beginner');
    
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [result, setResult] = useState<CareerPathResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = useCallback(async () => {
        if (!currentRole.trim() || !goal.trim()) {
            setError('Please describe your current role and your career goal.');
            return;
        }
        setIsLoading(true);
        setResult(null);
        setError(null);
        try {
            const pathResult = await generateCareerPath(currentRole, goal, experience);
            setResult(pathResult);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [currentRole, goal, experience]);

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Panel */}
                <div>
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="current-role" className="block text-sm font-medium text-slate-300 mb-2">
                                Current Role & Skills
                            </label>
                            <textarea
                                id="current-role"
                                rows={4}
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-3 text-sm text-slate-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                                placeholder="e.g., 'Student learning Python' or 'Marketing Manager interested in tech'"
                                value={currentRole}
                                onChange={(e) => setCurrentRole(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="goal" className="block text-sm font-medium text-slate-300 mb-2">
                                Career Goal
                            </label>
                            <textarea
                                id="goal"
                                rows={4}
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-3 text-sm text-slate-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                                placeholder="e.g., 'Become a Data Scientist' or 'Launch my own tech startup'"
                                value={goal}
                                onChange={(e) => setGoal(e.target.value)}
                            />
                        </div>
                         <div>
                            <label htmlFor="experience" className="block text-sm font-medium text-slate-300 mb-2">
                                Experience Level
                            </label>
                            <div className="relative">
                                <select
                                    id="experience"
                                    value={experience}
                                    onChange={(e) => setExperience(e.target.value)}
                                    className="w-full appearance-none bg-gray-900/50 border border-gray-700 rounded-xl px-3 py-2 pr-10 text-slate-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                                >
                                    {experienceLevels.map(level => (
                                        <option key={level.value} value={level.value} className="bg-gray-800">{level.label}</option>
                                    ))}
                                </select>
                                <ChevronDownIcon className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="mt-6 w-full flex items-center justify-center bg-brand-primary hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 transform hover:-translate-y-0.5 disabled:bg-gray-600"
                    >
                        {isLoading ? 'Generating...' : <><SparklesIcon className="w-5 h-5 mr-2" /> Generate Career Path</>}
                    </button>
                    {error && <p className="mt-4 text-sm text-red-400 bg-red-900/50 p-3 rounded-xl">{error}</p>}
                </div>
                
                {/* Output Panel */}
                <div className="bg-gray-900/30 rounded-3xl p-4 border border-gray-700/50 h-full min-h-[500px] flex flex-col">
                    <h3 className="text-lg font-semibold text-white mb-4 px-2">Your AI-Generated Roadmap</h3>
                    {isLoading && (
                        <div className="flex-grow flex items-center justify-center">
                            <div className="text-center">
                                <SparklesIcon className="w-10 h-10 text-brand-primary animate-pulse mx-auto"/>
                                <p className="mt-2 text-slate-400">Building your personalized path...</p>
                            </div>
                        </div>
                    )}
                    {result && !isLoading && (
                        <div className="flex-grow flex flex-col space-y-6 overflow-y-auto pr-2">
                           <div>
                                <h4 className="text-md font-semibold text-slate-200 mb-3">Suggested Roles</h4>
                                <div className="space-y-3">
                                    {result.suggestedRoles.map((role, index) => (
                                        <div key={index} className="bg-gray-800/70 p-4 rounded-2xl border border-gray-700">
                                            <p className="font-semibold text-brand-primary flex items-center"><BriefcaseIcon className="w-4 h-4 mr-2" /> {role.title}</p>
                                            <p className="text-sm text-slate-300 mt-1">{role.description}</p>
                                            <p className="text-xs text-slate-400 mt-2 border-l-2 border-gray-600 pl-2 italic">{role.relevance}</p>
                                        </div>
                                    ))}
                                </div>
                           </div>
                             <div>
                                <h4 className="text-md font-semibold text-slate-200 mb-3">Key Skills to Develop</h4>
                                <div className="flex flex-wrap gap-2">
                                    {result.keySkillsToDevelop.map((skill, index) => (
                                        <span key={index} className="bg-brand-secondary/10 text-brand-secondary text-xs font-medium px-3 py-1 rounded-full">{skill}</span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-md font-semibold text-slate-200 mb-3">Your Learning Path</h4>
                                <div className="space-y-4">
                                     {result.learningPath.map((step) => (
                                        <div key={step.step} className="p-4 rounded-2xl bg-gray-800/70 border border-gray-700">
                                            <p className="text-sm font-semibold text-slate-100">Step {step.step}: {step.title}</p>
                                            <p className="text-sm text-slate-300 mt-1 mb-3">{step.description}</p>
                                            <h5 className="text-xs font-semibold text-slate-300 mb-2">Suggested Resources:</h5>
                                            <ul className="space-y-2">
                                                {step.resources.map((res, i) => (
                                                    <li key={i} className="flex items-center text-sm text-slate-300">
                                                        <ResourceIcon type={res.type} />
                                                        <span className="ml-2 capitalize text-xs mr-2 text-slate-400">{res.type}:</span>
                                                        <span>{res.name}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                     ))}
                                </div>
                            </div>
                        </div>
                    )}
                    {!result && !isLoading && (
                         <div className="flex-grow flex items-center justify-center">
                            <div className="text-center text-slate-500">
                                <p>Your personalized career path will appear here.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};