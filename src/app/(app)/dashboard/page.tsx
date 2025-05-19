
"use client";

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import apiClient from '@/lib/api-client';
import type { Warranty } from '@/types';
import { WarrantyListItem } from '@/components/warranties/warranty-list-item';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, AlertTriangle, List, UserCircle, Settings, ShieldX, Loader2, ShieldCheck, Info, Zap, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { differenceInDays, parseISO } from 'date-fns';
import { Separator } from '@/components/ui/separator';


export default function DashboardPage() {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [warrantyToDelete, setWarrantyToDelete] = useState<string | null>(null);

  const { data: warrantiesData, isLoading: isLoadingWarranties, error: warrantiesError } = useQuery<{ warranties: Warranty[], expiringWarranties: Warranty[] }, Error>({
    queryKey: ['dashboardData', user?._id],
    queryFn: async () => {
      if (!token || !user) throw new Error("User not authenticated");
      const [warranties, expiringWarranties] = await Promise.all([
        apiClient<Warranty[]>('/warranties', { token }),
        apiClient<Warranty[]>('/warranties/expiring', { token })
      ]);
      return { warranties, expiringWarranties };
    },
    enabled: !!token && !!user,
  });

  const warranties = warrantiesData?.warranties;
  const expiringWarranties = warrantiesData?.expiringWarranties;
  const isLoadingExpiring = isLoadingWarranties; 

  useEffect(() => {
    if (expiringWarranties && expiringWarranties.length > 0 && !isLoadingExpiring && !warrantiesError) {
      const expiringProductNames = expiringWarranties.map(w => w.productName).slice(0, 2).join(', ');
      const additionalItemsCount = expiringWarranties.length - 2;
      let description = `Your warranty for ${expiringProductNames}`;
      if (expiringWarranties.length === 1) {
        description = `Your warranty for ${expiringWarranties[0].productName}`;
      }
      
      if (additionalItemsCount > 0) {
        description += ` and ${additionalItemsCount} other item(s) are expiring soon.`;
      } else if (expiringWarranties.length > 1) {
        description += ` are expiring soon.`;
      } else {
         description += ` is expiring soon.`;
      }
      
      const lastShownKey = `expiringToastLastShown_${user?._id}`;
      const lastShownTimestamp = sessionStorage.getItem(lastShownKey);
      const now = Date.now();
      const oneHour = 60 * 60 * 1000; 

      if (!lastShownTimestamp || (now - parseInt(lastShownTimestamp, 10) > oneHour)) {
        toast({
          title: 'Expiring Warranties!',
          description: description,
          variant: 'default', 
          duration: 10000, 
        });
        sessionStorage.setItem(lastShownKey, now.toString());
      }
    }
  }, [expiringWarranties, isLoadingExpiring, warrantiesError, toast, user?._id]);


  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: (warrantyId: string) => apiClient(`/warranties/${warrantyId}`, { method: 'DELETE', token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardData', user?._id] });
      toast({ title: 'Success', description: 'Warranty deleted successfully.' });
      setWarrantyToDelete(null);
    },
    onError: (error) => {
      toast({ title: 'Error', description: `Failed to delete warranty: ${error.message}`, variant: 'destructive' });
      setWarrantyToDelete(null);
    },
  });

  const handleDeleteWarranty = (id: string) => {
    deleteMutation.mutate(id);
  };
  
  const activeWarranties = warranties?.filter(w => 
    !expiringWarranties?.find(ew => ew._id === w._id) && 
    w.warrantyEndDate && differenceInDays(parseISO(w.warrantyEndDate), new Date()) >= 0
  );


  if (isLoadingWarranties) {
    return (
      <div className="space-y-6 p-4">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <Skeleton className="h-5 w-40 mb-2" /> 
            <Skeleton className="h-6 w-32 mb-1" />
            <Skeleton className="h-4 w-48" /> 
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        {/* Stats Card Skeleton */}
        <Skeleton className="h-40 rounded-xl bg-primary/30" />
        {/* Action Buttons Skeleton */}
        <div className="grid grid-cols-4 gap-3 mt-[-2rem] px-4 relative z-10">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-20 rounded-lg" />)}
        </div>
        {/* Lists Skeleton */}
        <div className="pt-4">
          <Skeleton className="h-6 w-36 mb-3 ml-4" />
          <Skeleton className="h-16 rounded-lg mb-2 mx-4" />
          <Skeleton className="h-16 rounded-lg mb-2 mx-4" />
        </div>
        <div className="pt-2">
          <Skeleton className="h-6 w-48 mb-3 ml-4" />
          <Skeleton className="h-16 rounded-lg mb-2 mx-4" />
        </div>
      </div>
    );
  }

  if (warrantiesError) {
    return (
      <div className="text-center py-10 px-4">
        <ShieldX className="mx-auto h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold text-foreground mb-2">Error Loading Data</h2>
        <p className="text-muted-foreground mb-4">{warrantiesError?.message}</p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['dashboardData', user?._id] })}>
          Try Again
        </Button>
      </div>
    );
  }

  const showExpiringSectionContent = expiringWarranties && expiringWarranties.length > 0;
  const showAllClearMessage = expiringWarranties && expiringWarranties.length === 0 && !isLoadingExpiring;
  const showActiveWarrantiesContent = activeWarranties && activeWarranties.length > 0;

  const dashboardActions = [
    { label: 'Add New', icon: PlusCircle, href: '/warranties/add' },
    { label: 'Expiring', icon: AlertTriangle, href: '#expiring-soon' },
    { label: 'All Items', icon: List, href: '#all-active' },
    { label: 'Profile', icon: UserCircle, href: '/profile' },
  ];

  return (
    <div className="space-y-6 pb-24">
      {/* Dashboard Header */}
      <div className="flex justify-between items-start p-4 pt-6">
        <div className="flex-1">
          {/* Removed Warranty Wallet branding from here */}
          <h1 className="text-2xl font-bold text-foreground">Hey, {user?.username || 'User'}!</h1>
          <p className="text-sm text-muted-foreground">Welcome back, manage your warranties with ease.</p>
        </div>
        {/* Removed Settings icon button from here */}
      </div>

      {/* Key Stats Card */}
      <Card className="mx-4 rounded-xl bg-primary text-primary-foreground shadow-xl">
        <CardContent className="p-5">
          <p className="text-sm opacity-80">Total Active Warranties</p>
          <p className="text-3xl font-bold mt-1">
            {activeWarranties?.length || 0}
          </p>
          <p className="text-sm opacity-80 mt-3">Expiring Soon (30 days)</p>
          <p className="text-lg font-semibold">
            {expiringWarranties?.length || 0}
          </p>
        </CardContent>
      </Card>

      {/* Action Buttons - slightly overlapping the card from below */}
      <div className="grid grid-cols-4 gap-x-3 gap-y-2 -mt-5 px-4 relative z-10">
        {dashboardActions.map(action => (
          <Link key={action.label} href={action.href} passHref>
            <Button
              className="flex flex-col items-center justify-center h-20 w-full p-2 rounded-lg shadow-md bg-card text-foreground transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-xl hover:bg-muted group"
              aria-label={action.label}
            >
              <action.icon className="h-6 w-6 mb-1 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-xs text-center text-muted-foreground group-hover:text-foreground transition-colors">{action.label}</span>
            </Button>
          </Link>
        ))}
      </div>
      
      {/* Expiring Soon Section */}
      {(showExpiringSectionContent || showAllClearMessage) && (
        <section className="px-4 pt-4" id="expiring-soon">
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center">
            <Zap className="mr-2 h-5 w-5 text-primary" /> Expiring Soon
          </h2>
          {showExpiringSectionContent && (
            <div className="space-y-0">
              {expiringWarranties?.map((warranty) => (
                <WarrantyListItem key={warranty._id} warranty={warranty} />
              ))}
            </div>
          )}
          {showAllClearMessage && (
            <div className="text-center py-8 my-4 bg-card rounded-lg shadow">
              <ShieldCheck className="mx-auto h-12 w-12 text-primary mb-3" />
              <h3 className="text-md font-semibold text-foreground">All Clear!</h3>
              <p className="text-xs text-muted-foreground">No warranties expiring in the next 30 days.</p>
            </div>
          )}
        </section>
      )}
      
       {/* Separator */}
      {showExpiringSectionContent && showActiveWarrantiesContent && (
        <div className="px-4">
          <Separator className="my-4 bg-border/50" />
        </div>
      )}


      {/* All Active Warranties Section */}
      <section className="px-4" id="all-active">
        <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center">
             <List className="mr-2 h-5 w-5 text-primary"/> All Active Warranties
        </h2>
        {(!activeWarranties || activeWarranties.length === 0) && !isLoadingWarranties && (
           <div className="text-center py-10 my-4 bg-card rounded-lg shadow">
            <Info className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
            <h3 className="text-md font-semibold text-foreground mb-1">No Active Warranties</h3>
            <p className="text-xs text-muted-foreground mb-4">Add your first warranty to get started!</p>
            <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/warranties/add">
                <PlusCircle className="mr-2 h-4 w-4" /> Add First Warranty
              </Link>
            </Button>
          </div>
        )}
        {activeWarranties && activeWarranties.length > 0 && (
            <div className="space-y-0">
            {activeWarranties.map((warranty) => (
              <WarrantyListItem key={warranty._id} warranty={warranty} />
            ))}
          </div>
        )}
      </section>

      {warrantyToDelete && (
        <AlertDialog open={!!warrantyToDelete} onOpenChange={(open) => !open && setWarrantyToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the warranty.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setWarrantyToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleDeleteWarranty(warrantyToDelete)}
                disabled={deleteMutation.isPending}
                className="bg-destructive hover:bg-destructive/90"
              >
                {deleteMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
