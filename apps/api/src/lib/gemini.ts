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

export async function extractTrades(description: string): Promise<string[]> {
    const prompt = `Based on the following project description, return a JSON array of specific trades involved (e.g., ["Electrician", "Plumber", "Carpenter"]). Only return the JSON array: ${description}`;
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    try {
        // Basic extraction logic for JSON from Gemini output
        const jsonMatch = text.match(/\[.*\]/s);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return [];
    } catch (err) {
        console.error('Error parsing trades from Gemini:', err);
        return [];
    }
}
