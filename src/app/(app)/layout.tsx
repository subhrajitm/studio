
"use client";

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { AppHeader } from '@/components/layout/app-header';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { Skeleton } from '@/components/ui/skeleton';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isDashboard = pathname === '/dashboard';

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    // Basic skeleton for loading state, could be more specific to new design
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        {/* Conditional rendering of header for loading state based on future design */}
        {/* <AppHeader />  */}
        <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
          <div className="space-y-6">
            <Skeleton className="h-12 w-1/2" />
            <Skeleton className="h-40 rounded-lg bg-primary/20" /> 
            <div className="grid grid-cols-1 gap-4">
              <Skeleton className="h-20 rounded-lg" />
              <Skeleton className="h-20 rounded-lg" />
            </div>
          </div>
        </main>
        {/* <MobileBottomNav /> */}
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* AppHeader will now conditionally render its content based on route */}
      {/* For dashboard, it might be minimal or handled within DashboardPage itself on larger screens */}
      <AppHeader />
      <main className={`flex-grow ${isDashboard ? 'p-0' : 'container mx-auto px-4 py-8 md:py-12'} pb-20 md:pb-12`}>
        {children}
      </main>
      <MobileBottomNav />
    </div>
  );
}
