import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ClassificationResult, ClassificationType, Event, Priority, EventType } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const classificationSchema = {
    type: Type.OBJECT,
    properties: {
        type: {
            type: Type.STRING,
            enum: [ClassificationType.TASK, ClassificationType.MULTI_TASK, ClassificationType.NOTE, ClassificationType.EVENT, ClassificationType.UNKNOWN],
            description: 'The classified type of the content. Use "multi_task" if the user lists multiple distinct tasks.',
        },
        summary: {
            type: Type.STRING,
            description: 'A concise summary of the original user command. This is mandatory.',
        },
        data: {
            type: Type.ARRAY,
            description: 'A list of extracted data objects. ALWAYS return an array, even for a single item.',
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: 'The title of the item. For tasks or events. For notes, it can be a concise title based on the content.' },
                    content: { type: Type.STRING, description: 'The main content. For notes or tasks.' },
                    date: { type: Type.STRING, description: 'The date for an event or a high-priority task (e.g., YYYY-MM-DD).' },
                    time: { type: Type.STRING, description: 'The time for an event (e.g., HH:MM, 24-hour format).' },
                    priority: { type: Type.STRING, enum: ['none', 'low', 'medium', 'high'], description: 'For tasks only. Set to "high" if the user implies urgency.' },
                    eventType: { type: Type.STRING, enum: ['meeting', 'appointment', 'reminder', 'other', 'birthday', 'anniversary', 'important-date'], description: 'For events only. Classify the type of event.' },
                    conflict: { type: Type.BOOLEAN, description: 'For events only. True if the requested time conflicts with an existing event.' },
                    suggestions: {
                        type: Type.ARRAY,
                        description: 'For events with conflicts only. An array of 3 suggested alternative time slots in "YYYY-MM-DD HH:MM" format.',
                        items: { type: Type.STRING }
                    }
                },
            }
        },
    },
    required: ['type', 'summary', 'data'],
};

export const classifyText = async (text: string, existingEvents: Event[]): Promise<ClassificationResult> => {
    try {
        const eventsContext = existingEvents.map(e => ({ title: e.title, startDate: e.startDate, startTime: e.startTime })).join('\n');
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are an intelligent scheduling and task management assistant. Analyze the user's command, check for calendar conflicts, and provide suggestions if necessary. Today's date is ${new Date().toISOString().split('T')[0]}.

User's current calendar:
${eventsContext.length > 0 ? eventsContext : 'The calendar is empty.'}

User's command: "${text}"

Instructions:
1. ALWAYS generate a concise summary of the user's command. This will be saved as a note.
2. Classify the primary intent. If the user lists multiple distinct tasks (e.g., "add tasks: buy milk, walk the dog", or using bullet points), classify the type as 'multi_task'. Otherwise, classify as 'task', 'note', or 'event'.
3. ALWAYS return the 'data' field as an array. For single items, it will be an array with one object.
4. For 'multi_task', create a separate object for each task in the 'data' array. Extract the content for each task.
5. If the intent is a single 'task' and the user implies urgency (e.g., 'urgent', 'ASAP'), set 'priority' to "high" and set a 'date' for 2 days from today. Otherwise, priority is "none".
6. If it is an 'event', extract the title, date, and time (24-hour format).
7. Identify the event type ('reminder', 'birthday', 'meeting', etc.).
8. Check for event time conflicts with the user's calendar. A conflict exists if another event is within an hour.
9. If a conflict exists: set 'conflict' to true and suggest 3 alternative open slots.
10. If no conflict, set 'conflict' to false.
11. Return the full response in the required JSON format.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: classificationSchema,
            },
        });
        const jsonResponse = JSON.parse(response.text);
        return jsonResponse as ClassificationResult;
    } catch (error) {
        console.error("Error classifying text:", error);
        return { 
            type: ClassificationType.UNKNOWN, 
            summary: `Could not process the request: "${text}"`,
            data: [{ content: text }] 
        };
    }
};

export const improveGrammar = async (text: string): Promise<string> => {
    if (!text.trim()) return '';
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Correct any spelling and grammar mistakes in the following text:\n\n"${text}"`,
        });
        return response.text.trim();
    } catch(error) {
        console.error("Error improving grammar:", error);
        return text; // Return original text on error
    }
};

export const summarizeText = async (text: string): Promise<string> => {
    if (!text.trim()) return '';
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Summarize the following text concisely:\n\n"${text}"`,
        });
        return response.text.trim();
    } catch(error) {
        console.error("Error summarizing text:", error);
        return text; // Return original text on error
    }
};

export const generateSpeech = async (text: string): Promise<string | null> => {
    if (!text.trim()) return null;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio || null;
    } catch (error) {
        console.error("Error generating speech:", error);
        return null;
    }
};

export const summarizeConversation = async (transcript: string): Promise<string> => {
    if (!transcript.trim()) return '';
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are an expert meeting summarizer. Take the following conversation transcript and provide a concise summary. Structure the summary with sections for 'Key Points', 'Decisions Made', and 'Action Items'. If any section is not applicable, omit it. Format the output cleanly using Markdown (e.g., using ### for headers and * for list items).

Transcript:
"${transcript}"`,
        });
        return response.text.trim();
    } catch(error) {
        console.error("Error summarizing conversation:", error);
        return `Failed to summarize the following transcript:\n\n${transcript}`;
    }
};
