"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/auth-context';
import type { User, ProfileFormValues } from '@/types';
import apiClient from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud, User as UserIcon, Mail, Shield, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

const profileFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters."),
  email: z.string().email("Invalid email address."),
  profilePictureFile: z.instanceof(File).optional().nullable(),
  notificationsEnabled: z.boolean().default(true),
});

const API_BASE_URL_FOR_FILES = 'https://warrityweb-api-x1ev.onrender.com';

export function ProfileForm() {
  const { user, token, fetchUserProfile, updateUserInContext } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("profile");

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
      profilePictureFile: null,
      notificationsEnabled: true,
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        username: user.username,
        email: user.email,
        profilePictureFile: null,
        notificationsEnabled: true, // Default to true, could be fetched from user preferences
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
      // Handle profile picture upload if a new file is selected
      if (values.profilePictureFile) {
        const formData = new FormData();
        formData.append('profilePicture', values.profilePictureFile);
        
        const uploadResponse = await apiClient<User>(`/users/${user._id}/profile-picture`, {
            method: 'POST',
            body: formData,
            token,
        });
        updateUserInContext(uploadResponse);
        toast({ title: "Success", description: "Profile picture updated." });
      }

      // Prepare update data based on active tab
      let updateMessage = "Profile updated successfully.";
      let updateData: any = {};
      
      if (activeTab === "profile") {
        updateData = { username: values.username, email: values.email };
        updateMessage = "Profile information updated successfully.";
      } else if (activeTab === "notifications") {
        updateData = { 
          notificationsPreferences: { emailNotifications: values.notificationsEnabled }
        };
        updateMessage = "Notification preferences updated successfully.";
      }

      // Update user details
      const updatedUser = await apiClient<User>(`/users/${user._id}`, {
        method: 'PUT',
        data: updateData,
        token,
      });

      updateUserInContext(updatedUser);
      await fetchUserProfile();
      
      toast({ title: "Success", description: updateMessage });
      form.reset(values);
    } catch (error) {
      toast({ title: "Update Failed", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Card className="w-full max-w-3xl mx-auto shadow-md">
        <CardContent className="py-10">
          <div className="flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2 text-muted-foreground">Loading profile...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate account age
  const accountCreated = user.createdAt ? new Date(user.createdAt) : new Date();
  const accountAge = Math.floor((new Date().getTime() - accountCreated.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* User Profile Header */}
      <div className="mb-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-background shadow-md">
              <AvatarImage src={profilePicPreview || undefined} alt={user.username} />
              <AvatarFallback className="text-2xl bg-primary/20">{getInitials(user.username)}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2">
              <Button asChild variant="outline" size="icon" className="rounded-full h-8 w-8 bg-background shadow-md hover:bg-primary hover:text-primary-foreground">
                <label htmlFor="profilePictureFile" className="cursor-pointer flex items-center justify-center">
                  <UploadCloud className="h-4 w-4" />
                  <Input id="profilePictureFile" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              </Button>
            </div>
          </div>
          
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold">{user.username}</h2>
            <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start">
              <Mail className="h-3 w-3 mr-1" />
              {user.email}
            </p>
            <div className="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
              <Badge variant="outline" className="bg-primary/10 text-xs">
                <Clock className="h-3 w-3 mr-1" />
                Member for {accountAge} days
              </Badge>
              <Badge variant="outline" className="bg-primary/10 text-xs">
                <Shield className="h-3 w-3 mr-1" />
                {user.role || 'User'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Interface */}
      <Tabs defaultValue="profile" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="profile" className="flex items-center">
            <UserIcon className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center">
            <Mail className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Personal Information</CardTitle>
                  <CardDescription>Update your personal details here.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-5">
                  <Button variant="outline" type="button">Cancel</Button>
                  <Button type="submit" disabled={isSubmitting || !form.formState.isDirty}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Account Information</CardTitle>
                  <CardDescription>View your account details.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-sm font-medium">Account ID</span>
                      <span className="text-sm text-muted-foreground">{user._id}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-sm font-medium">Created On</span>
                      <span className="text-sm text-muted-foreground">{user.createdAt ? format(new Date(user.createdAt), 'PPP') : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-sm font-medium">Last Updated</span>
                      <span className="text-sm text-muted-foreground">{user.updatedAt ? format(new Date(user.updatedAt), 'PPP') : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-sm font-medium">Account Status</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Notification Preferences</CardTitle>
                  <CardDescription>Manage how you receive notifications.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="notificationsEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between py-3 border-b">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Email Notifications</FormLabel>
                          <FormDescription className="text-xs text-muted-foreground">
                            Receive notifications about warranty expirations via email
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="flex items-center justify-between py-3 border-b">
                    <div className="space-y-0.5">
                      <span className="text-base font-medium">Warranty Expiration Alerts</span>
                      <p className="text-xs text-muted-foreground">
                        Get notified when warranties are about to expire
                      </p>
                    </div>
                    <Switch checked={true} disabled />
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div className="space-y-0.5">
                      <span className="text-base font-medium">Marketing Emails</span>
                      <p className="text-xs text-muted-foreground">
                        Receive emails about new features and promotions
                      </p>
                    </div>
                    <Switch checked={false} disabled />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-5">
                  <Button variant="outline" type="button">Cancel</Button>
                  <Button type="submit" disabled={isSubmitting || !form.formState.isDirty}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save Preferences
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Security Settings</CardTitle>
                  <CardDescription>Manage your account security.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-md">
                      <h3 className="font-medium mb-2">Password Management</h3>
                      <p className="text-sm text-muted-foreground mb-4">Your password should be at least 8 characters and include a mix of letters, numbers, and symbols.</p>
                      <Button variant="outline" disabled>Change Password</Button>
                    </div>
                    <div className="p-4 border rounded-md">
                      <h3 className="font-medium mb-2">Two-Factor Authentication</h3>
                      <p className="text-sm text-muted-foreground mb-4">Add an extra layer of security to your account by enabling two-factor authentication.</p>
                      <Button variant="outline" disabled>Enable 2FA</Button>
                    </div>
                    <div className="p-4 border rounded-md">
                      <h3 className="font-medium mb-2">Active Sessions</h3>
                      <p className="text-sm text-muted-foreground mb-4">You are currently logged in from this device.</p>
                      <Button variant="destructive" disabled>Sign Out All Devices</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </form>
        </Form>
      </Tabs>
    </div>
  );
}
