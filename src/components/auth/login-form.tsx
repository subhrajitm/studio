"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '@/components/ui/form';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Loader2, 
  Mail, 
  Lock, 
  LogIn,
  Sparkles,
  Key,
  AlertCircle,
  Check,
  X
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

// Floating particles component
const FloatingParticles = () => {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  if (!isClient) return null;
  
  const particles = Array(15).fill(0);
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-primary/10 dark:bg-primary/20"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 0),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 0),
            width: Math.random() * 10 + 5,
            height: Math.random() * 10 + 5,
            opacity: Math.random() * 0.5 + 0.1,
          }}
          animate={{
            y: [null, -Math.random() * 100 - 50],
            x: [null, (Math.random() - 0.5) * 50],
            opacity: [0.1, Math.random() * 0.5 + 0.1, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            repeatType: 'loop' as const,
            ease: 'linear',
            delay: Math.random() * -20,
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

export function LoginForm() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredField, setHoveredField] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [shake, setShake] = useState(false);
  const [activeIcon, setActiveIcon] = useState(0);

  const icons = [<Lock key="lock" className="h-5 w-5" />, <Key key="key" className="h-5 w-5" />];

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

  // Calculate password strength
  const calculatePasswordStrength = (password: string) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (password.match(/[a-z]+/)) strength += 1;
    if (password.match(/[A-Z]+/)) strength += 1;
    if (password.match(/[0-9]+/)) strength += 1;
    return Math.min(Math.floor((strength / 4) * 100), 100);
  };

  // Handle password change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    form.setValue('password', value);
    setPasswordStrength(calculatePasswordStrength(value));
  };

  // Shake animation on error
  useEffect(() => {
    if (error) {
      setShake(true);
      const timer = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Animate icon change
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIcon(prev => (prev + 1) % icons.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center p-6">
      <FloatingParticles />
      
      <div className="flex flex-col items-center gap-8 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-sm mx-auto"
        >
          <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-6">
            <motion.div 
              className="h-20 w-20 rounded-2xl flex items-center justify-center mx-auto relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIcon}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-primary"
                >
                  {icons[activeIcon]}
                </motion.div>
              </AnimatePresence>
              {/* Decorative ring */}
              <div className="absolute inset-0 rounded-2xl border-2 border-primary/20 dark:border-primary/10" />
              <div className="absolute inset-0 rounded-2xl bg-primary/5 dark:bg-primary/5" />
            </motion.div>
            
            <AnimatePresence mode="wait">
              {error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium text-destructive bg-destructive/10 rounded-lg px-3 py-2",
                    shake && "animate-shake"
                  )}
                  onAnimationEnd={() => setShake(false)}
                >
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 ml-auto rounded-full p-0 text-destructive"
                    onClick={() => setError(null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
          
          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem
                    className={cn(
                      "space-y-1",
                      hoveredField === "email" && "scale-[1.01] transition-transform"
                    )}
                    onMouseEnter={() => setHoveredField("email")}
                    onMouseLeave={() => setHoveredField(null)}
                  >
                    <FormLabel className="text-xs font-medium text-muted-foreground">
                      Email
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="you@example.com"
                          className="pl-10 h-9 bg-background/80 border-border/50 focus-visible:ring-primary/30"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem
                    className={cn(
                      "space-y-1",
                      hoveredField === "password" && "scale-[1.01] transition-transform"
                    )}
                    onMouseEnter={() => setHoveredField("password")}
                    onMouseLeave={() => setHoveredField(null)}
                  >
                    <FormLabel className="text-xs font-medium text-muted-foreground">
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••"
                          className="pl-10 h-9 pr-10 bg-background/80 border-border/50 focus-visible:ring-primary/30"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handlePasswordChange(e);
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1 h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
                    </FormControl>
                    
                    {/* Password strength indicator */}
                    {field.value && (
                      <div className="h-1 w-full bg-border/50 rounded-full overflow-hidden">
                        <motion.div
                          className={cn(
                            "h-full",
                            passwordStrength < 30 && "bg-destructive",
                            passwordStrength >= 30 && passwordStrength < 60 && "bg-amber-500",
                            passwordStrength >= 60 && "bg-emerald-500"
                          )}
                          initial={{ width: 0 }}
                          animate={{ width: `${passwordStrength}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    )}
                    
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              
              <div className="flex items-center justify-between pt-2">
                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="h-4 w-4 rounded border-border/70 bg-background/80 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-medium text-foreground/90 cursor-pointer">
                        Remember me
                      </FormLabel>
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className={cn(
                    "relative h-10 px-5 rounded-lg text-sm font-medium overflow-hidden",
                    "bg-gradient-to-r from-primary to-accent text-primary-foreground",
                    "shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all duration-300",
                    "hover:scale-[1.02] transform-gpu",
                    "focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background"
                  )}
                  disabled={isLoading}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <LogIn className="h-4 w-4" />
                        <span>Sign in</span>
                      </>
                    )}
                  </span>
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
                <ArrowRight className="h-3 w-3 ml-1" />
              </motion.span>
            </Link>
          </motion.div>
          </div>
        </motion.div>
        
        <div className="space-y-2">
          <motion.h1 
            className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent inline-block"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Welcome back!
          </motion.h1>
          <motion.p 
            className="text-muted-foreground text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Sign in to continue your journey
          </motion.p>
        </div>
      </div>
      
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
