import { Tool, ToolCategory } from './types';
import { CodeIcon } from './components/icons/CodeIcon';
import { ApiIcon } from './components/icons/ApiIcon';
import { RegexIcon } from './components/icons/RegexIcon';
import { DatabaseIcon } from './components/icons/DatabaseIcon';
import { LightbulbIcon } from './components/icons/LightbulbIcon';
import { BriefcaseIcon } from './components/icons/BriefcaseIcon';
import { DocumentTextIcon } from './components/icons/DocumentTextIcon';
import { MegaphoneIcon } from './components/icons/MegaphoneIcon';
import { EnvelopeIcon } from './components/icons/EnvelopeIcon';
import { WandIcon } from './components/icons/WandIcon';
import { IdentificationIcon } from './components/icons/IdentificationIcon';
import { UserFlowIcon } from './components/icons/UserFlowIcon';
import { JsonIcon } from './components/icons/JsonIcon';
import { GitCommitIcon } from './components/icons/GitCommitIcon';

// This is a subset for the initial build, focusing on the debugger.
export const TOOLS: Tool[] = [
    {
        id: 'ai-code-debugger',
        name: 'AI Code Debugger',
        description: 'Detects and explains errors in your code, suggesting fixes and optimizations.',
        category: ToolCategory.Developers,
        icon: CodeIcon,
    },
    {
        id: 'api-endpoint-tester',
        name: 'API Endpoint Tester',
        description: 'Test API calls directly in your browser with AI-generated templates.',
        category: ToolCategory.Developers,
        icon: ApiIcon,
    },
    {
        id: 'regex-generator',
        name: 'Regex Generator & Tester',
        description: 'Generate and test regular expressions from plain English queries.',
        category: ToolCategory.Developers,
        icon: RegexIcon,
    },
    {
        id: 'sql-query-builder',
        name: 'SQL Query Builder',
        description: 'Build and optimize efficient SQL queries using natural language.',
        category: ToolCategory.Developers,
        icon: DatabaseIcon,
    },
    {
        id: 'json-formatter-validator',
        name: 'JSON Formatter & Validator',
        description: 'Format, prettify, and validate your JSON data instantly with helpful error feedback.',
        category: ToolCategory.Developers,
        icon: JsonIcon,
    },
    {
        id: 'git-commit-generator',
        name: 'Git Commit Generator',
        description: 'Create Conventional Commit messages from your change descriptions.',
        category: ToolCategory.Developers,
        icon: GitCommitIcon,
    },
     {
        id: 'startup-idea-validator',
        name: 'Startup Idea Validator',
        description: 'Checks feasibility for African markets, providing risks and opportunities.',
        category: ToolCategory.Startups,
        icon: LightbulbIcon,
    },
    {
        id: 'social-media-post-generator',
        name: 'Social Media Post Generator',
        description: 'Generates engaging posts for Twitter, LinkedIn, and Instagram from a simple topic.',
        category: ToolCategory.Startups,
        icon: MegaphoneIcon,
    },
    {
        id: 'ai-content-improver',
        name: 'AI Content Improver',
        description: 'Rewrite and enhance your text. Change the tone, fix grammar, simplify language, or expand on ideas.',
        category: ToolCategory.Startups,
        icon: WandIcon,
    },
    {
        id: 'ux-flow-generator',
        name: 'UX Flow Generator',
        description: 'Describe an app or feature to generate a complete step-by-step user experience flow.',
        category: ToolCategory.Startups,
        icon: UserFlowIcon,
    },
     {
        id: 'career-path-builder',
        name: 'Career Path Builder',
        description: 'Suggests career routes & learning resources for your tech journey.',
        category: ToolCategory.Career,
        icon: BriefcaseIcon,
    },
    {
        id: 'resume-cover-letter-generator',
        name: 'Resume & Cover Letter Generator',
        description: 'Crafts professional resumes and cover letters tailored to your target job.',
        category: ToolCategory.Career,
        icon: IdentificationIcon,
    },
     {
        id: 'ai-text-summarizer',
        name: 'AI Text Summarizer',
        description: 'Condenses long articles, documents, or text into short summaries.',
        category: ToolCategory.Everyday,
        icon: DocumentTextIcon,
    },
    {
        id: 'ai-email-assistant',
        name: 'AI Email Assistant',
        description: 'Crafts professional or casual emails for any situation, with tone and length options.',
        category: ToolCategory.Everyday,
        icon: EnvelopeIcon,
    },
];