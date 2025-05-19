"use client";

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import apiClient from '@/lib/api-client';
import type { Warranty } from '@/types';
import { WarrantyListItem } from '@/components/warranties/warranty-list-item';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2, ShieldCheck, List } from 'lucide-react';
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
import { useState } from 'react';

export default function AllWarrantiesPage() {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [warrantyToDelete, setWarrantyToDelete] = useState<string | null>(null);

  const { data: warranties, isLoading, error } = useQuery<Warranty[], Error>({
    queryKey: ['warranties', user?._id],
    queryFn: async () => {
      if (!token || !user) throw new Error("User not authenticated");
      // Use the /warranties endpoint which is working in the dashboard
      return apiClient<Warranty[]>('/warranties', { token });
    },
    enabled: !!token && !!user,
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: (warrantyId: string) => apiClient(`/warranties/${warrantyId}`, { method: 'DELETE', token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warranties', user?._id] });
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

  if (isLoading) {
    return (
      <div className="container max-w-md mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6 flex items-center">
          <List className="mr-2 h-6 w-6 text-primary" />
          All Warranties
        </h1>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-md mx-auto px-4 py-6">
        <div className="text-center py-10">
          <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">Error Loading Warranties</h2>
          <p className="text-muted-foreground mb-4">{error.message}</p>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['warranties', user?._id] })}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!warranties || warranties.length === 0) {
    return (
      <div className="container max-w-md mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6 flex items-center">
          <List className="mr-2 h-6 w-6 text-primary" />
          All Warranties
        </h1>
        <div className="text-center py-10 bg-card rounded-lg shadow">
          <ShieldCheck className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
          <h3 className="text-md font-semibold text-foreground mb-1">No Warranties Found</h3>
          <p className="text-xs text-muted-foreground">You haven't added any warranties yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <List className="mr-2 h-6 w-6 text-primary" />
        All Warranties
      </h1>
      <div className="space-y-0">
        {warranties.map((warranty) => (
          <WarrantyListItem 
            key={warranty._id} 
            warranty={warranty} 
            onDeleteClick={(id) => setWarrantyToDelete(id)}
          />
        ))}
      </div>

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
