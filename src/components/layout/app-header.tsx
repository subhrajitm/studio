
"use client";

import Link from 'next/link';
import { UserCircle, LogOut, Settings } from 'lucide-react'; 
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname } from 'next/navigation';

export function AppHeader() {
  const { user, logout, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const isDashboard = pathname === '/dashboard';

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };
  
  const API_BASE_URL_FOR_FILES = 'https://warrityweb-api-x1ev.onrender.com';


  return (
    <header className={isDashboard ? "md:hidden sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" : "sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"}>
      <div className="container flex h-14 items-center justify-between max-w-screen-2xl px-4">
        {!isDashboard && (
          <Link href={isAuthenticated ? "/dashboard" : "/login"} className="flex items-center">
            <span className="font-bold text-lg sm:inline-block">Warrity</span>
          </Link>
        )}
        
        {isDashboard && (
           <Link href="/dashboard" className="flex items-center">
            <span className="font-semibold text-md text-foreground">Warrity</span>
          </Link>
        )}
        
        {isAuthenticated && user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                   <AvatarImage 
                    src={user.profilePicture ? `${API_BASE_URL_FOR_FILES}${user.profilePicture}` : undefined} 
                    alt={user.username} 
                    data-ai-hint="user avatar"
                  />
                  <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.username}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Profile Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="flex items-center text-destructive focus:text-destructive focus:bg-destructive/10">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
         {!isAuthenticated && !isDashboard && (
            <Button asChild variant="outline" size="sm">
                <Link href="/login">Login</Link>
            </Button>
        )}
      </div>
    </header>
  );
}
