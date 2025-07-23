import type {Metadata} from 'next';
import { Suspense } from 'react';
import './globals.css';
import ClientLayout from '@/components/ClientLayout'

export const metadata: Metadata = {
  title: 'MathMinds',
  description: 'A fun and interactive way for kids to learn math!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ClientLayout>
          <Suspense fallback={
            <div className="flex min-h-screen w-full flex-col">
              <div className="animate-pulse">
                <div className="h-16 bg-gray-200 mb-4"></div>
                <div className="p-4 md:p-8">
                  <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-48 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          }>
            {children}
          </Suspense>
        </ClientLayout>
      </body>
    </html>
  );
}
