import { NextResponse } from "next/server"

export async function GET() {
  try {
    const apiKey = process.env.AIMLAPI_KEY

    console.log("🔍 aimlapi.com API Key Debug:")
    console.log("- Has key:", !!apiKey)
    console.log("- Key length:", apiKey?.length || 0)
    console.log("- Key prefix:", apiKey?.substring(0, 10) || "none")

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: "No aimlapi.com API key found",
        hasKey: false,
        keyType: "none",
      })
    }

    let keyType = "unknown"
    let isValid = false

    // You may want to add more validation for aimlapi.com keys if needed
    if (apiKey.length > 10) {
      keyType = "aimlapi"
      isValid = true
    }

    // Test the API key with a simple request (if aimlapi.com supports it)
    let apiWorking = false
    if (isValid) {
      try {
        // Use the correct AIMLAPI endpoint and payload for Gemma 3n 4B
        const testResponse = await fetch("https://api.aimlapi.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "google/gemma-3n-e4b-it",
            messages: [
              {
                role: "user",
                content: "Say hello!",
              },
            ],
            max_tokens: 16,
            temperature: 0.7,
          }),
        })
        apiWorking = testResponse.ok
        console.log("- API test response:", testResponse.status)
      } catch (error) {
        console.log("- API test failed:", error)
      }
    }

    return NextResponse.json({
      success: isValid && apiWorking,
      hasKey: true,
      keyType,
      keyPrefix: apiKey.substring(0, 10) + "...",
      keyLength: apiKey.length,
      apiWorking,
      message: isValid
        ? apiWorking
          ? "Valid aimlapi.com API key and working!"
          : "Valid key format but API test failed"
        : `Invalid key type: ${keyType}. Please use a valid aimlapi.com API key`,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
