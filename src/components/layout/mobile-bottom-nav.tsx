
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ListChecks, UserCircle, Plus, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LucideProps } from 'lucide-react';

interface NavItemType { // Renamed to NavItemType to avoid conflict with component name
  href: string;
  label: string;
  icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
}

const navItems: NavItemType[] = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/warranties/all', label: 'Activity', icon: ListChecks },
  { href: '/profile', label: 'Settings', icon: Settings }, // Added Settings
  { href: '/profile', label: 'Profile', icon: UserCircle }, // Kept Profile, could be differentiated later
];

// Helper component for rendering individual nav items
const NavItemLink = ({ item, isActive }: { item: NavItemType; isActive: boolean }) => {
  return (
    <Link
      key={item.href + item.label} // Ensure key is unique if hrefs are same
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
    // For /profile, if multiple items link there, they will all be active.
    // If Settings and Profile link to /profile, both will be active on /profile.
    return pathname === href;
  };

  // Items for columns 1 and 2
  const leftNavElements = navItems.slice(0, 2).map((item) => (
    <NavItemLink key={item.label} item={item} isActive={isActive(item.href)} />
  ));
  
  // Items for columns 4 and 5
  // With 4 items in navItems, navItems.slice(2) will get items at index 2 and 3
  const rightNavElements = navItems.slice(2).map((item) => (
    <NavItemLink key={item.label} item={item} isActive={isActive(item.href)} />
  ));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
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

        {/* Render items for the right side (columns 4 and 5) */}
        {/* The placeholder logic is removed as navItems now provides enough items */}
        {rightNavElements}
      </div>
    </nav>
  );
}
