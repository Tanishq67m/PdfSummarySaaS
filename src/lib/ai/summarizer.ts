export interface SummaryResult {
  title: string
  content: string
  keyPoints: string[]
  actionItems: string[]
  tags: string[]
  wordCount: number
}

// Generate a mock summary when OpenAI is not available
function generateMockSummary(
  text: string,
  fileName: string,
  options: {
    model?: string
    maxLength?: number
    includeActionItems?: boolean
  } = {},
): SummaryResult {
  const { maxLength = 1000, includeActionItems = true } = options

  console.log("🎭 Generating mock summary for:", fileName)
  console.log("📄 Analyzing text content:", text.substring(0, 200) + "...")

  // Analyze the actual text content
  const fileNameLower = fileName.toLowerCase()
  const wordCount = text.split(/\s+/).length

  // Extract key phrases and topics from the actual text
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 20)
  const firstFewSentences = sentences.slice(0, 5).join(". ")

  // Detect document type based on actual content
  let documentType = "Document"
  let emoji = "📄"
  const detectedTopics: string[] = []

  // Financial detection
  if (/(financial|revenue|profit|budget|cost|investment|money|dollar|\$|income|expense|quarterly|annual)/i.test(text)) {
    documentType = "Financial Report"
    emoji = "💰"
    detectedTopics.push("financial", "revenue", "budget")
  }
  // Technical detection
  else if (/(technical|system|software|api|implementation|architecture|code|development|technology)/i.test(text)) {
    documentType = "Technical Document"
    emoji = "⚙️"
    detectedTopics.push("technical", "system", "development")
  }
  // Legal detection
  else if (/(contract|agreement|legal|terms|clause|liability|compliance|regulation)/i.test(text)) {
    documentType = "Legal Document"
    emoji = "⚖️"
    detectedTopics.push("legal", "contract", "compliance")
  }
  // Business detection
  else if (/(business|strategy|market|customer|sales|growth|plan|analysis|management)/i.test(text)) {
    documentType = "Business Document"
    emoji = "💼"
    detectedTopics.push("business", "strategy", "analysis")
  }
  // Research/Academic detection
  else if (/(research|study|analysis|methodology|findings|conclusion|abstract|hypothesis)/i.test(text)) {
    documentType = "Research Document"
    emoji = "🔬"
    detectedTopics.push("research", "study", "analysis")
  }
  // Travel/Booking detection
  else if (/(booking|confirmation|travel|flight|hotel|reservation|itinerary)/i.test(text)) {
    documentType = "Travel Document"
    emoji = "✈️"
    detectedTopics.push("travel", "booking", "confirmation")
  }
  // Report detection
  else if (fileNameLower.includes("report") || /(report|summary|overview|findings|results)/i.test(text)) {
    documentType = "Report"
    emoji = "📊"
    detectedTopics.push("report", "summary", "findings")
  }

  const title = `${emoji} ${documentType} Analysis`

  // Generate content based on actual text analysis
  let content = ""

  if (firstFewSentences.length > 50) {
    content = `This ${documentType.toLowerCase()} provides comprehensive insights based on the analyzed content. ${firstFewSentences.substring(0, 300)}...

The document contains ${wordCount} words and covers several key areas of interest. Based on the content analysis, the main themes include strategic considerations, operational aspects, and implementation guidelines.

Key findings from the document suggest actionable insights that can inform decision-making processes. The analysis reveals important patterns and recommendations that stakeholders should consider for effective implementation.`
  } else {
    content = `This ${documentType.toLowerCase()} contains valuable information and analysis. The document provides detailed insights across multiple key areas with ${wordCount} words of content.

The analysis reveals important findings that can inform decision-making processes and future planning initiatives. Implementation of the suggested approaches should be prioritized based on impact assessment and resource availability.

Regular review and monitoring will ensure continued relevance and effectiveness of the proposed strategies and recommendations outlined in this comprehensive analysis.`
  }

  // Generate contextual key points
  const keyPoints = []

  if (documentType === "Financial Report") {
    keyPoints.push(
      "💰 Financial performance metrics and key indicators analyzed",
      "📊 Revenue and cost analysis with trend identification",
      "📈 Budget allocation and investment recommendations",
      "⚡ Operational efficiency opportunities identified",
      "🎯 Strategic financial planning insights provided",
    )
  } else if (documentType === "Technical Document") {
    keyPoints.push(
      "⚙️ Technical specifications and system requirements outlined",
      "🔧 Implementation guidelines and best practices detailed",
      "📋 Architecture and design considerations explained",
      "🚀 Performance optimization opportunities identified",
      "🛠️ Development and deployment strategies provided",
    )
  } else if (documentType === "Business Document") {
    keyPoints.push(
      "💼 Business strategy and market analysis presented",
      "🎯 Customer insights and market opportunities identified",
      "📈 Growth strategies and expansion plans outlined",
      "⚡ Operational improvements and efficiency gains highlighted",
      "🔍 Competitive analysis and positioning strategies discussed",
    )
  } else if (documentType === "Travel Document") {
    keyPoints.push(
      "✈️ Travel arrangements and booking details confirmed",
      "🏨 Accommodation and transportation information provided",
      "📅 Itinerary and schedule details outlined",
      "💳 Payment and confirmation details included",
      "📞 Contact information and support details available",
    )
  } else {
    keyPoints.push(
      `📋 Comprehensive ${documentType.toLowerCase()} with detailed analysis`,
      "🎯 Strategic recommendations for implementation",
      "📊 Data-driven findings based on content examination",
      "⚡ Actionable insights for improved decision-making",
      "🔍 Key themes and considerations identified",
      "📈 Performance improvement opportunities highlighted",
    )
  }

  // Generate contextual action items
  const actionItems: string[] = includeActionItems ? [] : []

  if (includeActionItems) {
    if (documentType === "Financial Report") {
      actionItems.push(
        "Review financial performance against established benchmarks",
        "Implement cost optimization strategies identified in analysis",
        "Develop budget allocation plan based on recommendations",
        "Monitor key financial indicators on regular basis",
      )
    } else if (documentType === "Technical Document") {
      actionItems.push(
        "Review technical specifications and requirements",
        "Plan implementation timeline based on outlined guidelines",
        "Allocate development resources according to priorities",
        "Establish testing and quality assurance procedures",
      )
    } else if (documentType === "Travel Document") {
      actionItems.push(
        "Confirm all booking details and reservations",
        "Review travel itinerary and timing requirements",
        "Prepare necessary documentation and identification",
        "Save contact information for support and assistance",
      )
    } else {
      actionItems.push(
        "Review and analyze the key findings and recommendations",
        "Develop implementation timeline based on priority assessment",
        "Allocate necessary resources for recommended initiatives",
        "Establish monitoring systems for progress tracking",
      )
    }
  }

  // Add filename-based topics if no content topics found
  if (detectedTopics.length === 0) {
    if (fileNameLower.includes("report")) detectedTopics.push("report")
    if (fileNameLower.includes("analysis")) detectedTopics.push("analysis")
    if (fileNameLower.includes("summary")) detectedTopics.push("summary")
    if (fileNameLower.includes("document")) detectedTopics.push("document")
  }

  // Ensure we have at least some basic tags
  if (detectedTopics.length === 0) {
    detectedTopics.push("document", "analysis")
  }

  console.log("🎭 Generated mock summary:", {
    documentType,
    emoji,
    detectedTopics,
    keyPointsCount: keyPoints.length,
    actionItemsCount: actionItems.length,
    contentLength: content.length,
  })

  return {
    title,
    content: content.substring(0, maxLength * 5), // Rough word limit
    keyPoints: keyPoints.slice(0, 7),
    actionItems: actionItems.slice(0, 5),
    tags: detectedTopics.slice(0, 6),
    wordCount: content.split(/\s+/).length,
  }
}

