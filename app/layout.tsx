/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ThemeProvider } from "@/components/layout/Theme/ThemeProvider";
import type { Metadata } from "next";
// @ts-ignore
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "کوچینو | Coachino",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      // lang='en'
      lang='fa'
      suppressHydrationWarning
      suppressContentEditableWarning
      dir='rtl'
    >
      <head>
        <meta name='apple-mobile-web-app-title' content='Nexiino' />
      </head>
      <body className='ss01 ss03 ss04'>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <main>{children}</main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
