import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { TRADES } from './constants';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const TradeSchema = z.array(z.enum(TRADES)).min(1);

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
    const prompt = `Based on the following project description, return a JSON array of specific trades involved. Only return the JSON array. Allowed trades are: ${TRADES.join(', ')}. Description: ${description}`;

    try {
        const result = await geminiModel.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Basic extraction logic for JSON from Gemini output
        const jsonMatch = text.match(/\[.*\]/s);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            const validation = TradeSchema.safeParse(parsed);

            if (validation.success) {
                return validation.data;
            } else {
                console.warn('Gemini returned invalid trades:', validation.error);
            }
        } else {
            console.warn('Gemini returned no JSON array found in text:', text);
        }
    } catch (err) {
        console.error('Error processing trades from Gemini:', err);
    }

    console.warn('Falling back to default trade: General Contractor');
    return ['General Contractor'];
}

export async function generateCombinedSummary(projectDescription: string, quotes: any[]) {
    const quotesInfo = quotes.map(q => `${q.trade}: R${q.amount} by ${q.serviceProvider.name} (${q.proposal})`).join('\n');
    const prompt = `Write a polite, professional summary of the work being performed by all parties for this project. 
  
  Project Description: ${projectDescription}
  
  Selected Quotes:
  ${quotesInfo}
  
  Keep the tone helpful and encouraging.`;

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
}
