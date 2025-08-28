export class AIService {
  private static apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  private static baseURL = 'https://generativelanguage.googleapis.com/v1beta';
  private static model = 'models/gemini-1.5-flash';
  private static isBusy = false;

  private static async requestGemini(body: unknown): Promise<any | null> {
    if (!this.apiKey) return null;

    const url = `${this.baseURL}/${this.model}:generateContent?key=${this.apiKey}`;
    const maxRetries = 5;
    let delayMs = 1200; // start with 1.2s backoff

    // Simple mutex: avoid overlapping requests which can trigger 429
    let waitCycles = 0;
    while (this.isBusy && waitCycles < 10) {
      await new Promise((r) => setTimeout(r, 250));
      waitCycles++;
    }
    this.isBusy = true;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          body: JSON.stringify(body)
        });

        if (response.ok) {
          const data = await response.json();
          this.isBusy = false;
          return data;
        }

        // If rate-limited, backoff and retry
        if (response.status === 429 && attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, delayMs));
          delayMs *= 2; // exponential
          continue;
        }

        // Non-retriable or max retries exceeded
        this.isBusy = false;
        return null;
      } catch (_err) {
        if (attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, delayMs));
          delayMs *= 2;
          continue;
        }
        this.isBusy = false;
        return null;
      }
    }
    this.isBusy = false;
    return null;
  }

  static async generateSummary(content: string): Promise<string> {
    if (!content.trim()) return '';
    
    try {
      const data = await this.requestGemini({
        contents: [
          {
            role: 'user',
            parts: [
              { text: 'You are a helpful assistant that creates concise summaries. Summarize the following text in 1-2 sentences.' },
              { text: content }
            ]
          }
        ]
      });
      if (!data) throw new Error('AI service unavailable');
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Summary unavailable';
    } catch (error) {
      return 'AI summary unavailable - using local fallback';
    }
  }

  static async generateTags(content: string): Promise<string[]> {
    if (!content.trim()) return [];
    
    try {
      const data = await this.requestGemini({
        contents: [
          {
            role: 'user',
            parts: [
              { text: 'Generate 3-5 relevant tags for the following content. Return only the tags separated by commas, no other text.' },
              { text: content }
            ]
          }
        ]
      });
      if (!data) throw new Error('AI service unavailable');
      const tagsString = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return tagsString
        .split(',')
        .map((tag: string) => tag.trim())
        .filter((tag: string) => tag);
    } catch (error) {
      return ['note', 'document'];
    }
  }

  static async translateText(text: string, targetLanguage: string): Promise<string> {
    if (!text.trim()) return text;
    
    try {
      const data = await this.requestGemini({
        contents: [
          {
            role: 'user',
            parts: [
              { text: `Translate the following text to ${targetLanguage}. Return only the translation, no other text.` },
              { text }
            ]
          }
        ]
      });
      if (!data) throw new Error('AI service unavailable');
      return data.candidates?.[0]?.content?.parts?.[0]?.text || text;
    } catch (error) {
      return text;
    }
  }

  static async checkGrammar(text: string): Promise<any[]> {
    if (!text.trim()) return [];
    try {
      const data = await this.requestGemini({
        contents: [
          {
            role: 'user',
            parts: [
              { text: 'Find grammar/spelling issues in this text. Return a compact JSON array of objects with fields: text (string), suggestion (string). No extra text.' },
              { text }
            ]
          }
        ]
      });
      const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter((i: any) => i?.text && i?.suggestion);
      return [];
    } catch {
      // Fallback tiny heuristic for common typo
      return text.includes('teh') ? [{ text: 'teh', suggestion: 'the' }] : [];
    }
  }

  static async getGlossaryTerms(text: string): Promise<any[]> {
    // Mock glossary terms for demonstration
    const terms = ['AI', 'encryption', 'database', 'algorithm'];
    return terms.map(term => ({
      term,
      definition: `Definition for ${term}`,
      position: { start: text.indexOf(term), end: text.indexOf(term) + term.length }
    })).filter(term => term.position.start !== -1);
  }

  static async getInsights(text: string): Promise<string[]> {
    if (!text.trim()) return [];
    try {
      const data = await this.requestGemini({
        contents: [
          {
            role: 'user',
            parts: [
              { text: 'Extract 3-5 actionable insights or key points from the text. Return each as a bullet sentence.' },
              { text }
            ]
          }
        ]
      });
      const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return raw.split(/\n|-\s+/).map((s: string) => s.trim()).filter((s: string) => s.length > 0).slice(0,5);
    } catch {
      return [];
    }
  }
}