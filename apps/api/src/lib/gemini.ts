import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function deconstructProject(description: string) {
    const prompt = `Deconstruct the following project request into key requirements and deliverables: ${description}`;
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
}

export async function generateBio(providerInfo: any) {
    const prompt = `Generate a professional service provider bio based on this info: ${JSON.stringify(providerInfo)}`;
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
}
