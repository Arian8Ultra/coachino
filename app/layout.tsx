import { ThemeProvider } from "@/components/layout/Theme/ThemeProvider";
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { LayoutTransition } from "@/components/layout/Motion/LayoutTransition";

export const metadata: Metadata = {
  title: "Coachino",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='en'
      suppressHydrationWarning
      suppressContentEditableWarning
      // dir='rtl'
    >
      <head>
        <meta name='apple-mobile-web-app-title' content='Nexiino' />
      </head>
      <body>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <main>
            <LayoutTransition
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {children}
            </LayoutTransition>
            {/* {children} */}
          </main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
