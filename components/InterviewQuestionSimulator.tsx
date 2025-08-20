import React, { useState, useCallback, useEffect, useRef } from 'react';
import { generateInterviewQuestion, getInterviewFeedback } from '../services/geminiService';
import type { InterviewFeedbackResult } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { CheckIcon } from './icons/CheckIcon';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { RefreshCwIcon } from './icons/RefreshCwIcon';
import { InterviewIcon } from './icons/InterviewIcon';
import { StopIcon } from './icons/StopIcon';

type InterviewType = 'Technical' | 'Behavioral';
const interviewTypes: InterviewType[] = ['Technical', 'Behavioral'];

// Extend the Window interface for vendor-prefixed SpeechRecognition
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

// Add a type definition for SpeechRecognition to satisfy TypeScript
interface SpeechRecognition {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: (event: any) => void;
    onerror: (event: any) => void;
    onend: () => void;
    start: () => void;
    stop: () => void;
}


export const InterviewQuestionSimulator: React.FC = () => {
    const [role, setRole] = useState<string>('Senior React Developer');
    const [type, setType] = useState<InterviewType>('Technical');
    const [question, setQuestion] = useState<string | null>(null);
    const [answer, setAnswer] = useState<string>('');
    const [feedback, setFeedback] = useState<InterviewFeedbackResult | null>(null);
    const [history, setHistory] = useState<{ question: string; answer: string }[]>([]);

    const [isLoadingQuestion, setIsLoadingQuestion] = useState<boolean>(false);
    const [isLoadingFeedback, setIsLoadingFeedback] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Voice recording state
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [isMicrophoneAvailable, setIsMicrophoneAvailable] = useState<boolean>(false);
    const speechRecognition = useRef<SpeechRecognition | null>(null);


    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            setIsMicrophoneAvailable(true);
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';
            
            recognition.onresult = (event) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                     setAnswer(prev => (prev.trim() + ' ' + finalTranscript.trim()).trim());
                }
            };
            
            recognition.onerror = (event: any) => {
                console.error('Speech recognition error:', event);
                let errorMessage;
                if (event.error === 'network') {
                    errorMessage = "Speech recognition error: A network error occurred. Please check your internet connection and try again.";
                } else if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                    errorMessage = "Speech recognition error: Microphone access was denied. Please enable microphone permissions in your browser settings to use this feature.";
                } else if (event.error === 'no-speech') {
                    errorMessage = "No speech was detected. Please try again and speak clearly.";
                } else {
                    errorMessage = `An unexpected speech recognition error occurred: ${event.error}. Please ensure your microphone is working.`;
                }
                setError(errorMessage);
                setIsRecording(false);
            };
    
            recognition.onend = () => {
                setIsRecording(false);
            };
            
            speechRecognition.current = recognition;
        }
    
        return () => {
            speechRecognition.current?.stop();
        };
    }, []);

    const handleToggleRecording = () => {
        if (!speechRecognition.current) return;
    
        if (isRecording) {
            speechRecognition.current.stop();
        } else {
            setError(null); // Clear previous errors
            setAnswer(''); // Clear previous answer
            speechRecognition.current.start();
        }
        setIsRecording(!isRecording);
    };

    const handleGenerateQuestion = useCallback(async (currentHistory: { question: string; answer: string }[]) => {
        if (!role.trim()) {
            setError('Please specify a job role.');
            return;
        }
        setIsLoadingQuestion(true);
        setQuestion(null);
        setAnswer('');
        setFeedback(null);
        setError(null);
        try {
            const result = await generateInterviewQuestion(role, type, currentHistory);
            setQuestion(result.question);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoadingQuestion(false);
        }
    }, [role, type]);
    
    const handleGenerateFirstQuestion = () => {
        setHistory([]);
        handleGenerateQuestion([]);
    };

    const handleNextQuestion = () => {
        if (question && answer) {
            const newHistory = [...history, { question, answer }];
            setHistory(newHistory);
            handleGenerateQuestion(newHistory);
        }
    }

    const handleGetFeedback = useCallback(async () => {
        if (!question || !answer.trim()) {
            setError('Please provide an answer to get feedback.');
            return;
        }
        setIsLoadingFeedback(true);
        setFeedback(null);
        setError(null);
        try {
            const result = await getInterviewFeedback(question, answer);
            setFeedback(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoadingFeedback(false);
        }
    }, [question, answer]);

    const renderFeedback = () => {
        if (isLoadingFeedback) {
            return (
                 <div className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                        <SparklesIcon className="w-10 h-10 text-brand-primary animate-pulse mx-auto"/>
                        <p className="mt-2 text-slate-400">Analyzing your answer...</p>
                    </div>
                </div>
            )
        }
        if (feedback) {
            return (
                <div className="space-y-6 overflow-y-auto pr-2">
                    <div>
                        <h4 className="flex items-center text-md font-semibold text-green-400 mb-2">
                            <CheckIcon className="w-5 h-5 mr-2" />
                            Strengths
                        </h4>
                        <ul className="space-y-2 list-disc list-inside text-sm text-slate-300">
                            {feedback.strengths.map((item, index) => <li key={index}>{item}</li>)}
                        </ul>
                    </div>
                    <div>
                        <h4 className="flex items-center text-md font-semibold text-yellow-400 mb-2">
                            <LightbulbIcon className="w-5 h-5 mr-2" />
                            Areas for Improvement
                        </h4>
                        <ul className="space-y-2 list-disc list-inside text-sm text-slate-300">
                            {feedback.areasForImprovement.map((item, index) => <li key={index}>{item}</li>)}
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-md font-semibold text-slate-200 mb-2">Example Answer</h4>
                        <p className="text-sm text-slate-300 bg-gray-800/50 p-3 rounded-xl italic">{feedback.exampleAnswer}</p>
                    </div>
                     <button
                        onClick={handleNextQuestion}
                        className="w-full flex items-center justify-center bg-brand-secondary hover:bg-emerald-400 text-white font-semibold py-2.5 px-6 rounded-full transition-all duration-200"
                    >
                        <RefreshCwIcon className="w-4 h-4 mr-2" />
                        Next Question
                    </button>
                </div>
            )
        }
        return (
            <div className="flex-grow flex items-center justify-center">
                <div className="text-center text-slate-500">
                    <p>Your feedback will appear here.</p>
                </div>
            </div>
        )
    };


    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Panel */}
                <div className="space-y-6">
                    <div>
                        <label htmlFor="role-input" className="block text-sm font-medium text-slate-300 mb-2">
                            Job Role
                        </label>
                        <input
                            id="role-input"
                            type="text"
                            className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-3 text-sm text-slate-200 focus:ring-2 focus:ring-brand-primary"
                            placeholder="e.g., 'Python Backend Developer'"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        />
                    </div>
                    
                     <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Interview Type
                        </label>
                        <div className="flex bg-gray-900/50 border border-gray-700 rounded-full p-1 space-x-1">
                            {interviewTypes.map(it => (
                                <button
                                    key={it}
                                    onClick={() => setType(it)}
                                    className={`w-full text-center px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-200 ${
                                        type === it ? 'bg-brand-primary text-white' : 'text-slate-300 hover:bg-gray-700'
                                    }`}
                                >
                                    {it}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleGenerateFirstQuestion}
                        disabled={isLoadingQuestion}
                        className="w-full flex items-center justify-center bg-brand-primary hover:bg-indigo-500 text-white font-semibold py-2.5 px-6 rounded-full transition-all duration-300 disabled:bg-gray-600"
                    >
                        {isLoadingQuestion ? 'Generating...' : <><SparklesIcon className="w-5 h-5 mr-2" /> Start Interview</>}
                    </button>

                    {error && <p className="text-sm text-red-400 bg-red-900/50 p-3 rounded-md">{error}</p>}
                    
                    {isLoadingQuestion && (
                         <div className="text-center p-8">
                            <p className="text-slate-400">Generating a new question...</p>
                        </div>
                    )}

                    {question && (
                        <div className="space-y-4 pt-4 border-t border-gray-700">
                            <div>
                                <h3 className="font-semibold text-slate-200 mb-2">Question {history.length + 1}:</h3>
                                <p className="bg-gray-900/50 p-4 rounded-xl text-slate-100">{question}</p>
                            </div>
                            <div>
                                <label htmlFor="answer-input" className="block text-sm font-medium text-slate-300 mb-2">
                                    Your Answer
                                </label>
                                <textarea
                                    id="answer-input"
                                    rows={8}
                                    className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-3 text-sm text-slate-200 focus:ring-2 focus:ring-brand-primary disabled:bg-gray-800"
                                    placeholder="Type your answer or use the record button..."
                                    value={isRecording ? 'Listening... Your transcribed answer will appear here.' : answer}
                                    onChange={(e) => setAnswer(e.target.value)}
                                    disabled={isLoadingFeedback || isRecording}
                                />
                            </div>
                            <div className="flex flex-wrap items-center gap-4">
                                <button
                                    onClick={handleGetFeedback}
                                    disabled={isLoadingFeedback || !answer.trim() || isRecording}
                                    className="flex-1 flex items-center justify-center bg-brand-secondary hover:bg-emerald-400 text-white font-semibold py-2.5 px-6 rounded-full transition-all duration-300 disabled:bg-gray-600"
                                >
                                    {isLoadingFeedback ? 'Getting Feedback...' : 'Get Feedback'}
                                </button>
                                {isMicrophoneAvailable && (
                                    <button 
                                        onClick={handleToggleRecording}
                                        disabled={isLoadingFeedback}
                                        className={`flex items-center justify-center gap-2 font-semibold py-2.5 px-6 rounded-full transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed ${isRecording ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                                    >
                                        {isRecording ? <StopIcon className="w-5 h-5"/> : <InterviewIcon className="w-5 h-5"/>}
                                        <span>{isRecording ? 'Stop' : 'Record'}</span>
                                    </button>
                                )}
                            </div>
                             {!isMicrophoneAvailable && <p className="text-xs text-slate-500 mt-2">Voice recording is not supported on your browser.</p>}
                        </div>
                    )}
                </div>
                
                {/* Output Panel */}
                <div className="bg-gray-900/30 rounded-2xl p-6 border border-gray-700/50 h-full min-h-[500px] flex flex-col">
                    <h3 className="text-lg font-semibold text-white mb-4">Feedback</h3>
                    {renderFeedback()}
                </div>
            </div>
        </div>
    );
};

// Add RefreshCwIcon locally to avoid creating a new file for it
const RefreshCwIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 2v6h6"/>
    <path d="M21 12A9 9 0 0 0 6 5.3L3 8"/>
    <path d="M21 22v-6h-6"/>
    <path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"/>
  </svg>
);