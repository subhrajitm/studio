
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ListChecks, UserCircle, Plus, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LucideProps } from 'lucide-react';

interface NavItemType { 
  href: string;
  label: string;
  icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
}

const navItems: NavItemType[] = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/warranties/all', label: 'Activity', icon: ListChecks },
  { href: '/events', label: 'Events', icon: Calendar }, 
  { href: '/profile', label: 'Profile', icon: UserCircle }, 
];

// Helper component for rendering individual nav items
const NavItemLink = ({ item, isActive }: { item: NavItemType; isActive: boolean }) => {
  return (
    <Link
      key={item.href + item.label} 
      href={item.href}
      className={cn(
        "flex flex-col items-center justify-center space-y-1 rounded-md p-2 text-sm font-medium transition-colors h-full",
        isActive
          ? "text-primary"
          : "text-muted-foreground hover:text-primary",
      )}
    >
      <item.icon className="h-5 w-5 sm:h-6 sm:w-6" />
      <span className="text-[0.6rem] sm:text-xs">{item.label}</span>
    </Link>
  );
};

export function MobileBottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href || (pathname.startsWith('/warranties/') && !pathname.endsWith('/add') && !pathname.endsWith('/all'));
    }
    if (href === '/warranties/all') {
         return pathname.startsWith('/warranties') && !pathname.endsWith('/add');
    }
    if (href === '/events') {
         return pathname.startsWith('/events');
    }
    // For /profile, check exact match
    return pathname === href;
  };

  // Items for columns 1 and 2
  const leftNavElements = navItems.slice(0, 2).map((item) => (
    <NavItemLink key={item.label} item={item} isActive={isActive(item.href)} />
  ));
  
  const rightNavElements = navItems.slice(2).map((item) => (
    <NavItemLink key={item.label} item={item} isActive={isActive(item.href)} />
  ));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto grid h-16 max-w-md grid-cols-5 items-center px-2 sm:px-4">
        {leftNavElements}

        {/* Central Add Button (Column 3) */}
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
        {rightNavElements}
      </div>
    </nav>
  );
}
