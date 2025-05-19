
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import apiClient from '@/lib/api-client';
import type { Warranty } from '@/types';
import { WarrantyForm } from '@/components/warranties/warranty-form';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldX, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';


export default function EditWarrantyPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { token, user } = useAuth(); // Added user here
  const queryClient = useQueryClient();

  const { data: warranty, isLoading, error } = useQuery<Warranty, Error>({
    queryKey: ['warranty', id],
    queryFn: () => apiClient<Warranty>(`/warranties/${id}`, { token }),
    enabled: !!id && !!token,
  });

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['dashboardData', user?._id] }); // Specific invalidation for dashboard
    queryClient.invalidateQueries({ queryKey: ['warranty', id] }); // Invalidate this specific item
    router.push('/dashboard');
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-2xl mx-auto space-y-6">
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
     return (
      <div className="container mx-auto py-8 text-center">
        <ShieldX className="mx-auto h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Error Loading Warranty</h2>
        <p className="text-muted-foreground mb-4">{error.message}</p>
        <Button asChild variant="outline">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  if (!warranty) {
     return (
      <div className="container mx-auto py-8 text-center">
        <ShieldX className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Warranty Not Found</h2>
        <p className="text-muted-foreground mb-4">The requested warranty could not be found.</p>
         <Button asChild variant="outline">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Button variant="outline" size="sm" className="mb-6" asChild>
         <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
         </Link>
      </Button>
      <WarrantyForm initialData={warranty} onSubmitSuccess={handleSuccess} />
    </div>
  );
}

// Cannot use generateMetadata in a client component.
// Metadata for dynamic routes needs a generateMetadata export in a server component.
// For now, title will be generic.
// export async function generateMetadata({ params }: { params: { id: string } }) {
//   // TODO: Fetch warranty name if possible for title, or keep generic
//   return {
//     title: `Edit Warranty - Warrity`,
//   };
// }
