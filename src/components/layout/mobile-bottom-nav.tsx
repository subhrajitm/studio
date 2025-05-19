
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ListChecks, UserCircle, Plus } from 'lucide-react'; // Updated icons
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/warranties/all', label: 'Activity', icon: ListChecks }, // Assuming an "all warranties" page or similar
  { href: '/profile', label: 'Profile', icon: UserCircle },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  // Determine if an item is active. Special handling for the "Add" button might be needed if it's not a route.
  // For now, the central button is a link to /warranties/add.
  const isActive = (href: string) => {
    if (href === '/dashboard') {
      // Active if it's exactly /dashboard or if it's a warranty detail page (implying navigated from dashboard)
      return pathname === href || (pathname.startsWith('/warranties/') && !pathname.endsWith('/add') && !pathname.endsWith('/all'));
    }
    if (href === '/warranties/all') {
         return pathname.startsWith('/warranties') && !pathname.endsWith('/add');
    }
    return pathname === href;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
      <div className="container mx-auto grid h-16 max-w-md grid-cols-5 items-center px-2 sm:px-4"> {/* 5 columns for central button */}
        {navItems.slice(0, 2).map((item) => ( // First two items
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center space-y-1 rounded-md p-2 text-sm font-medium transition-colors h-full",
              isActive(item.href)
                ? "text-primary"
                : "text-muted-foreground hover:text-primary",
            )}
          >
            <item.icon className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="text-[0.6rem] sm:text-xs">{item.label}</span>
          </Link>
        ))}

        {/* Central Add Button */}
        <div className="flex justify-center items-center h-full">
          <Link
            href="/warranties/add"
            className={cn(
              "flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-primary text-primary-foreground shadow-lg transform transition-transform hover:scale-105",
              pathname === '/warranties/add' ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
            )}
            aria-label="Add New Warranty"
          >
            <Plus className="h-6 w-6 sm:h-7 sm:w-7" />
          </Link>
        </div>

        {navItems.slice(2).map((item) => ( // Last item (Profile)
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center space-y-1 rounded-md p-2 text-sm font-medium transition-colors h-full",
              isActive(item.href)
                ? "text-primary"
                : "text-muted-foreground hover:text-primary",
            )}
          >
            <item.icon className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="text-[0.6rem] sm:text-xs">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
