"use client";

import { WarrantyForm } from '@/components/warranties/warranty-form';
import { useRouter } from 'next/navigation';
import type { Metadata } from 'next';

// Metadata can't be dynamic in client components directly, but we can set a generic one.
// For dynamic metadata based on client-side state, you'd handle it differently (e.g. document.title).
// export const metadata: Metadata = {
//   title: 'Add New Warranty - Warranty Wallet',
//   description: 'Add a new warranty to your Warranty Wallet.',
// };
// This page must be a client component because WarrantyForm is one.
// So we can't export metadata object directly.

export default function AddWarrantyPage() {
  const router = useRouter();

  // This effect would be for dynamic title setting if needed, but metadata API preferred for static.
  // useEffect(() => {
  //   document.title = 'Add New Warranty - Warranty Wallet';
  // }, []);

  const handleSuccess = () => {
    router.push('/dashboard');
  };

  return (
    <div className="container mx-auto py-8">
      <WarrantyForm onSubmitSuccess={handleSuccess} />
    </div>
  );
}
