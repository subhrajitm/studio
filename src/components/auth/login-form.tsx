
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card'; // Removed CardDescription, CardFooter, CardTitle
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { Eye, EyeOff, ArrowUpRight, ArrowRightCircle, Loader2 } from 'lucide-react';

const loginSchema = z.object({
  // To match the visual "username" but retain email functionality for the backend:
  // The field name remains 'email', but placeholder will be 'username'.
  // If actual username login is desired, this schema and backend would need to change.
  email: z.string().email({ message: "Please enter a valid email." }), // Assuming it's still an email for backend
  password: z.string().min(1, { message: "Password is required." }), // Min 1 to match image simplicity
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "", // Field is 'email'
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      // The auth context expects an 'email' field in the credentials object.
      await login({ email: data.email, password: data.password });
    } catch (error) {
      // Error toast is handled by AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm bg-card text-card-foreground rounded-3xl p-6 sm:p-8 shadow-none border border-border/30">
      <CardHeader className="space-y-1 items-start text-left p-0 mb-6">
        <p className="text-sm font-semibold text-accent">login</p>
        <h2 className="text-3xl font-bold text-card-foreground">welcome back</h2>
      </CardHeader>
      <CardContent className="p-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="email" // Field name is email
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input 
                      type="email" // Type remains email
                      placeholder="username" // Placeholder matches image
                      className="bg-input text-input-foreground placeholder:text-muted-foreground rounded-xl border-0 h-12 text-base" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-destructive-foreground/80" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type={showPassword ? "text" : "password"}
                        placeholder="password" 
                        className="bg-input text-input-foreground placeholder:text-muted-foreground rounded-xl border-0 h-12 text-base pr-10"
                        {...field} 
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-card-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-destructive-foreground/80" />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-12 text-base font-semibold flex items-center justify-center gap-2" 
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ArrowUpRight className="h-5 w-5" />
              )}
              Login
            </Button>
          </form>
        </Form>
      </CardContent>
      <div className="mt-8 space-y-3">
        <Link href="/forgot-password" legacyBehavior>
          <a className="flex items-center gap-2 text-sm text-card-foreground font-semibold hover:opacity-80 transition-opacity">
            <ArrowRightCircle className="h-5 w-5" />
            forgot password?
          </a>
        </Link>
        <div className="flex items-center gap-2 text-sm text-card-foreground font-semibold">
            <ArrowRightCircle className="h-5 w-5" />
            don&apos;t have an account?{' '}
          <Link href="/register" legacyBehavior>
            <a className="underline hover:opacity-80 transition-opacity">
              sign up
            </a>
          </Link>
        </div>
      </div>
    </Card>
  );
}
