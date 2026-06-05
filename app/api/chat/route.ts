import { handleAPIError, createRateLimitResponse } from '@/lib/api-errors'
import { Duration } from '@/lib/duration'
import { getModelClient, LLMModel, LLMModelConfig } from '@/lib/models'
import { toPrompt } from '@/lib/prompt'
import ratelimit from '@/lib/ratelimit'
import { fragmentSchema as schema } from '@/lib/schema'
import { Templates } from '@/lib/templates'
import { supabase } from '@/lib/supabase'
import { streamObject } from 'ai'

export const maxDuration = 300

const rateLimitMaxRequests = process.env.RATE_LIMIT_MAX_REQUESTS
  ? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS)
  : 10
const ratelimitWindow = process.env.RATE_LIMIT_WINDOW
  ? (process.env.RATE_LIMIT_WINDOW as Duration)
  : '1d'

export async function POST(req: Request) {
  const {
    messages,
    userID,
    teamID,
    template,
    model,
    config,
  }: {
    messages: any[]
    userID: string | undefined
    teamID: string | undefined
    template: Templates
    model: LLMModel
    config: LLMModelConfig
  } = await req.json()

  const limit = !config.apiKey
    ? await ratelimit(
        req.headers.get('x-forwarded-for'),
        rateLimitMaxRequests,
        ratelimitWindow,
      )
    : false

  if (limit) {
    return createRateLimitResponse(limit)
  }

  const modelClient = getModelClient(model, config) as any
  const systemPrompt = toPrompt(template)

  try {
    const stream = await streamObject({
      model: modelClient,
      schema,
      system: systemPrompt,
      messages,
      maxRetries: 0,
      ...config,
      onFinish: async ({ object, error }: { object: any, error: any }) => {
        if (!error && supabase) {
          try {
            await supabase
              .from('eburon_generations')
              .insert({
                user_id: userID,
                team_id: teamID,
                model_id: model.id,
                system_prompt: systemPrompt,
                query: JSON.stringify(messages[messages.length - 1].content),
                full_history: JSON.stringify(messages),
                generation: JSON.stringify(object),
                template: Object.keys(template)[0] || 'auto',
                created_at: new Date().toISOString()
              })
          } catch (e) {
            console.error('Failed to log to Supabase:', e)
          }
        }
      }
    } as any)

    return stream.toTextStreamResponse()
  } catch (error: any) {
    return handleAPIError(error, { hasOwnApiKey: !!config.apiKey })
  }
}
