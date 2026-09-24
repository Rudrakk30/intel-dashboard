import { GoogleGenAI, Type, Schema } from '@google/genai';
import type { Article, Event } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.AI_API_KEY });

const EventSchema: Schema = {
  type: Type.ARRAY,
  description: "A list of distinct intelligence events extracted from the articles.",
  items: {
    type: Type.OBJECT,
    properties: {
      headline: {
        type: Type.STRING,
        description: "A professional, objective headline summarizing the event."
      },
      summary: {
        type: Type.STRING,
        description: "A concise 2-4 sentence summary of what happened."
      },
      why_it_matters: {
        type: Type.STRING,
        description: "A short explanation of the significance of this event."
      },
      category: {
        type: Type.STRING,
        description: "One of: AI, Fintech, Technology, Finance, Startups, Other"
      },
      subcategory: {
        type: Type.STRING,
        description: "A more specific category (e.g. 'Semiconductors', 'Venture Capital', 'Regulation')"
      },
      importance_score: {
        type: Type.INTEGER,
        description: "An importance score from 1-100 based on reach, impact, novelty, and market significance."
      },
      entities: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "List of major companies, organizations, or people involved."
      },
      article_ids: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "The original IDs of the articles that are part of this event cluster."
      }
    },
    required: ["headline", "summary", "why_it_matters", "category", "importance_score", "article_ids"]
  }
};

const SYSTEM_INSTRUCTION = `
You are INTEL, an expert global intelligence analyst.
Your task is to analyze a batch of recently published articles and extract the core "Events".
An event is a distinct, significant development. Multiple articles covering the same story must be clustered into ONE EVENT.
Ignore noise, opinion pieces, and minor updates. Prioritize signal over noise.

Evaluate importance (1-100) based on:
1. Impact (industry, market, technology)
2. Reach (global vs regional)
3. Business significance (IPOs, M&A, major product launches)
4. Novelty
5. Source quality and cross-source confirmation

Return a structured JSON list of these events. Make sure to map each event to the exact 'article_id's it was derived from.
[SYSTEM INSTRUCTION END]
`;

export async function extractAndClusterEvents(articles: Article[]): Promise<{
  events: Partial<Event>[];
  articleToEventMap: Record<string, number>;
}> {
  if (!articles || articles.length === 0) return { events: [], articleToEventMap: {} };

  console.log(`[AI Engine] Analyzing ${articles.length} articles...`);

  // Prepare input text safely to prevent prompt injection
  const articlesInput = articles.map(a => `
Article ID: ${a.id}
Title: ${a.title}
Published: ${a.published_at}
Description: ${a.description}
---`).join('\\n');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `[ARTICLE CONTENT BEGIN]\n${articlesInput}\n[ARTICLE CONTENT END]`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: EventSchema,
        temperature: 0.1, // Keep it objective and deterministic
      }
    });

    const outputText = response.text;
    if (!outputText) throw new Error("Empty response from AI");

    const parsedEvents = JSON.parse(outputText);
    
    const events: Partial<Event>[] = [];
    const articleToEventMap: Record<string, number> = {};

    parsedEvents.forEach((aiEvent: any, index: number) => {
      // Create Event Record
      events.push({
        headline: aiEvent.headline,
        summary: aiEvent.summary,
        why_it_matters: aiEvent.why_it_matters,
        category: aiEvent.category,
        subcategory: aiEvent.subcategory || null,
        event_time: new Date().toISOString(), // In real app, calculate from earliest article
        first_seen: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        importance_score: aiEvent.importance_score,
        entities: aiEvent.entities ? { list: aiEvent.entities } : null,
        is_published: true,
      });

      // Map back to articles
      if (aiEvent.article_ids && Array.isArray(aiEvent.article_ids)) {
        aiEvent.article_ids.forEach((id: string) => {
          articleToEventMap[id] = index;
        });
      }
    });

    return { events, articleToEventMap };

  } catch (error) {
    console.error("AI Clustering failed:", error);
    return { events: [], articleToEventMap: {} };
  }
}
