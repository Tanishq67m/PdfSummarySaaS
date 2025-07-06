
export interface EnhancedSummaryResult {
  title: string
  content: string
  keyPoints: string[]
  actionItems: string[]
  tags: string[]
  wordCount: number
  sentiment: "positive" | "neutral" | "negative"
  complexity: "low" | "medium" | "high"
  readingTime: number
  emoji: string
}

export interface SummarizationOptions {
  model: "gpt-4o" | "gpt-4" | "gpt-3.5-turbo" | "gemini-pro" | "google/gemma-3n-e4b-it"
  maxLength: number
  includeActionItems: boolean
  includeEmojis: boolean
  tone: "professional" | "casual" | "academic"
  focusAreas: string[]
}

// Enhanced AI summarization with context awareness
export async function generateEnhancedSummary(
  text: string,
  fileName: string,
  chunks: string[],
  options: SummarizationOptions = {
    model: "google/gemma-3n-e4b-it",
    maxLength: 1000,
    includeActionItems: true,
    includeEmojis: true,
    tone: "professional",
    focusAreas: [],
  },
): Promise<EnhancedSummaryResult> {
  try {
    const apiKey = process.env.AIMLAPI_KEY;
    if (!apiKey) {
      throw new Error("No AIMLAPI_KEY found");
    }
    // Use chunks for better context if document is large
    const contentToSummarize = text.length > 10000 ? chunks.slice(0, 5).join("\n\n") : text;
    const focusAreasText = options.focusAreas.length > 0 ? `Focus particularly on: ${options.focusAreas.join(", ")}` : "";
    const prompt = `You are an expert document analyst and summarizer. Analyze the following document and create a comprehensive, ${options.tone} summary with ${options.includeEmojis ? "appropriate emojis" : "no emojis"}.
Document: ${fileName}
Content: ${contentToSummarize}
${focusAreasText}
Please provide a JSON response with the following structure:\n{\n  \"title\": \"A descriptive title with ${options.includeEmojis ? "relevant emoji" : "no emoji"} (max 100 characters)\",\n  \"content\": \"A comprehensive ${options.tone} summary (${options.maxLength} words max)\",\n  \"keyPoints\": [\"Array of 5-8 key insights with ${options.includeEmojis ? "emojis" : "bullet points"}\"],\n  \"actionItems\": [\"Array of 3-5 actionable recommendations${options.includeActionItems ? "" : " (leave empty if not applicable)"}\"],\n  \"tags\": [\"Array of 4-8 relevant tags/categories for this document\"]\n}`;
    const apiUrl = "https://api.aimlapi.com/v1/chat/completions";
    const payload = {
      model: "google/gemma-3n-e4b-it",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 2048,
      temperature: 0.7,
    };
    const apiResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      throw new Error(`AIMLAPI error: ${apiResponse.status} ${apiResponse.statusText} - ${errorText}`);
    }
    const responseData = await apiResponse.json();
    const summaryText = responseData.choices?.[0]?.message?.content || "";
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(summaryText);
    } catch {
      parsed = null;
    }
    function isEnhancedSummaryResultLike(obj: unknown): obj is { title?: string; content?: string; keyPoints?: unknown[]; actionItems?: unknown[]; tags?: unknown[] } {
      return !!obj && typeof obj === "object";
    }
    if (isEnhancedSummaryResultLike(parsed)) {
      const wordCount = typeof parsed.content === "string" ? parsed.content.split(/\s+/).length : summaryText.split(/\s+/).length;
      const readingTime = Math.ceil(wordCount / 200);
      return {
        title: typeof parsed.title === "string" ? parsed.title : fileName,
        content: typeof parsed.content === "string" ? parsed.content : summaryText,
        keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints as string[] : [],
        actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems as string[] : [],
        tags: Array.isArray(parsed.tags) ? parsed.tags as string[] : [],
        wordCount,
        sentiment: "neutral",
        complexity: "medium",
        readingTime,
        emoji: "📄",
      };
    } else {
      const wordCount = summaryText.split(/\s+/).length;
      const readingTime = Math.ceil(wordCount / 200);
      return {
        title: fileName,
        content: summaryText,
        keyPoints: [],
        actionItems: [],
        tags: [],
        wordCount,
        sentiment: "neutral",
        complexity: "medium",
        readingTime,
        emoji: "📄",
      };
    }
  } catch (error) {
    console.error("❌ Enhanced AI summarization failed:", error);
    throw new Error(`AI summarization failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

// Context-aware summarization for different document types
export async function generateContextAwareSummary(
  text: string,
  fileName: string,
  documentType: "business" | "academic" | "technical" | "legal" | "general",
): Promise<EnhancedSummaryResult> {
  const contextOptions: Record<string, SummarizationOptions> = {
    business: {
      model: "google/gemma-3n-e4b-it",
      maxLength: 800,
      includeActionItems: true,
      includeEmojis: true,
      tone: "professional",
      focusAreas: ["strategy", "financials", "operations", "recommendations"],
    },
    academic: {
      model: "google/gemma-3n-e4b-it",
      maxLength: 1200,
      includeActionItems: false,
      includeEmojis: false,
      tone: "academic",
      focusAreas: ["methodology", "findings", "conclusions", "implications"],
    },
    technical: {
      model: "google/gemma-3n-e4b-it",
      maxLength: 1000,
      includeActionItems: true,
      includeEmojis: false,
      tone: "professional",
      focusAreas: ["specifications", "implementation", "requirements", "architecture"],
    },
    legal: {
      model: "google/gemma-3n-e4b-it",
      maxLength: 1500,
      includeActionItems: true,
      includeEmojis: false,
      tone: "professional",
      focusAreas: ["obligations", "rights", "compliance", "risks"],
    },
    general: {
      model: "google/gemma-3n-e4b-it",
      maxLength: 1000,
      includeActionItems: true,
      includeEmojis: true,
      tone: "professional",
      focusAreas: [],
    },
  }

  return generateEnhancedSummary(text, fileName, [], contextOptions[documentType])
}
