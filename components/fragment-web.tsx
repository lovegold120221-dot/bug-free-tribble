import { CopyButton } from './ui/copy-button'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ExecutionResultWeb } from '@/lib/types'
import { RotateCw } from 'lucide-react'
import { useState } from 'react'

export function FragmentWeb({ result }: { result: ExecutionResultWeb }) {
  const [iframeKey, setIframeKey] = useState(0)
  if (!result) return null

  function refreshIframe() {
    setIframeKey((prevKey) => prevKey + 1)
  }

  return (
    <div className="flex flex-col w-full h-full bg-white relative">
      <iframe
        key={iframeKey}
        className="flex-1 w-full h-full border-none"
        sandbox="allow-forms allow-scripts allow-same-origin"
        loading="lazy"
        src={result.url}
      />
      <div className="absolute bottom-4 right-4 flex gap-2 opacity-20 hover:opacity-100 transition-opacity z-50">
        <div className="flex items-center bg-black/80 backdrop-blur-md text-white rounded-full px-4 py-1.5 shadow-2xl border border-white/10">
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="link"
                  className="text-white hover:text-blue-400 p-0 h-auto"
                  onClick={refreshIframe}
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="mx-3 h-4 w-[1px] bg-white/20" />
          <span className="text-[10px] font-mono opacity-60 mr-3 max-w-[150px] truncate">
            {result.url}
          </span>
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <CopyButton
                  variant="link"
                  content={result.url}
                  className="text-white hover:text-blue-400 p-0 h-auto"
                />
              </TooltipTrigger>
              <TooltipContent>Copy URL</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  )
}
