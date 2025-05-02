import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

// Permitir respostas de streaming por até 30 segundos
export const maxDuration = 30

export async function POST(req: Request) {
  const { messages, agent = "assistant" } = await req.json()

  // Definir o sistema de prompt baseado no agente selecionado
  let systemPrompt = ""

  switch (agent) {
    case "coder":
      systemPrompt =
        "Você é um programador experiente. Forneça código claro, bem comentado e explicações detalhadas sobre conceitos de programação."
      break
    case "writer":
      systemPrompt =
        "Você é um redator profissional. Ajude a criar, revisar e aprimorar textos com foco em clareza, estilo e impacto."
      break
    case "researcher":
      systemPrompt =
        "Você é um pesquisador meticuloso. Forneça informações detalhadas, precisas e bem fundamentadas, citando fontes quando possível."
      break
    default:
      systemPrompt = "Você é um assistente virtual útil e amigável. Responda às perguntas de forma clara e concisa."
  }

  const result = streamText({
    model: openai("gpt-4o"),
    messages,
    system: systemPrompt,
  })

  return result.toDataStreamResponse()
}
