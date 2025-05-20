"use client";

import { useState, useEffect, useAnimation, useTheme } from 'react';
import { useForm, SubmitHandler, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { Eye, EyeOff, ArrowRight, Loader2, Lock, Key, AlertCircle, Check, X, Mail } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

// Animated gradient background
const AnimatedGradient = () => {
  const controls = useAnimation();
  const { theme } = useTheme();
  
  useEffect(() => {
    const animate = async () => {
      await controls.start({
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        transition: {
          duration: 15,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'linear'
        }
      });
    };
    animate();
  }, [controls]);
  
  const gradient = theme === 'dark' 
    ? 'linear-gradient(-45deg, #1e1b4b, #1e3a8a, #1e40af, #1e3a8a, #1e1b4b'
    : 'linear-gradient(-45deg, #e0e7ff, #dbeafe, #bfdbfe, #dbeafe, #e0e7ff';
  
  return (
    <motion.div 
      className="fixed inset-0 -z-10 opacity-30 dark:opacity-20"
      style={{
        background: `${gradient})`,
        backgroundSize: '400% 400%',
      }}
      animate={controls}
    />
  );
};

// Floating sparkles effect
const FloatingSparkles = () => {
  const [sparkles, setSparkles] = useState<Array<{id: number, x: number, y: number, size: number, delay: number}>>([]);
  
  useEffect(() => {
    // Create initial sparkles
    const initialSparkles = Array(8).fill(0).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 0.5 + 0.5,
      delay: Math.random() * 2
    }));
    setSparkles(initialSparkles);
  }, []);
  
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          className="absolute rounded-full bg-primary/50 dark:bg-primary/30"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: `${sparkle.size}rem`,
            height: `${sparkle.size}rem`,
            filter: 'blur(0.25rem)'
          }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0.5, 1.5, 0.5]
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            repeatDelay: sparkle.delay,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  );
};

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  rememberMe: z.boolean().default(false)
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden">
      <AnimatedGradient />
      <FloatingSparkles />
      
      <motion.div 
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="backdrop-blur-sm bg-background/80 dark:bg-background/90 p-8 rounded-2xl shadow-xl border border-border/50">
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20 mb-4">
              <Key className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to continue to your account
            </p>
          </motion.div>
          
          <LoginForm />
          
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link 
              href="/register" 
              className="font-medium text-primary hover:underline underline-offset-4"
            >
              Sign up
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const LoginForm = () => {
  const { theme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeIcon, setActiveIcon] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const icons = [
    <Lock key="lock" className="h-5 w-5" />, 
    <Key key="key" className="h-5 w-5" />,
    <Sparkles key="sparkle" className="h-5 w-5" />
  ];

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

  // Animate icon change
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIcon(prev => (prev + 1) % icons.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <FloatingParticles />
      
      <div className="max-w-md mx-auto w-full space-y-12">
        {/* Header */}
        <motion.div 
          className="text-center space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <motion.div 
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="h-16 w-16 flex items-center justify-center text-primary mb-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIcon}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {icons[activeIcon]}
                </motion.div>
              </AnimatePresence>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                Welcome back!
              </h1>
              <p className="text-muted-foreground text-sm">
                Sign in to continue your journey
              </p>
            </div>
          </motion.div>
          
          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {error && (
                <motion.div 
                  className="p-3 text-sm rounded-md bg-destructive/10 text-destructive flex items-center gap-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </motion.div>
              )}
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          className="pl-10"
                          {...field}
                        />
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      <Link
                        href="/forgot-password"
                        className="text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="pl-10 pr-10"
                          {...field}
                        />
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex items-center justify-between">
                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        Remember me
                      </FormLabel>
                    </FormItem>
                  )}
                />
                
                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
          
          {/* Footer */}
          <motion.div 
            className="w-full text-center text-sm text-muted-foreground mt-12 pt-6 border-t border-border/10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <span className="opacity-80">Don't have an account?</span>{' '}
            <Link 
              href="/register"
              className="font-medium text-primary hover:text-accent transition-colors duration-200 inline-flex items-center group"
            >
              <span>Sign up now</span>
              <motion.span
                className="inline-flex items-center"
                initial={{ opacity: 0, x: -4 }}
                whileHover={{ opacity: 1, x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <ArrowRight className="ml-1 h-4 w-4" />
              </motion.span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Decorative background elements */}
      <motion.div 
        className="fixed -bottom-40 -left-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl -z-10"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.4, 0.6, 0.4]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut'
        }}
      />
      <motion.div 
        className="fixed -top-20 -right-20 w-64 h-64 rounded-full bg-accent/5 blur-3xl -z-10"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.5, 0.2]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
          delay: 2
        }}
      />
    </div>
  );
}
