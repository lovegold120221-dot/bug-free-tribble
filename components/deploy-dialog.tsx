'use client'

import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'

export function DeployDialog({
  url,
}: {
  url: string
  sbxId: string
  teamID?: string
  accessToken?: string
}) {
  const openLink = () => {
    window.open(url, '_blank')
  }

  return (
    <Button variant="default" onClick={openLink}>
      <ExternalLink className="mr-2 h-4 w-4" />
      Open Link
    </Button>
  )
}
