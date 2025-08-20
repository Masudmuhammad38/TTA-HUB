



import { GoogleGenAI } from "@google/genai";
import type { DebugResult, ApiRequestTemplate, RegexResult, SqlQueryResult, StartupValidationResult, CareerPathResult, TextSummaryResult, SocialMediaPostResult, EmailResult, ContentImproverResult, ResumeResult, CoverLetterResult, UXFlowResult } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const parseJsonResponse = <T>(rawText: string): T => {
    const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
    const match = rawText.match(jsonRegex);
    
    let jsonText;
    if (match && match[1]) {
        jsonText = match[1];
    } else {
        // If no markdown block, assume the whole response is JSON as a fallback.
        jsonText = rawText;
    }

    try {
        return JSON.parse(jsonText.trim()) as T;
    } catch (e) {
        console.error("Failed to parse JSON:", jsonText);
        throw new SyntaxError("Failed to parse the AI's response. The format was invalid.");
    }
};

export const debugCode = async (code: string, language: string): Promise<DebugResult> => {
    const jsonSchemaString = `{
  "errors": [{
    "line": "number, the line number of the error",
    "error": "string, a short technical description of the error",
    "explanation": "string, a clear explanation of the error and how to fix it"
  }],
  "fixedCode": "string, the complete corrected code"
}`;

    const prompt = `
        You are an expert code debugger. Your task is to analyze a snippet of code, identify any errors, explain them clearly, and provide a corrected version.

        Instructions:
        1.  Analyze the following ${language} code for syntax errors, logical errors, and potential runtime issues.
        2.  You MUST provide a response in a JSON format, enclosed within a single JSON markdown block.
        3.  The JSON object should match this structure:
            \`\`\`json
            ${jsonSchemaString}
            \`\`\`
        4.  For each error found, create an object with the line number, a brief error description, and a simple, clear explanation for a developer.
        5.  Provide a complete, corrected version of the code in the 'fixedCode' field.
        6.  If the code has no errors, return an empty array for 'errors' and the original code in the 'fixedCode' field.
        7. Do not include any text outside of the JSON markdown block.

        Code to analyze:
        \`\`\`${language}
        ${code}
        \`\`\`
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.2,
            },
        });
        
        const parsedResult = parseJsonResponse<DebugResult>(response.text);

        if (!parsedResult || !Array.isArray(parsedResult.errors) || typeof parsedResult.fixedCode !== 'string') {
            throw new Error('Invalid response format from AI.');
        }

        return parsedResult;
    } catch (error) {
        console.error("Error in debugCode:", error);
        if (error instanceof SyntaxError) {
             throw error;
        }
        throw new Error("Failed to get a valid response from the AI. Please try again.");
    }
};

export const generateApiRequest = async (prompt: string): Promise<ApiRequestTemplate> => {
    const jsonSchemaString = `{
  "url": "string, the full URL of the API endpoint",
  "method": "string, one of 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'",
  "headers": "object, key-value pairs of headers, e.g. { 'Content-Type': 'application/json' }",
  "body": "string, the request body as a string, often JSON. Omit for GET/DELETE."
}`;

    const fullPrompt = `
        You are an API request generator. Your task is to analyze a natural language prompt and create a valid API request template.

        Instructions:
        1.  Analyze the following prompt to determine the URL, HTTP method, headers, and body.
        2.  You MUST provide a response in a JSON format, enclosed within a single JSON markdown block.
        3.  The JSON object should match this structure:
            \`\`\`json
            ${jsonSchemaString}
            \`\`\`
        4.  For headers, include common ones like 'Content-Type': 'application/json' for POST/PUT requests if not specified.
        5.  If the prompt implies a JSON body, create a sample JSON object as a string.
        6.  If no body is needed (e.g., for a GET request), you can omit the 'body' field or set it to an empty string.
        7.  Do not include any text outside of the JSON markdown block.

        Prompt to analyze:
        "${prompt}"
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
            config: {
                temperature: 0.1,
            },
        });

        const parsedResult = parseJsonResponse<ApiRequestTemplate>(response.text);
        
        if (!parsedResult || typeof parsedResult.url !== 'string' || typeof parsedResult.method !== 'string') {
            throw new Error('Invalid response format from AI.');
        }

        return parsedResult;

    } catch (error) {
        console.error("Error in generateApiRequest:", error);
         if (error instanceof SyntaxError) {
             throw error;
        }
        throw new Error("Failed to get a valid API template from the AI. Please try again.");
    }
};

export const generateRegex = async (prompt: string): Promise<RegexResult> => {
    const jsonSchemaString = `{
  "pattern": "string, the generated regular expression pattern. It must be a valid regex string.",
  "explanation": "string, a clear and concise explanation of how the regex pattern works."
}`;

    const fullPrompt = `
        You are an expert regular expression generator. Your task is to analyze a natural language description and create a valid regex pattern and an explanation for it.

        Instructions:
        1.  Analyze the following description to create a regular expression.
        2.  You MUST provide a response in a JSON format, enclosed within a single JSON markdown block.
        3.  The JSON object should match this structure:
            \`\`\`json
            ${jsonSchemaString}
            \`\`\`
        4.  The 'pattern' must be a valid regex. Escape backslashes correctly for the JSON string format (e.g., '\\' becomes '\\\\').
        5.  The 'explanation' should break down the components of the regex and explain what each part does.
        6.  Do not include any text outside of the JSON markdown block.

        Description to analyze:
        "${prompt}"
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
            config: {
                temperature: 0.1,
            },
        });
        
        const parsedResult = parseJsonResponse<RegexResult>(response.text);

        if (!parsedResult || typeof parsedResult.pattern !== 'string' || typeof parsedResult.explanation !== 'string') {
            throw new Error('Invalid response format from AI.');
        }

        return parsedResult;

    } catch (error) {
        console.error("Error in generateRegex:", error);
         if (error instanceof SyntaxError) {
             throw error;
        }
        throw new Error("Failed to get a valid regex from the AI. Please try again.");
    }
};

export const generateSqlQuery = async (prompt: string, schema: string): Promise<SqlQueryResult> => {
    const jsonSchemaString = `{
  "query": "string, the generated SQL query. It should be syntactically correct.",
  "explanation": "string, a clear and concise explanation of what the SQL query does."
}`;

    const fullPrompt = `
        You are an expert SQL query writer. Your task is to analyze a natural language description and a database schema to create an efficient and accurate SQL query.

        Instructions:
        1.  Analyze the following description and database schema.
        2.  You MUST provide a response in a JSON format, enclosed within a single JSON markdown block.
        3.  The JSON object should match this structure:
            \`\`\`json
            ${jsonSchemaString}
            \`\`\`
        4.  The generated 'query' must be a valid SQL statement that fulfills the user's request based on the provided schema.
        5.  The 'explanation' should describe what the query does, including joins, WHERE clauses, or any complex logic.
        6.  If the schema is empty or insufficient, make a reasonable guess but prioritize generating a valid query for the user's prompt.
        7.  Do not include any text outside of the JSON markdown block.

        Database Schema:
        \`\`\`sql
        ${schema || 'No schema provided.'}
        \`\`\`

        User's Request:
        "${prompt}"
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
            config: {
                temperature: 0.1,
            },
        });
        
        const parsedResult = parseJsonResponse<SqlQueryResult>(response.text);

        if (!parsedResult || typeof parsedResult.query !== 'string' || typeof parsedResult.explanation !== 'string') {
            throw new Error('Invalid response format from AI.');
        }

        return parsedResult;

    } catch (error) {
        console.error("Error in generateSqlQuery:", error);
         if (error instanceof SyntaxError) {
             throw error;
        }
        throw new Error("Failed to get a valid SQL query from the AI. Please try again.");
    }
};


export const validateStartupIdea = async (idea: string, market: string): Promise<StartupValidationResult> => {
    const jsonSchemaString = `{
  "feasibilityScore": "number, an integer score from 1 (very low) to 10 (very high) representing the idea's potential success",
  "opportunities": "array of strings, listing key strengths and potential market opportunities",
  "risks": "array of strings, outlining potential challenges, threats, and weaknesses",
  "nextSteps": "array of strings, suggesting concrete, actionable next steps for the entrepreneur"
}`;

    const fullPrompt = `
        You are a Venture Capitalist and market analyst specializing in African tech ecosystems. Your task is to provide a concise, realistic, and actionable validation for a startup idea.

        Instructions:
        1.  Analyze the following startup idea within the context of the specified target market.
        2.  You MUST provide a response in a JSON format, enclosed within a single JSON markdown block.
        3.  The JSON object should match this structure:
            \`\`\`json
            ${jsonSchemaString}
            \`\`\`
        4.  **Feasibility Score**: Give a score from 1-10. Be critical and realistic.
        5.  **Opportunities**: Identify 2-3 key, specific opportunities. Avoid generic praise.
        6.  **Risks**: Identify 2-3 major, specific risks (e.g., 'Regulatory hurdles in Nigeria's fintech space' is better than 'government problems').
        7.  **Next Steps**: Provide 2-3 clear, actionable next steps (e.g., 'Build a simple MVP using a no-code tool to test demand' is better than 'do market research').
        8.  Do not include any text outside of the JSON markdown block.

        Startup Idea:
        "${idea}"

        Target Market:
        "${market}"
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
            config: {
                temperature: 0.5,
            },
        });
        
        const parsedResult = parseJsonResponse<StartupValidationResult>(response.text);

        if (!parsedResult || typeof parsedResult.feasibilityScore !== 'number' || !Array.isArray(parsedResult.opportunities) || !Array.isArray(parsedResult.risks) || !Array.isArray(parsedResult.nextSteps)) {
            throw new Error('Invalid response format from AI.');
        }

        return parsedResult;

    } catch (error) {
        console.error("Error in validateStartupIdea:", error);
         if (error instanceof SyntaxError) {
             throw error;
        }
        throw new Error("Failed to get a valid validation from the AI. Please try again.");
    }
};

export const generateCareerPath = async (currentRole: string, goal: string, experience: string): Promise<CareerPathResult> => {
    const jsonSchemaString = `{
  "suggestedRoles": [{
    "title": "string, the suggested job title",
    "description": "string, a brief description of this role",
    "relevance": "string, why this role is a good fit based on the user's input"
  }],
  "keySkillsToDevelop": ["string, a list of essential skills to acquire for the suggested roles"],
  "learningPath": [{
    "step": "number, the sequential step number (e.g., 1)",
    "title": "string, a concise title for this learning step",
    "description": "string, what to focus on during this step",
    "resources": [{
        "name": "string, the name of the resource",
        "type": "string, one of 'course', 'book', 'article', 'video', 'documentation'"
    }]
  }]
}`;

    const fullPrompt = `
        You are an expert career coach and tech industry mentor. Your task is to create a detailed, actionable career path for a user based on their current situation and goals.

        Instructions:
        1.  Analyze the user's current role/skills, career goal, and experience level.
        2.  You MUST provide a response in a JSON format, enclosed within a single JSON markdown block.
        3.  The JSON object should match this structure:
            \`\`\`json
            ${jsonSchemaString}
            \`\`\`
        4.  **Suggested Roles**: Provide 2-3 realistic job titles that align with the user's goal. For each, explain its relevance.
        5.  **Key Skills**: List the most important technical and soft skills the user needs to develop.
        6.  **Learning Path**: Create a clear, step-by-step plan. Each step should have a title, a description of the learning objective, and a few specific types of learning resources (e.g., a course on a specific topic, a well-known book). Be practical and logical.
        7.  Tailor the complexity and starting point of the path to the user's stated experience level.
        8.  Do not include any text outside of the JSON markdown block.

        User's Current Role/Skills:
        "${currentRole}"

        User's Career Goal:
        "${goal}"
        
        User's Experience Level:
        "${experience}"
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
            config: {
                temperature: 0.6,
            },
        });
        
        const parsedResult = parseJsonResponse<CareerPathResult>(response.text);

        if (!parsedResult || !Array.isArray(parsedResult.suggestedRoles) || !Array.isArray(parsedResult.keySkillsToDevelop) || !Array.isArray(parsedResult.learningPath)) {
            throw new Error('Invalid response format from AI.');
        }

        return parsedResult;

    } catch (error) {
        console.error("Error in generateCareerPath:", error);
         if (error instanceof SyntaxError) {
             throw error;
        }
        throw new Error("Failed to get a valid career path from the AI. Please try again.");
    }
};

export const summarizeText = async (text: string, format: 'short' | 'medium' | 'bullets'): Promise<TextSummaryResult> => {
    const jsonSchemaString = `{
  "summary": "string, the summarized text in the requested format."
}`;

    const formatInstruction = {
        short: 'a concise summary of 2-3 sentences.',
        medium: 'a detailed paragraph.',
        bullets: 'a bulleted list of the key points.'
    }[format];

    const fullPrompt = `
        You are an expert text summarizer. Your task is to analyze a piece of text and provide a summary in a specific format.

        Instructions:
        1.  Analyze the following text.
        2.  You MUST provide a response in a JSON format, enclosed within a single JSON markdown block.
        3.  The JSON object should match this structure:
            \`\`\`json
            ${jsonSchemaString}
            \`\`\`
        4.  The 'summary' field should contain ${formatInstruction}
        5.  Ensure the summary is clear, accurate, and captures the main ideas of the original text.
        6.  Do not include any text outside of the JSON markdown block.

        Text to summarize:
        """
        ${text}
        """
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
            config: {
                temperature: 0.3,
            },
        });
        
        const parsedResult = parseJsonResponse<TextSummaryResult>(response.text);

        if (!parsedResult || typeof parsedResult.summary !== 'string') {
            throw new Error('Invalid response format from AI.');
        }

        return parsedResult;

    } catch (error) {
        console.error("Error in summarizeText:", error);
         if (error instanceof SyntaxError) {
             throw error;
        }
        throw new Error("Failed to get a valid summary from the AI. Please try again.");
    }
};

export const generateSocialMediaPost = async (topic: string, platform: string, tone: string): Promise<SocialMediaPostResult> => {
    const jsonSchemaString = `{
  "post": "string, the generated social media post text."
}`;

    const fullPrompt = `
        You are a social media marketing expert. Your task is to create an engaging social media post based on a given topic, platform, and tone.

        Instructions:
        1.  Analyze the provided topic, target platform, and desired tone.
        2.  You MUST provide a response in a JSON format, enclosed within a single JSON markdown block.
        3.  The JSON object should match this structure:
            \`\`\`json
            ${jsonSchemaString}
            \`\`\`
        4.  The 'post' field should contain the generated social media post.
        5.  Tailor the post's length, style, and use of hashtags to be optimal for the specified platform.
            - Twitter: Keep it concise, use 2-3 relevant hashtags.
            - Facebook: Conversational and friendly tone, can be slightly longer (2-4 sentences), use 1-3 relevant hashtags and emojis.
            - LinkedIn: Professional tone, use paragraphs for readability, use business-oriented hashtags.
            - Instagram: Engaging caption, use relevant emojis, and a block of 5-10 popular and niche hashtags.
        6.  The generated post must align with the requested tone.
        7.  Do not include any text outside of the JSON markdown block.

        Topic:
        "${topic}"

        Platform:
        "${platform}"

        Tone:
        "${tone}"
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
            config: {
                temperature: 0.7,
            },
        });
        
        const parsedResult = parseJsonResponse<SocialMediaPostResult>(response.text);

        if (!parsedResult || typeof parsedResult.post !== 'string') {
            throw new Error('Invalid response format from AI.');
        }

        return parsedResult;

    } catch (error) {
        console.error("Error in generateSocialMediaPost:", error);
         if (error instanceof SyntaxError) {
             throw error;
        }
        throw new Error("Failed to get a valid post from the AI. Please try again.");
    }
};

export const generateEmail = async (prompt: string, tone: string, length: string): Promise<EmailResult> => {
    const jsonSchemaString = `{
  "subject": "string, a concise and relevant subject line for the email.",
  "body": "string, the full text of the email body, formatted with appropriate line breaks (\\n)."
}`;

    const lengthInstruction = {
        Short: 'a few sentences (2-3).',
        Medium: 'one or two short paragraphs.',
        Long: 'multiple paragraphs with more detail.'
    }[length];

    const fullPrompt = `
        You are an expert email writing assistant. Your task is to craft a complete email based on a user's prompt, a desired tone, and a desired length.

        Instructions:
        1.  Analyze the user's request to understand the purpose and context of the email.
        2.  You MUST provide a response in a JSON format, enclosed within a single JSON markdown block.
        3.  The JSON object should match this structure:
            \`\`\`json
            ${jsonSchemaString}
            \`\`\`
        4.  The 'subject' should be clear and professional.
        5.  The 'body' should be well-written, grammatically correct, and adhere to the specified tone. The length should be roughly ${lengthInstruction}.
        6.  The body should start with a greeting (e.g., "Hi [Name],", "Dear Hiring Manager,") and end with a sign-off (e.g., "Best regards,", "Thanks,"). Use placeholders like "[Your Name]" and "[Recipient's Name]" where appropriate.
        7.  Do not include any text outside of the JSON markdown block.

        User's Request:
        "${prompt}"

        Desired Tone:
        "${tone}"
        
        Desired Length:
        "${length}"
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
            config: {
                temperature: 0.7,
            },
        });
        
        const parsedResult = parseJsonResponse<EmailResult>(response.text);

        if (!parsedResult || typeof parsedResult.subject !== 'string' || typeof parsedResult.body !== 'string') {
            throw new Error('Invalid response format from AI.');
        }

        return parsedResult;

    } catch (error) {
        console.error("Error in generateEmail:", error);
         if (error instanceof SyntaxError) {
             throw error;
        }
        throw new Error("Failed to get a valid email from the AI. Please try again.");
    }
};

export const improveContent = async (text: string, goal: string): Promise<ContentImproverResult> => {
    const jsonSchemaString = `{
  "improvedText": "string, the rewritten and improved text."
}`;

    const fullPrompt = `
        You are an expert editor and copywriter. Your task is to rewrite a piece of text based on a specific goal provided by the user.

        Instructions:
        1.  Analyze the provided text and the user's goal.
        2.  You MUST provide a response in a JSON format, enclosed within a single JSON markdown block.
        3.  The JSON object should match this structure:
            \`\`\`json
            ${jsonSchemaString}
            \`\`\`
        4.  The 'improvedText' field should contain the rewritten text, ensuring it is well-written, grammatically correct, and perfectly aligns with the user's goal.
        5.  Do not add any commentary or explanation outside of the rewritten text.
        6.  Do not include any text outside of the JSON markdown block.

        User's Goal:
        "${goal}"

        Text to Improve:
        """
        ${text}
        """
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
            config: {
                temperature: 0.7,
            },
        });
        
        const parsedResult = parseJsonResponse<ContentImproverResult>(response.text);

        if (!parsedResult || typeof parsedResult.improvedText !== 'string') {
            throw new Error('Invalid response format from AI.');
        }

        return parsedResult;

    } catch (error) {
        console.error("Error in improveContent:", error);
         if (error instanceof SyntaxError) {
             throw error;
        }
        throw new Error("Failed to get a valid response from the AI. Please try again.");
    }
};


export const generateResume = async (details: { fullName: string; contactInfo: string; summary: string; experience: string; education: string; skills: string }): Promise<ResumeResult> => {
    const jsonSchemaString = `{ "resumeText": "string, the full, formatted resume text." }`;
    const fullPrompt = `
        You are a professional resume writer. Your task is to create a clean, well-formatted, and professional resume based on the following details.

        Instructions:
        1.  Use the provided details to construct a standard resume.
        2.  Format the output as a single string of plain text, using newlines (\\n) for spacing and structure.
        3.  Use clear headings (e.g., PROFESSIONAL SUMMARY, WORK EXPERIENCE, EDUCATION, SKILLS) followed by a line of dashes or asterisks for separation.
        4.  Structure the work experience with the job title, company, and dates clearly listed, followed by bullet points for responsibilities.
        5.  You MUST provide a response in a JSON format, enclosed within a single JSON markdown block.
        6.  The JSON object must have a single key "resumeText" containing the complete resume.
        7.  Do not include any text outside of the JSON markdown block.

        Details:
        - Full Name: ${details.fullName}
        - Contact Info: ${details.contactInfo}
        - Professional Summary: ${details.summary}
        - Work Experience: ${details.experience}
        - Education: ${details.education}
        - Skills: ${details.skills}
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
            config: { temperature: 0.5 },
        });
        const parsedResult = parseJsonResponse<ResumeResult>(response.text);
        if (!parsedResult || typeof parsedResult.resumeText !== 'string') {
            throw new Error('Invalid response format from AI.');
        }
        return parsedResult;
    } catch (error) {
        console.error("Error in generateResume:", error);
        if (error instanceof SyntaxError) throw error;
        throw new Error("Failed to get a valid resume from the AI. Please try again.");
    }
};

