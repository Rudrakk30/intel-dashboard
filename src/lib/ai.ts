import { GoogleGenAI } from '@google/genai';
import type { Article, Event } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.AI_API_KEY });

const SYSTEM_INSTRUCTION = `
You are INTEL, an expert global intelligence analyst.
Analyze the articles below and extract distinct "Events" (significant developments).
Multiple articles about the same story must be merged into ONE event.
Ignore noise, opinion, and minor updates.

For each event provide:
- headline: Professional, objective headline
- summary: 2-4 sentence summary
- why_it_matters: Short significance explanation
- category: One of: AI, Fintech, Technology, Finance, Startups
- subcategory: More specific (e.g. Semiconductors, Venture Capital)
- importance_score: 1-100 based on impact, reach, novelty
- article_ids: Array of article IDs this event was derived from

Return ONLY a valid JSON array of event objects. No markdown, no code fences.
Example: [{"headline":"...","summary":"...","why_it_matters":"...","category":"AI","subcategory":"LLMs","importance_score":85,"article_ids":["id1","id2"]}]
`;

export async function extractAndClusterEvents(articles: Article[]): Promise<{
  events: Partial<Event>[];
  articleToEventMap: Record<string, number>;
}> {
  if (!articles || articles.length === 0) return { events: [], articleToEventMap: {} };

  console.log(`[AI Engine] Analyzing ${articles.length} articles...`);

  const articlesInput = articles.map(a => 
    `Article ID: ${a.id}\nTitle: ${a.title}\nPublished: ${a.published_at}\nDescription: ${a.description || 'N/A'}\n---`
  ).join('\n');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Analyze these articles and return a JSON array of events:\n\n${articlesInput}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.1,
      }
    });

    let outputText = response.text || '';
    console.log(`[AI Engine] Raw response length: ${outputText.length}`);
    
    // Clean up response - remove markdown code fences if present
    outputText = outputText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    
    if (!outputText) throw new Error("Empty response from AI");

    const parsedEvents = JSON.parse(outputText);
    
    if (!Array.isArray(parsedEvents)) {
      console.error('[AI Engine] Response is not an array');
      return { events: [], articleToEventMap: {} };
    }

    console.log(`[AI Engine] Parsed ${parsedEvents.length} events`);

    const events: Partial<Event>[] = [];
    const articleToEventMap: Record<string, number> = {};

    parsedEvents.forEach((aiEvent: any, index: number) => {
      events.push({
        headline: aiEvent.headline,
        summary: aiEvent.summary,
        why_it_matters: aiEvent.why_it_matters,
        category: aiEvent.category,
        subcategory: aiEvent.subcategory || null,
        event_time: new Date().toISOString(),
        first_seen: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        importance_score: aiEvent.importance_score,
        entities: aiEvent.entities ? { list: aiEvent.entities } : null,
        is_published: true,
      });

      if (aiEvent.article_ids && Array.isArray(aiEvent.article_ids)) {
        aiEvent.article_ids.forEach((id: string) => {
          articleToEventMap[id] = index;
        });
      }
    });

    return { events, articleToEventMap };

  } catch (error) {
    console.error("[AI Clustering failed]:", error);
    return { events: [], articleToEventMap: {} };
  }
}
