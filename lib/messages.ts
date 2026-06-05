import { FragmentSchema } from './schema'
import { ExecutionResult } from './types'
import { DeepPartial } from 'ai'

export type MessageText = {
  type: 'text'
  text: string
}

export type MessageCode = {
  type: 'code'
  text: string
}

export type MessageImage = {
  type: 'image'
  image: string
}

export type MessageAttachment = {
  type: 'attachment'
  name: string
  content: string
}

export type Message = {
  role: 'assistant' | 'user'
  content: Array<MessageText | MessageCode | MessageImage | MessageAttachment>
  object?: DeepPartial<FragmentSchema>
  result?: ExecutionResult
}

export function toAISDKMessages(messages: Message[]) {
  return messages.map((message) => ({
    role: message.role,
    content: message.content.map((content) => {
      if (content.type === 'code') {
        return {
          type: 'text',
          text: content.text,
        }
      }

      if (content.type === 'attachment') {
        return {
          type: 'text',
          text: `[Attached File: ${content.name}]\n${content.content}\n[End of File: ${content.name}]`,
        }
      }

      return content
    }),
  }))
}

export async function processAttachments(files: File[]) {
  if (files.length === 0) {
    return []
  }

  return Promise.all(
    files.map(async (file) => {
      if (file.type.startsWith('image/')) {
        const base64 = Buffer.from(await file.arrayBuffer()).toString('base64')
        return {
          type: 'image' as const,
          image: `data:${file.type};base64,${base64}`,
        }
      }

      const text = await file.text()
      return {
        type: 'attachment' as const,
        name: file.name,
        content: text,
      }
    }),
  )
}
