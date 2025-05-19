
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '@/components/ui/form';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { 
  Eye, 
  EyeOff, 
  ArrowRightCircle, 
  Loader2, 
  Mail, 
  Lock, 
  LogIn
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  rememberMe: z.boolean().default(false)
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await login({ email: data.email, password: data.password });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xs mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="w-full bg-gradient-to-b from-gray-900 to-gray-950 text-white rounded-xl border border-gray-800 shadow-lg overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-lime-300 via-lime-400 to-lime-300"></div>
          
          <CardHeader className="space-y-1 p-5 pb-3">
            <div className="flex flex-col items-center text-center space-y-1.5">
              <motion.div 
                className="h-12 w-12 rounded-full bg-gradient-to-br from-lime-400 to-lime-600 flex items-center justify-center shadow-md shadow-lime-500/20"
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.03, 1]
                }}
                transition={{ 
                  rotate: { duration: 0.6, ease: "easeInOut" },
                  scale: { duration: 0.2 }
                }}
              >
                <Lock className="h-5 w-5 text-white" />
              </motion.div>
              <div>
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-lime-300 to-lime-400">
                  Welcome back!
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Sign in to continue</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-5 pt-0">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                {error && (
                  <div className="p-2 text-sm bg-red-500/10 border border-red-500/30 rounded-md text-red-400">
                    {error}
                  </div>
                )}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-gray-400">Email</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder="you@example.com"
                            className="bg-gray-800/50 border-gray-700 text-sm h-9 pl-9 pr-3"
                            {...field}
                          />
                        </FormControl>
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                      </div>
                      <FormMessage className="text-red-400 text-xs mt-0.5" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-xs text-gray-400">Password</FormLabel>
                        <Link 
                          href="/forgot-password" 
                          className="text-xs text-lime-300 hover:text-lime-400 transition-colors"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <FormControl>
                          <Input 
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="bg-gray-800/50 border-gray-700 text-sm h-9 pl-9 pr-9"
                            {...field}
                          />
                        </FormControl>
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                        <button
                          type="button"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-gray-400 hover:text-lime-300 flex items-center justify-center"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                          <span className="sr-only">
                            {showPassword ? "Hide password" : "Show password"}
                          </span>
                        </button>
                      </div>
                      <FormMessage className="text-red-400 text-xs mt-0.5" />
                    </FormItem>
                  )}
                />
                
                <div className="flex items-center justify-between pt-1">
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="h-3.5 w-3.5 rounded border-gray-600 bg-gray-800/50 data-[state=checked]:bg-lime-400 data-[state=checked]:text-gray-900"
                          />
                        </FormControl>
                        <FormLabel className="text-xs text-gray-300 cursor-pointer">
                          Remember me
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="bg-gradient-to-r from-lime-300 to-lime-400 text-gray-900 hover:from-lime-400 hover:to-lime-500 h-8 text-xs font-medium px-4 gap-1.5 shadow-md shadow-lime-900/20"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="h-3.5 w-3.5" />
                        <span>Sign in</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
          
          <CardFooter className="p-4 pt-0">
            <div className="w-full text-center text-xs text-gray-500">
              No account?{' '}
              <Link 
                href="/register"
                className="text-lime-300 hover:text-lime-400 transition-colors inline-flex items-center"
              >
                Sign up
                <ArrowRightCircle className="ml-0.5 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </CardFooter>
        </Card>
        
        {/* Security Badge */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 text-xs text-gray-500">
            <div className="flex items-center justify-center h-5 w-5 rounded-full bg-gray-800/50 border border-gray-700">
              <Lock className="h-2.5 w-2.5 text-lime-400" />
            </div>
            <span>End-to-end encrypted</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
