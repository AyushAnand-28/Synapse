import { GoogleGenerativeAI } from '@google/generative-ai';
import { IAIEngineService } from './interfaces';

interface GraphNodeRaw {
  title: string;
  estimated_minutes: number;
  depends_on_indices: number[];
}

export class AIEngineService implements IAIEngineService {
  private client: GoogleGenerativeAI | null = null;

  private getClient(): GoogleGenerativeAI {
    if (!this.client) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error('GEMINI_API_KEY not set — falling back to mock');
      this.client = new GoogleGenerativeAI(apiKey);
    }
    return this.client;
  }

  async generateDependencies(topics: string[]): Promise<GraphNodeRaw[]> {
    try {
      const genAI = this.getClient();
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const prompt = `
You are an academic curriculum designer. Given the following list of study topics, build a dependency graph.
Return ONLY a valid JSON array (no markdown, no explanation) with this exact shape:
[{ "title": "<topic title>", "estimated_minutes": <number>, "depends_on_indices": [<indices>] }]
Rules:
- Keep titles from the list exactly.
- estimated_minutes between 30 and 240.
- depends_on_indices must only reference earlier indices (no cycles).
- Foundational topics have empty depends_on_indices.

Topics:
${topics.map((t, i) => `${i}. ${t}`).join('\n')}
`;
      const result = await model.generateContent(prompt);
      const raw = result.response.text().replace(/```json|```/g, '').trim();
      const parsed: GraphNodeRaw[] = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('Invalid AI response');
      return parsed;
    } catch (err) {
      console.warn('[AIEngine] Gemini failed, using linear mock:', (err as Error).message);
      return this.linearMock(topics);
    }
  }

  private linearMock(topics: string[]): GraphNodeRaw[] {
    return topics.map((title, i) => ({
      title,
      estimated_minutes: 90,
      depends_on_indices: i > 0 ? [i - 1] : [],
    }));
  }
}
