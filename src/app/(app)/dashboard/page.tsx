"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import apiClient from '@/lib/api-client';
import type { Warranty } from '@/types';
import { WarrantyCard } from '@/components/warranties/warranty-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, AlertTriangle, Loader2, ShieldX, Info } from 'lucide-react';
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from 'react';

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

  const { data: expiringWarranties, isLoading: isLoadingExpiring } = useQuery<Warranty[], Error>({
    queryKey: ['expiringWarranties', user?._id],
    queryFn: () => apiClient<Warranty[]>('/warranties/expiring', { token }),
    enabled: !!token && !!user,
  });

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
        <div>
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-60 rounded-lg" />)}
          </div>
        </div>
        <div>
          <Skeleton className="h-8 w-64 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2].map((i) => <Skeleton key={i} className="h-60 rounded-lg" />)}
          </div>
        </div>
      </div>
    );
  }

  if (warrantiesError) {
    return (
      <div className="text-center py-10">
        <ShieldX className="mx-auto h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Error Loading Warranties</h2>
        <p className="text-muted-foreground mb-4">{warrantiesError.message}</p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['warranties', user?._id] })}>
          Try Again
        </Button>
      </div>
    );
  }
  
  const activeWarranties = warranties?.filter(w => !expiringWarranties?.find(ew => ew._id === w._id));


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

      {expiringWarranties && expiringWarranties.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <AlertTriangle className="mr-2 h-6 w-6 text-destructive" /> Expiring Soon
          </h2>
          {expiringWarranties.length === 0 && !isLoadingExpiring && (
            <p className="text-muted-foreground">No warranties expiring soon. Great job!</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {expiringWarranties.map((warranty) => (
              <WarrantyCard key={warranty._id} warranty={warranty} onDelete={() => setWarrantyToDelete(warranty._id)} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-2xl font-semibold mb-4">All Active Warranties</h2>
        {(!activeWarranties || activeWarranties.length === 0) && !isLoadingWarranties && (
           <div className="text-center py-10 border-2 border-dashed border-muted-foreground/30 rounded-lg">
            <Info className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Active Warranties</h3>
            <p className="text-muted-foreground mb-4">Add your first warranty to get started!</p>
            <Button asChild>
              <Link href="/warranties/add">
                <PlusCircle className="mr-2 h-5 w-5" /> Add Warranty
              </Link>
            </Button>
          </div>
        )}
        {activeWarranties && activeWarranties.length > 0 && (
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
