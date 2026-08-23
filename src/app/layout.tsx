import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Volunteer by KROW — Discover Opportunities',
  description: 'Browse community volunteer roles and sign up to participate.',
  icons: {
    icon: '/logo.jpg',
    shortcut: '/logo.jpg',
    apple: '/logo.jpg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="/logo.jpg" />
      </head>
      <body className="h-full bg-slate-50 text-slate-900 antialiased selection:bg-[#635BFF] selection:text-white">
        {children}
      </body>
    </html>
  );
}
