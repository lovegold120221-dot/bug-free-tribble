import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'

export async function applyPatch({
  targetFile,
  instructions,
  initialCode,
  codeEdit,
}: {
  targetFile: string
  instructions: string
  initialCode: string
  codeEdit: string
}) {
  try {
    const { text: mergedCode } = await generateText({
      model: openai('morph-v3-large') as any,
      prompt: `<instruction>${instructions}</instruction>\n<file>${targetFile}</file>\n<code>${initialCode}</code>\n<update>${codeEdit}</update>`,
    })

    return { code: mergedCode }
  } catch (error) {
    console.error('Morph API Error:', error)
    throw error
  }
}
