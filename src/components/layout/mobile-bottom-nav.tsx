
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShieldCheck, ShoppingBag, Wrench, Calendar, UserCircle, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LucideProps } from 'lucide-react';

interface NavItemType { 
  href: string;
  label: string;
  icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
}

const navItems: NavItemType[] = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/warranties', label: 'Warranties', icon: ShieldCheck },
  { href: '/products', label: 'Products', icon: ShoppingBag },
  { href: '/service', label: 'Service', icon: Wrench }
];

// Helper component for rendering individual nav items
const NavItemLink = ({ item, isActive }: { item: NavItemType; isActive: boolean }) => {
  return (
    <Link
      key={item.href + item.label} 
      href={item.href}
      className={cn(
        "flex flex-col items-center justify-center space-y-0.5 rounded-md p-1 text-sm font-medium transition-colors h-full",
        isActive
          ? "text-primary"
          : "text-muted-foreground hover:text-primary",
      )}
    >
      <item.icon className="h-4 w-4" />
      <span className="text-[0.55rem]">{item.label}</span>
    </Link>
  );
};

export function MobileBottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    if (href === '/warranties') {
      return pathname.startsWith('/warranties');
    }
    if (href === '/products') {
      return pathname.startsWith('/products');
    }
    if (href === '/service') {
      return pathname.startsWith('/service');
    }
    if (href === '/calendar') {
      return pathname.startsWith('/calendar');
    }
    // For /profile, check exact match
    return pathname === href;
  };

  // First 2 items (left side)
  const leftNavElements = navItems.slice(0, 2).map((item) => (
    <NavItemLink key={item.label} item={item} isActive={isActive(item.href)} />
  ));
  
  // Last 2 items (right side)
  const rightNavElements = navItems.slice(2).map((item) => (
    <NavItemLink key={item.label} item={item} isActive={isActive(item.href)} />
  ));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto grid h-12 max-w-md grid-cols-5 items-center px-2">
        {leftNavElements}

        {/* Central Add Button (Column 3) */}
        <div className="flex justify-center items-center h-full col-span-1">
          <Link
            href="/warranties/new"
            className={cn(
              "flex items-center justify-center h-9 w-9 rounded-full bg-primary text-primary-foreground shadow-md",
              pathname === '/warranties/new' ? "ring-1 ring-primary ring-offset-1 ring-offset-background" : ""
            )}
            aria-label="Add New Warranty"
          >
            <Plus className="h-5 w-5" />
          </Link>
        </div>
        {rightNavElements}
      </div>
    </nav>
  );
}
