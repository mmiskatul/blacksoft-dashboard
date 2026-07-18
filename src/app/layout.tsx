import type { Metadata } from 'next';
import './globals.css';
import DashboardShell from './DashboardShell';
import { ToastProvider } from '../components/Toast';

export const metadata: Metadata = {
  title: 'Blacksoft Hub',
  description: 'Blacksoft content management dashboard',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <DashboardShell>{children}</DashboardShell>
        </ToastProvider>
      </body>
    </html>
  );
}
