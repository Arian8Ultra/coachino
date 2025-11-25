'use client'
import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import Image from 'next/image'
import React from 'react'

type ClientImageProps = {
  src: string | StaticImport;
  alt: string;
} & Omit<React.ComponentProps<typeof Image>, 'src' | 'alt'>;

const ClientImage = ({ src, alt, ...props }: ClientImageProps) => {
  return (
    <Image src={src} alt={alt} {...props} />
  )
}

export default ClientImage