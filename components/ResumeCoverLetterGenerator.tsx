
import React, { useState, useCallback } from 'react';
import { generateResume, generateCoverLetter } from '../services/geminiService';
import type { ResumeResult, CoverLetterResult } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';

type ActiveTab = 'resume' | 'cover-letter';
type CoverLetterTone = 'Professional' | 'Enthusiastic' | 'Formal' | 'Creative';

const coverLetterTones: { id: CoverLetterTone; label: string }[] = [
    { id: 'Professional', label: 'Professional' },
    { id: 'Enthusiastic', label: 'Enthusiastic' },
    { id: 'Formal', label: 'Formal' },
    { id: 'Creative', label: 'Creative' },
];

interface InputFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: 'input' | 'textarea';
    rows?: number;
    placeholder?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, value, onChange, type = 'input', rows = 3, placeholder }) => (
    <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
        {type === 'textarea' ? (
            <textarea
                rows={rows}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-3 text-sm text-slate-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
        ) : (
            <input
                type="text"
                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-3 text-sm text-slate-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
        )}
    </div>
);


const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
            isActive
                ? 'text-brand-primary border-b-2 border-brand-primary'
                : 'text-slate-400 hover:text-slate-50 border-b-2 border-transparent'
        }`}
    >
        {label}
    </button>
);


export const ResumeCoverLetterGenerator: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('resume');
    
    // Resume State
    const [fullName, setFullName] = useState<string>('Jane Doe');
    const [contactInfo, setContactInfo] = useState<string>('jane.doe@email.com | 555-123-4567 | linkedin.com/in/janedoe');
    const [summary, setSummary] = useState<string>('A results-driven software engineer with 5 years of experience in full-stack development, specializing in React and Node.js.');
    const [experience, setExperience] = useState<string>('Senior Software Engineer at Tech Corp (2020-Present)\n- Led the development of a major e-commerce platform.\n- Mentored junior developers.\n\nSoftware Engineer at Innovate LLC (2018-2020)\n- Developed and maintained client-side applications.');
    const [education, setEducation] = useState<string>('B.S. in Computer Science - University of Technology (2018)');
    const [skills, setSkills] = useState<string>('JavaScript, React, Node.js, Python, SQL, AWS');

    // Cover Letter State
    const [yourName, setYourName] = useState<string>('Jane Doe');
    const [company, setCompany] = useState<string>('Google');
    const [jobTitle, setJobTitle] = useState<string>('Software Engineer');
    const [jobDescription, setJobDescription] = useState<string>('Seeking a software engineer with strong problem-solving skills and experience in building scalable web applications. The ideal candidate will be proficient in JavaScript and have a passion for creating excellent user experiences.');
    const [tone, setTone] =useState<CoverLetterTone>('Professional');

    // Common State
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [result, setResult] = useState<ResumeResult | CoverLetterResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState<boolean>(false);

    const handleGenerate = useCallback(async () => {
        setIsLoading(true);
        setResult(null);
        setError(null);
        try {
            if (activeTab === 'resume') {
                if (!fullName || !experience || !skills) {
                    setError('Full Name, Experience, and Skills are required for a resume.');
                    setIsLoading(false);
                    return;
                }
                const resumeResult = await generateResume({ fullName, contactInfo, summary, experience, education, skills });
                setResult(resumeResult);
            } else { // Cover Letter
                if (!yourName || !company || !jobTitle || !jobDescription) {
                    setError('All fields are required for a cover letter.');
                    setIsLoading(false);
                    return;
                }
                const clResult = await generateCoverLetter({ yourName, company, jobTitle, jobDescription, tone });
                setResult(clResult);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [activeTab, fullName, contactInfo, summary, experience, education, skills, yourName, company, jobTitle, jobDescription, tone]);

    const handleCopy = useCallback(() => {
        if (!result) return;
        const textToCopy = 'resumeText' in result ? result.resumeText : result.coverLetterText;
        navigator.clipboard.writeText(textToCopy);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }, [result]);

    const renderResumeForm = () => (
        <div className="space-y-4">
            <InputField label="Full Name" value={fullName} onChange={setFullName} />
            <InputField label="Contact Info (Email, Phone, LinkedIn)" value={contactInfo} onChange={setContactInfo} type="textarea" rows={3}/>
            <InputField label="Professional Summary / Objective" value={summary} onChange={setSummary} type="textarea" rows={4}/>
            <InputField label="Work Experience (Include Job Title, Company, Dates, and Responsibilities)" value={experience} onChange={setExperience} type="textarea" rows={8}/>
            <InputField label="Education" value={education} onChange={setEducation} type="textarea" rows={3}/>
            <InputField label="Skills (Comma-separated)" value={skills} onChange={setSkills} />
        </div>
    );

    const renderCoverLetterForm = () => (
        <div className="space-y-4">
            <InputField label="Your Name" value={yourName} onChange={setYourName} />
            <InputField label="Company You're Applying To" value={company} onChange={setCompany} />
            <InputField label="Job Title You're Applying For" value={jobTitle} onChange={setJobTitle} />
            <InputField label="Job Description or Your Key Strengths to Highlight" value={jobDescription} onChange={setJobDescription} type="textarea" rows={8} />
             <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                    Tone
                </label>
                <div className="grid grid-cols-2 gap-2">
                    {coverLetterTones.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTone(t.id)}
                            className={`w-full text-center px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 ${
                                tone === t.id ? 'bg-brand-secondary text-white' : 'bg-gray-900/50 border border-gray-700 text-slate-300 hover:bg-gray-700'
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );


    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Panel */}
                <div>
                    <div className="flex border-b border-gray-700 mb-4">
                        <TabButton label="Resume Generator" isActive={activeTab === 'resume'} onClick={() => { setActiveTab('resume'); setResult(null); }} />
                        <TabButton label="Cover Letter Generator" isActive={activeTab === 'cover-letter'} onClick={() => { setActiveTab('cover-letter'); setResult(null); }} />
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto pr-3">
                         {activeTab === 'resume' ? renderResumeForm() : renderCoverLetterForm()}
                    </div>
                    
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="mt-6 w-full flex items-center justify-center bg-brand-primary hover:bg-indigo-500 text-white font-semibold py-2.5 px-6 rounded-full transition-all duration-300 transform hover:-translate-y-0.5 disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating...
                            </>
                        ) : (
                             <>
                                <SparklesIcon className="w-5 h-5 mr-2" />
                                {activeTab === 'resume' ? 'Generate Resume' : 'Generate Cover Letter'}
                            </>
                        )}
                    </button>
                    {error && <p className="mt-4 text-sm text-red-400 bg-red-900/50 p-3 rounded-md">{error}</p>}
                </div>
                
                {/* Output Panel */}
                <div className="bg-gray-900/30 rounded-2xl p-4 border border-gray-700/50 h-full min-h-[500px] flex flex-col">
                    <h3 className="text-lg font-semibold text-white mb-4">Generated Document</h3>
                    {isLoading && (
                        <div className="flex-grow flex items-center justify-center">
                            <div className="text-center">
                                <SparklesIcon className="w-10 h-10 text-brand-primary animate-pulse mx-auto"/>
                                <p className="mt-2 text-slate-400">AI is crafting your document...</p>
                            </div>
                        </div>
                    )}
                    {result && !isLoading && (
                        <div className="relative flex-grow">
                            <div className="absolute inset-0 overflow-y-auto pr-2 bg-gray-800/50 p-4 rounded-xl">
                                <p className="text-slate-200 whitespace-pre-wrap">
                                    {'resumeText' in result ? result.resumeText : result.coverLetterText}
                                </p>
                            </div>
                            <button onClick={handleCopy} className="absolute top-2 right-2 p-1.5 bg-gray-700/80 hover:bg-gray-700 rounded-lg text-slate-300 transition-colors">
                                {isCopied ? <CheckIcon className="w-4 h-4 text-brand-secondary" /> : <ClipboardIcon className="w-4 h-4" />}
                            </button>
                        </div>
                    )}
                    {!result && !isLoading && (
                         <div className="flex-grow flex items-center justify-center">
                            <div className="text-center text-slate-500">
                                <p>Your generated document will appear here.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