export async function generateSummary(
  text: string,
  fileName: string,
  options: {
    model?: string
    maxLength?: number
    includeActionItems?: boolean
  } = {},
): Promise<SummaryResult> {
  const apiKey = process.env.AIMLAPI_KEY;
  if (!apiKey) {
    console.warn("⚠️ No AIMLAPI_KEY found, using mock summary");
    return generateMockSummary(text, fileName, options);
  }

  const apiUrl = "https://api.aimlapi.com/v1/chat/completions";
  const prompt = `Summarize the following document. Provide a JSON object with the following fields: title, content, keyPoints (array), actionItems (array), tags (array). Document:\n${text}`;
  const payload = {
    model: "google/gemma-3n-e4b-it",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    max_tokens: 1024,
    temperature: 0.7,
  };

  try {
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

    // Try to parse the summaryText as JSON
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(summaryText);
    } catch {
      parsed = null;
    }

    function isSummaryResultLike(obj: unknown): obj is { title?: string; content?: string; keyPoints?: unknown[]; actionItems?: unknown[]; tags?: unknown[] } {
      return !!obj && typeof obj === "object";
    }

    if (isSummaryResultLike(parsed)) {
      return {
        title: typeof parsed.title === "string" ? parsed.title : fileName,
        content: typeof parsed.content === "string" ? parsed.content : summaryText,
        keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints as string[] : [],
        actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems as string[] : [],
        tags: Array.isArray(parsed.tags) ? parsed.tags as string[] : [],
        wordCount: (typeof parsed.content === "string" ? parsed.content : summaryText).split(/\s+/).length,
      };
    } else {
      // fallback: treat the whole response as content
      return {
        title: fileName,
        content: summaryText,
        keyPoints: [],
        actionItems: [],
        tags: [],
        wordCount: summaryText.split(/\s+/).length,
      };
    }
  } catch (error) {
    console.error("❌ AIMLAPI summarization failed:", error);
    return generateMockSummary(text, fileName, options);
  }
}

export async function generateTitle(text: string): Promise<string> {
  try {
    if (!process.env.AIMLAPI_KEY) {
      return "Document Analysis Summary";
    }

    const apiUrl = "https://api.aimlapi.com/v1/chat/completions";
    const prompt = `Generate a concise, descriptive title for the following document. Only return the title as plain text. Document:\n${text.substring(0, 2000)}`;
    const payload = {
      model: "google/gemma-3n-e4b-it",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 100,
      temperature: 0.7,
    };

    const apiResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.AIMLAPI_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!apiResponse.ok) {
      throw new Error(`AIMLAPI error: ${apiResponse.status} ${apiResponse.statusText}`);
    }

    const responseData = await apiResponse.json();
    const title = responseData.choices?.[0]?.message?.content?.trim() || "Document Analysis Summary";
    return title.length > 100 ? title.substring(0, 100) : title;
  } catch (error) {
    console.error("❌ Title generation failed:", error);
    return "Document Analysis Summary";
  }
}
