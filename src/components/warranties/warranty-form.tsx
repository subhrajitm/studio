"use client";

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, UploadCloud, Sparkles, Loader2, FileText } from 'lucide-react';
import { cn, fileToDataUri } from '@/lib/utils';
import { format, parseISO, isValid } from 'date-fns';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import type { Warranty, WarrantyFormValues, UploadResponse, ExtractedWarrantyDetails } from '@/types';
import apiClient from '@/lib/api-client';
import { extractWarrantyDetails } from '@/ai/flows/extract-warranty-details'; // GenAI Flow
import Image from 'next/image';

const warrantyFormSchema = z.object({
  productName: z.string().min(1, "Product name is required."),
  purchaseDate: z.date({ required_error: "Purchase date is required." }),
  warrantyLength: z.coerce.number().int().positive().optional(), // in months
  warrantyEndDate: z.date().optional(),
  notes: z.string().optional(),
  document: z.instanceof(File).optional().nullable(),
  documentUrl: z.string().optional(),
  category: z.string().optional(),
  retailer: z.string().optional(),
  purchasePrice: z.coerce.number().positive().optional(),
}).refine(data => data.warrantyLength || data.warrantyEndDate, {
  message: "Either warranty length or end date must be provided.",
  path: ["warrantyEndDate"], // You can point to either, or a general form error
});


interface WarrantyFormProps {
  initialData?: Warranty;
  onSubmitSuccess?: () => void;
}

export function WarrantyForm({ initialData, onSubmitSuccess }: WarrantyFormProps) {
  const { token } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(initialData?.documentUrl || null);

  const defaultValues: Partial<WarrantyFormValues> = initialData ? {
    ...initialData,
    purchaseDate: initialData.purchaseDate && isValid(parseISO(initialData.purchaseDate)) ? parseISO(initialData.purchaseDate) : new Date(),
    warrantyEndDate: initialData.warrantyEndDate && isValid(parseISO(initialData.warrantyEndDate)) ? parseISO(initialData.warrantyEndDate) : undefined,
    document: null,
  } : {
    purchaseDate: new Date(),
  };
  
  const form = useForm<WarrantyFormValues>({
    resolver: zodResolver(warrantyFormSchema),
    defaultValues,
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      form.setValue('document', file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null); // Or a generic document icon
      }
    }
  };

  const handleAIExtraction = async () => {
    if (!selectedFile) {
      toast({ title: "No file selected", description: "Please select a document to extract details.", variant: "destructive" });
      return;
    }
    setIsExtracting(true);
    try {
      const dataUri = await fileToDataUri(selectedFile);
      const extractedData = await extractWarrantyDetails({ documentDataUri: dataUri });
      
      form.setValue('productName', extractedData.productName || form.getValues('productName'));
      if (extractedData.purchaseDate && isValid(new Date(extractedData.purchaseDate))) {
         form.setValue('purchaseDate', new Date(extractedData.purchaseDate));
      }
      if (extractedData.warrantyExpiration && isValid(new Date(extractedData.warrantyExpiration))) {
         form.setValue('warrantyEndDate', new Date(extractedData.warrantyExpiration));
      }
      if(extractedData.otherDetails){
        const currentNotes = form.getValues('notes') || "";
        form.setValue('notes', `${currentNotes}\nAI Extracted Details: ${extractedData.otherDetails}`.trim());
      }
      toast({ title: "Details Extracted", description: "AI has populated some fields. Please review." });
    } catch (error) {
      console.error("AI Extraction Error:", error);
      toast({ title: "AI Extraction Failed", description: (error as Error).message || "Could not extract details.", variant: "destructive" });
    } finally {
      setIsExtracting(false);
    }
  };

  const onSubmit = async (values: WarrantyFormValues) => {
    setIsSubmitting(true);
    let documentUrl = initialData?.documentUrl;

    if (values.document) {
      const formData = new FormData();
      formData.append('file', values.document);
      try {
        const uploadResponse = await apiClient<UploadResponse>('/upload', {
          method: 'POST',
          body: formData,
          token,
        });
        // The API returns a relative path like /uploads/filename.ext
        // Prepend the base API URL if needed, or use as is if your backend serves it correctly relative to API_BASE_URL
        const API_HOST_URL = 'https://warrityweb-api-x1ev.onrender.com';
        documentUrl = API_HOST_URL + uploadResponse.filePath;
      } catch (error) {
        toast({ title: "File Upload Failed", description: (error as Error).message, variant: "destructive" });
        setIsSubmitting(false);
        return;
      }
    }
    
    const warrantyDataToSubmit = {
      ...values,
      purchaseDate: values.purchaseDate ? format(values.purchaseDate, 'yyyy-MM-dd') : undefined,
      warrantyEndDate: values.warrantyEndDate ? format(values.warrantyEndDate, 'yyyy-MM-dd') : undefined,
      documentUrl: documentUrl,
      document: undefined, // Don't send the File object
    };

    try {
      if (initialData?._id) {
        await apiClient<Warranty>(`/warranties/${initialData._id}`, {
          method: 'PUT',
          data: warrantyDataToSubmit,
          token,
        });
        toast({ title: "Success", description: "Warranty updated successfully." });
      } else {
        await apiClient<Warranty>('/warranties', {
          method: 'POST',
          data: warrantyDataToSubmit,
          token,
        });
        toast({ title: "Success", description: "Warranty added successfully." });
      }
      if (onSubmitSuccess) onSubmitSuccess();
      else form.reset(defaultValues); // Reset form if no custom success handler
      setSelectedFile(null);
      setFilePreview(null);
    } catch (error) {
      toast({ title: "Submission Failed", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{initialData ? 'Edit Warranty' : 'Add New Warranty'}</CardTitle>
        <CardDescription>
          {initialData ? 'Update the details of your warranty.' : 'Fill in the details of your new warranty. You can also use AI to extract info from a document.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="productName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., SuperBlend Blender X1000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="purchaseDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Purchase Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="warrantyEndDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Warranty End Date (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick an end date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>If not set, will be calculated from warranty length.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="warrantyLength"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Warranty Length (Months)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 12 for 1 year" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                  </FormControl>
                  <FormDescription>Provide if end date is not specified.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="document"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Warranty Document (Optional)</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-4">
                      <Input 
                        type="file" 
                        accept="image/*,.pdf,.doc,.docx" 
                        onChange={handleFileChange}
                        className="flex-grow"
                      />
                    </div>
                  </FormControl>
                  {filePreview && filePreview.startsWith('data:image') && (
                     <Image src={filePreview} alt="Document preview" width={100} height={100} className="mt-2 rounded-md object-cover" data-ai-hint="receipt warranty" />
                  )}
                  {filePreview && !filePreview.startsWith('data:image') && filePreview.includes('/uploads/') && (
                    <a href={filePreview} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center mt-2">
                      <FileText className="h-4 w-4 mr-1" /> View Current Document
                    </a>
                  )}
                  {selectedFile && !selectedFile.type.startsWith('image/') && (
                    <p className="text-sm text-muted-foreground mt-1">{selectedFile.name}</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
             {selectedFile && (
              <Button type="button" variant="outline" onClick={handleAIExtraction} disabled={isExtracting} className="w-full sm:w-auto">
                {isExtracting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Extract Details with AI
              </Button>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Electronics, Appliance" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="retailer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Retailer (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Best Buy, Amazon" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
                control={form.control}
                name="purchasePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Price (Optional)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g., 199.99" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any additional details, serial number, etc." {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting || isExtracting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {initialData ? 'Update Warranty' : 'Add Warranty'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
