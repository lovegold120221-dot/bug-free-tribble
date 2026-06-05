'use client'

import { Button } from '@/components/ui/button'
import { ExternalLink, Maximize, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useState } from 'react'

export function DeployDialog({
  url,
}: {
  url: string
  sbxId: string
  teamID?: string
  accessToken?: string
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          <ExternalLink className="mr-2 h-4 w-4" />
          Open Link
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] p-0 gap-0 overflow-hidden border-none bg-black">
        <DialogHeader className="p-4 bg-neutral-900 border-b border-white/10 flex flex-row items-center justify-between">
          <DialogTitle className="text-white flex items-center gap-2">
            <Maximize className="h-4 w-4 text-blue-400" />
            Eburon AI | Live Production Preview
          </DialogTitle>
          <div className="flex items-center gap-4 text-xs text-neutral-400 font-mono pr-8">
            {url}
          </div>
        </DialogHeader>
        <div className="flex-1 w-full h-full bg-white relative">
          <iframe 
            src={url} 
            className="w-full h-full border-none"
            sandbox="allow-forms allow-scripts allow-same-origin"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
