import { FragmentSchema } from '@/lib/schema'
import { ExecutionResultInterpreter, ExecutionResultWeb } from '@/lib/types'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const sandboxBaseDir = '/tmp/eburon-sandboxes'
if (!fs.existsSync(sandboxBaseDir)) {
    fs.mkdirSync(sandboxBaseDir, { recursive: true })
}

export const maxDuration = 60

export async function POST(req: Request) {
  const {
    fragment,
    userID,
    teamID,
    accessToken,
  }: {
    fragment: FragmentSchema
    userID: string | undefined
    teamID: string | undefined
    accessToken: string | undefined
  } = await req.json()

  const sandboxId = `sbx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
  const workDir = path.join(sandboxBaseDir, sandboxId)
  fs.mkdirSync(workDir, { recursive: true })

  try {
      if (fragment.code && Array.isArray(fragment.code)) {
        fragment.code.forEach((file) => {
          const filePath = path.join(workDir, file.file_path)
          fs.mkdirSync(path.dirname(filePath), { recursive: true })
          fs.writeFileSync(filePath, file.file_content)
        })
      } else {
        const filePath = path.join(workDir, fragment.file_path)
        fs.mkdirSync(path.dirname(filePath), { recursive: true })
        fs.writeFileSync(filePath, fragment.code)
      }

      let dockerImage = 'python:3.11-slim'
      let runCmd = ''
      let port = fragment.port || 80

      if (fragment.template.includes('nextjs')) {
          dockerImage = 'node:20-alpine'
          runCmd = 'npm install && npm run dev'
          port = 3000
      } else if (fragment.template.includes('python') || fragment.template === 'nlhz8vlwyupq845jsdg9') {
          dockerImage = 'python:3.11-slim'
          runCmd = `python ${fragment.file_path}`
          port = 8080
      } else {
          dockerImage = 'python:3.11-slim'
          runCmd = 'python -m http.server 80'
          port = 80
      }

      const containerName = sandboxId
      const dockerRunCmd = `docker run -d --name ${containerName} -v ${workDir}:/app -w /app -p 0:${port} ${dockerImage} sh -c "${runCmd}"`
      console.log('Running Docker:', dockerRunCmd)
      
      const containerId = execSync(dockerRunCmd).toString().trim()
      execSync('sleep 1')

      const portOutput = execSync(`docker port ${containerName} ${port}`).toString().trim()
      if (!portOutput) {
          throw new Error(`Failed to map port ${port} for container ${containerName}`)
      }
      
      const assignedPort = portOutput.split(':')[1].trim()
      
      // Determine base domain for proxying
      const hostHeader = req.headers.get('host') || 'fast.eburon.ai'
      const protocol = req.headers.get('x-forwarded-proto') || 'https'
      
      // Proxied URL via Nginx (Solves Mixed Content)
      const proxiedUrl = `${protocol}://${hostHeader}/sbx/${assignedPort}/`

      if (fragment.template === 'nlhz8vlwyupq845jsdg9') {
          execSync('sleep 2')
          const logs = execSync(`docker logs ${containerName}`).toString()
          const result: ExecutionResultInterpreter = {
              sbxId: containerId,
              template: fragment.template,
              stdout: [logs],
              stderr: [],
              runtimeError: undefined,
              cellResults: [],
          }
          return new Response(JSON.stringify(result))
      }

      const result: ExecutionResultWeb = {
          sbxId: containerId,
          template: fragment.template,
          url: proxiedUrl,
      }
      return new Response(JSON.stringify(result))

  } catch (error: any) {
      console.error('Docker Sandbox Error:', error)
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}