export const generateCoverLetter = async (details: { yourName: string; company: string; jobTitle: string; jobDescription: string; tone: string }): Promise<CoverLetterResult> => {
    const jsonSchemaString = `{ "coverLetterText": "string, the full, formatted cover letter text." }`;
    const fullPrompt = `
        You are an expert career coach. Your task is to write a compelling and tailored cover letter based on the provided details.

        Instructions:
        1.  Craft a professional cover letter that is tailored to the specific job title and company.
        2.  Incorporate keywords and requirements from the provided job description/user strengths to show a strong match.
        3.  The tone of the letter must be ${details.tone}.
        4.  The output should be a single string of plain text, formatted with proper paragraphs and newlines (\\n).
        5.  You MUST provide a response in a JSON format, enclosed within a single JSON markdown block.
        6.  The JSON object must have a single key "coverLetterText" containing the complete letter.
        7.  Do not include any text outside of the JSON markdown block.

        Details:
        - Applicant's Name: ${details.yourName}
        - Company Name: ${details.company}
        - Job Title Applying For: ${details.jobTitle}
        - Job Description / Key Strengths to Highlight: ${details.jobDescription}
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
            config: { temperature: 0.8 },
        });
        const parsedResult = parseJsonResponse<CoverLetterResult>(response.text);
        if (!parsedResult || typeof parsedResult.coverLetterText !== 'string') {
            throw new Error('Invalid response format from AI.');
        }
        return parsedResult;
    } catch (error) {
        console.error("Error in generateCoverLetter:", error);
        if (error instanceof SyntaxError) throw error;
        throw new Error("Failed to get a valid cover letter from the AI. Please try again.");
    }
};

export const generateUXFlow = async (prompt: string): Promise<UXFlowResult> => {
    const jsonSchemaString = `{
  "flow": [{
    "step": "number, the sequential step in the user flow",
    "title": "string, a short, descriptive title for this step (e.g., 'Onboarding Screen')",
    "userAction": "string, what the user does at this step (e.g., 'User opens the app for the first time')",
    "systemResponse": "string, how the system or UI responds to the user's action (e.g., 'Displays a welcome screen with a 'Get Started' button')"
  }]
}`;

    const fullPrompt = `
        You are an expert UX/UI designer. Your task is to create a clear, logical, and user-friendly step-by-step user flow based on a description of an application or feature.

        Instructions:
        1.  Analyze the following application description.
        2.  You MUST provide a response in a JSON format, enclosed within a single JSON markdown block.
        3.  The JSON object should match this structure:
            \`\`\`json
            ${jsonSchemaString}
            \`\`\`
        4.  Break down the user's journey into distinct, sequential steps.
        5.  For each step, clearly define the user's action and the corresponding system/UI response.
        6.  The flow should cover the primary "happy path" from start to finish for the described feature.
        7.  Do not include any text outside of the JSON markdown block.

        Application Description:
        "${prompt}"
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
            config: {
                temperature: 0.4,
            },
        });
        
        const parsedResult = parseJsonResponse<UXFlowResult>(response.text);

        if (!parsedResult || !Array.isArray(parsedResult.flow)) {
            throw new Error('Invalid response format from AI.');
        }

        return parsedResult;

    } catch (error) {
        console.error("Error in generateUXFlow:", error);
         if (error instanceof SyntaxError) {
             throw error;
        }
        throw new Error("Failed to get a valid UX flow from the AI. Please try again.");
    }
};
