import type { Metadata } from "next";

import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Student Analytics Agent Platform",
  description: "From marks to measurable improvement.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body className="antialiased min-h-screen">
        <ThemeProvider>
          <AuthProvider>
          {children}
          <Toaster 
            position="top-center"
            toastOptions={{
              style: {
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
                backdropFilter: 'blur(10px)',
              },
            }}
          />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
