"use client";

import { ProfileForm } from '@/components/profile/profile-form';

export default function ProfilePage() {
  // This page must be a client component for ProfileForm.
  // Dynamic title setting could be done with useEffect if needed.
  // useEffect(() => {
  //   document.title = 'Profile Settings - Warrity';
  // }, []);

  return (
    <div className="container mx-auto py-8">
      <ProfileForm />
    </div>
  );
}

// Cannot use generateMetadata in a client component.
// export const metadata: Metadata = {
//   title: 'Profile Settings - Warrity',
//   description: 'Manage your Warrity account settings.',
// };
