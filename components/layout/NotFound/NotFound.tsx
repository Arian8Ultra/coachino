"use client";
import { CircleSlash } from "lucide-react";
import Link from "next/link";
import React from "react";

const NotFound = () => {
  return (
    <div className='flex min-h-dvh w-full justify-center items-center p-10 flex-col gap-5'>
      <CircleSlash className='w-20 h-20 text-red-500' />
      <h1 className='text-2xl font-bold text-red-500'>404 - Page Not Found</h1>
      <Link
        href='/'
        className='text-primary underline hover:text-primary/80 transition-colors'
      >
        Return Home
      </Link>
    </div>
  );
};

export default NotFound;
