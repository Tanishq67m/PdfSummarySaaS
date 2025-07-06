import { NextResponse } from "next/server"

export async function GET() {
  try {
    const apiKey = process.env.AIMLAPI_KEY

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: "No aimlapi.com API key configured",
        hasKey: false,
        keyType: "none",
      })
    }

    let keyType = "aimlapi"
    let isValid = false

    if (apiKey.startsWith("sk-")) {
      keyType = "openai"
      isValid = true
    } else if (apiKey.startsWith("ghp_")) {
      keyType = "github"
      isValid = false
    } else if (apiKey.startsWith("github_")) {
      keyType = "github"
      isValid = false
    }

    return NextResponse.json({
      success: isValid,
      hasKey: true,
      keyType,
      keyPrefix: apiKey.substring(0, 7) + "...",
      message: isValid
        ? "Valid aimlapi.com API key detected"
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
