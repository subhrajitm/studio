
"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import apiClient from '@/lib/api-client';
import type { Warranty } from '@/types';
import { WarrantyCard } from '@/components/warranties/warranty-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, AlertTriangle, Loader2, ShieldX, Info, ShieldCheck } from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [warrantyToDelete, setWarrantyToDelete] = useState<string | null>(null);

  const { data: warranties, isLoading: isLoadingWarranties, error: warrantiesError } = useQuery<Warranty[], Error>({
    queryKey: ['warranties', user?._id],
    queryFn: () => apiClient<Warranty[]>('/warranties', { token }),
    enabled: !!token && !!user,
  });

  const { data: expiringWarranties, isLoading: isLoadingExpiring, error: expiringWarrantiesError } = useQuery<Warranty[], Error>({
    queryKey: ['expiringWarranties', user?._id],
    queryFn: () => apiClient<Warranty[]>('/warranties/expiring', { token }),
    enabled: !!token && !!user,
  });

  useEffect(() => {
    if (expiringWarranties && expiringWarranties.length > 0 && !isLoadingExpiring && !expiringWarrantiesError) {
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
      
      description += ' Check the "Expiring Soon" section for details.';

      const lastShownKey = `expiringToastLastShown_${user?._id}`;
      const lastShownTimestamp = sessionStorage.getItem(lastShownKey);
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;

      if (!lastShownTimestamp || (now - parseInt(lastShownTimestamp, 10) > oneHour)) {
        toast({
          title: 'Expiring Warranties Alert!',
          description: description,
          variant: 'default', 
          duration: 10000, 
        });
        sessionStorage.setItem(lastShownKey, now.toString());
      }
    }
  }, [expiringWarranties, isLoadingExpiring, expiringWarrantiesError, toast, user?._id]);

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: (warrantyId: string) => apiClient(`/warranties/${warrantyId}`, { method: 'DELETE', token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warranties', user?._id] });
      queryClient.invalidateQueries({ queryKey: ['expiringWarranties', user?._id] });
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

  if (isLoadingWarranties || isLoadingExpiring) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-11 w-44" />
        </div>
        <div>
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-52 rounded-lg" />)}
          </div>
        </div>
        <Skeleton className="h-px w-full my-8" />
        <div>
          <Skeleton className="h-8 w-64 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2].map((i) => <Skeleton key={i} className="h-52 rounded-lg" />)}
          </div>
        </div>
      </div>
    );
  }

  if (warrantiesError || expiringWarrantiesError) {
    const errorToShow = warrantiesError || expiringWarrantiesError;
    return (
      <div className="text-center py-10">
        <ShieldX className="mx-auto h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Error Loading Data</h2>
        <p className="text-muted-foreground mb-4">{errorToShow?.message}</p>
        <Button onClick={() => {
          queryClient.invalidateQueries({ queryKey: ['warranties', user?._id] });
          queryClient.invalidateQueries({ queryKey: ['expiringWarranties', user?._id] });
        }}>
          Try Again
        </Button>
      </div>
    );
  }
  
  const activeWarranties = warranties?.filter(w => !expiringWarranties?.find(ew => ew._id === w._id));
  const showExpiringSectionContent = expiringWarranties && expiringWarranties.length > 0;
  const showAllClearMessage = expiringWarranties && expiringWarenties.length === 0 && !isLoadingExpiring;
  const showActiveWarrantiesContent = activeWarranties && activeWarranties.length > 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Your Warranties</h1>
        <Button asChild size="lg">
          <Link href="/warranties/add">
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Warranty
          </Link>
        </Button>
      </div>

      { (showExpiringSectionContent || showAllClearMessage) && (
        <section>
          <h2 className="text-2xl font-semibold mb-4 pb-2 border-b border-border/60 flex items-center">
            <AlertTriangle className="mr-2 h-6 w-6 text-primary" /> Expiring Soon
          </h2>
          {showExpiringSectionContent && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {expiringWarranties.map((warranty) => (
                <WarrantyCard key={warranty._id} warranty={warranty} onDelete={() => setWarrantyToDelete(warranty._id)} />
              ))}
            </div>
          )}
          {showAllClearMessage && (
            <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg bg-card">
              <ShieldCheck className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold">All Clear!</h3>
              <p className="text-muted-foreground">You have no warranties expiring soon.</p>
            </div>
          )}
        </section>
      )}
      
      { (showExpiringSectionContent || showAllClearMessage) && showActiveWarrantiesContent && <Separator className="my-8" /> }

      <section>
        <h2 className="text-2xl font-semibold mb-4 pb-2 border-b border-border/60">All Active Warranties</h2>
        {(!activeWarranties || activeWarranties.length === 0) && !isLoadingWarranties && (
           <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg bg-card">
            <Info className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Active Warranties Yet</h3>
            <p className="text-muted-foreground mb-6">Looks like your warranty list is empty. Add your first one!</p>
            <Button asChild size="lg">
              <Link href="/warranties/add">
                <PlusCircle className="mr-2 h-5 w-5" /> Add Your First Warranty
              </Link>
            </Button>
          </div>
        )}
        {showActiveWarrantiesContent && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeWarranties.map((warranty) => (
              <WarrantyCard key={warranty._id} warranty={warranty} onDelete={() => setWarrantyToDelete(warranty._id)} />
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
