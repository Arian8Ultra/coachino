'use client'
 
import { LoaderCircle } from 'lucide-react'
import { useLinkStatus } from 'next/link'
 
export default function LoadingIndicator() {
  const { pending } = useLinkStatus()
  return pending ? (
    <LoaderCircle className='w-6 h-6 animate-spin text-primary fixed top-2 start-2 end-2 z-50' />
  ) : null
}