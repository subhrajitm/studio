"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/auth-context';
import type { User, ProfileFormValues, UploadResponse } from '@/types';
import apiClient from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud } from 'lucide-react';
import Image from 'next/image';

const profileFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters."),
  email: z.string().email("Invalid email address."),
  profilePictureFile: z.instanceof(File).optional().nullable(),
});

const API_BASE_URL_FOR_FILES = 'https://warrityweb-api-x1ev.onrender.com';

export function ProfileForm() {
  const { user, token, fetchUserProfile, updateUserInContext } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
      profilePictureFile: null,
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        username: user.username,
        email: user.email,
        profilePictureFile: null,
      });
      if (user.profilePicture) {
        setProfilePicPreview(`${API_BASE_URL_FOR_FILES}${user.profilePicture}`);
      } else {
        setProfilePicPreview(null);
      }
    }
  }, [user, form]);
  
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('profilePictureFile', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user || !token) return;
    setIsSubmitting(true);

    try {
      let updatedUserData = { ...values };
      delete (updatedUserData as any).profilePictureFile; // Don't send file object in main update

      // Handle profile picture upload if a new file is selected
      if (values.profilePictureFile) {
        const formData = new FormData();
        formData.append('profilePicture', values.profilePictureFile); // API expects 'profilePicture' field
        
        // Using POST /api/users/:id/profile-picture endpoint
        const uploadResponse = await apiClient<User>(`/users/${user._id}/profile-picture`, {
            method: 'POST',
            body: formData,
            token,
        });
        // The response from this endpoint might directly be the updated User object
        // Or it might be a specific structure indicating success and new path
        // Assuming it returns the updated user object:
        updateUserInContext(uploadResponse); // Update context with new user data (including profilePicture path)
        toast({ title: "Success", description: "Profile picture updated." });
      }

      // Update other user details
      // The API might not allow changing email or username directly like this,
      // this is a generic PUT request example. Adjust based on actual API capabilities.
      const updatedUser = await apiClient<User>(`/users/${user._id}`, {
        method: 'PUT',
        data: { username: values.username, email: values.email }, // Only send fields API expects
        token,
      });

      updateUserInContext(updatedUser); // Update context
      await fetchUserProfile(); // Re-fetch to ensure consistency, or rely on updateUserInContext
      
      toast({ title: "Success", description: "Profile updated successfully." });
    } catch (error) {
      toast({ title: "Update Failed", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return <p>Loading profile...</p>;
  }

  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Profile Settings</CardTitle>
        <CardDescription>Manage your account information.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-32 w-32">
                <AvatarImage src={profilePicPreview || undefined} alt={user.username} data-ai-hint="user avatar" />
                <AvatarFallback className="text-4xl">{getInitials(user.username)}</AvatarFallback>
              </Avatar>
              <FormField
                control={form.control}
                name="profilePictureFile"
                render={() => ( // field isn't used directly for Input type="file"
                  <FormItem>
                    <FormControl>
                      <Button asChild variant="outline" size="sm">
                        <label htmlFor="profilePictureFile" className="cursor-pointer">
                          <UploadCloud className="mr-2 h-4 w-4" />
                          Change Picture
                          <Input id="profilePictureFile" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </label>
                      </Button>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Your username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Changes
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
