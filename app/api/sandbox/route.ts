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
      // Create files in the workDir
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

      // Docker configuration
      let dockerImage = 'python:3.11-slim' // Faster default for static files
      let runCmd = ''
      let port = fragment.port || 80 // Default to 80 for python http.server

      if (fragment.template.includes('nextjs')) {
          dockerImage = 'node:20-alpine'
          runCmd = 'npm install && npm run dev'
          port = 3000
      } else if (fragment.template.includes('python') || fragment.template === 'nlhz8vlwyupq845jsdg9') {
          dockerImage = 'python:3.11-slim'
          runCmd = `python ${fragment.file_path}`
          port = 8080 // common python app port
      } else {
          // Default static server (HTML/JS/CSS)
          dockerImage = 'python:3.11-slim'
          runCmd = 'python -m http.server 80'
          port = 80
      }

      const containerName = sandboxId
      // Ensure we expose the port
      const dockerRunCmd = `docker run -d --name ${containerName} -v ${workDir}:/app -w /app -p 0:${port} ${dockerImage} sh -c "${runCmd}"`
      console.log('Running Docker:', dockerRunCmd)
      
      const containerId = execSync(dockerRunCmd).toString().trim()
      
      // Wait a moment for container to initialize
      execSync('sleep 1')

      // Get assigned port
      const portOutput = execSync(`docker port ${containerName} ${port}`).toString().trim()
      if (!portOutput) {
          throw new Error(`Failed to map port ${port} for container ${containerName}`)
      }
      
      const assignedPort = portOutput.split(':')[1].trim()
      const hostIp = '168.231.78.113'

      if (fragment.template === 'nlhz8vlwyupq845jsdg9') {
          execSync('sleep 2') // Give it time to finish
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
          url: `http://${hostIp}:${assignedPort}`,
      }
      return new Response(JSON.stringify(result))

  } catch (error: any) {
      console.error('Docker Sandbox Error:', error)
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}
