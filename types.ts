import React from 'react';

export enum ToolCategory {
    Developers = 'Developers',
    Startups = 'Startups & Creators',
    Career = 'Career & Education',
    Everyday = 'Everyday Use',
}

export interface Tool {
    id: string;
    name: string;
    description: string;
    category: ToolCategory;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

export interface DebugError {
    line: number;
    error: string;
    explanation: string;
}

export interface DebugResult {
    errors: DebugError[];
    fixedCode: string;
}

export interface ApiRequestTemplate {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    headers: Record<string, string>;
    body?: string;
}

export interface ApiResponse {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: any;
}

export interface RegexResult {
    pattern: string;
    explanation: string;
}

export interface SqlQueryResult {
    query: string;
    explanation: string;
}

export interface StartupValidationResult {
    feasibilityScore: number;
    opportunities: string[];
    risks: string[];
    nextSteps: string[];
}

export interface CareerPathStepResource {
    name: string;
    type: 'course' | 'book' | 'article' | 'video' | 'documentation';
}

export interface CareerPathStep {
    step: number;
    title: string;
    description: string;
    resources: CareerPathStepResource[];
}

export interface SuggestedRole {
    title: string;
    description: string;
    relevance: string;
}

export interface CareerPathResult {
    suggestedRoles: SuggestedRole[];
    keySkillsToDevelop: string[];
    learningPath: CareerPathStep[];
}

export interface TextSummaryResult {
    summary: string;
}

export interface SocialMediaPostResult {
    post: string;
}

export interface EmailResult {
    subject: string;
    body: string;
}

export interface ContentImproverResult {
    improvedText: string;
}

export interface ResumeResult {
    resumeText: string;
}

export interface CoverLetterResult {
    coverLetterText: string;
}

export interface GitCommitResult {
    type: 'feat' | 'fix' | 'docs' | 'style' | 'refactor' | 'perf' | 'test' | 'chore' | 'build' | 'ci';
    scope?: string;
    subject: string;
    body: string;
}

export interface UXFlowStep {
    step: number;
    title: string;
    userAction: string;
    systemResponse: string;
}

export interface UXFlowResult {
    flow: UXFlowStep[];
}

export interface DevOpsCommandResult {
    command: string;
    explanation: string;
}
