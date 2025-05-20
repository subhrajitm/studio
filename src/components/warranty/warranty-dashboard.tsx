import React, { useState, useEffect } from 'react';
import { useWarranty } from '@/contexts/warranty-context';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// Custom Pagination component
const Pagination = ({ currentPage, totalPages, onPageChange }: { currentPage: number, totalPages: number, onPageChange: (page: number) => void }) => {
  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage <= 1}
      >
        Previous
      </Button>
      <span className="text-sm">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage >= totalPages}
      >
        Next
      </Button>
    </div>
  );
};

// Custom Spinner component
const Spinner = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const sizeClass = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  }[size];
  
  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-black ${sizeClass}`}></div>
  );
};
import { PlusIcon, SearchIcon, FilterIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

const WarrantyDashboard = () => {
  const { 
    warranties = [], 
    expiringWarranties = [], 
    isLoading, 
    error, 
    totalWarranties = 0, 
    totalPages = 0, 
    currentPage = 1,
    fetchWarranties, 
    fetchExpiringWarranties 
  } = useWarranty() || {};
  
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWarranties(1, 10, searchTerm, selectedCategory, selectedStatus);
  };
  
  // Handle pagination
  const handlePageChange = (page: number) => {
    fetchWarranties(page, 10, searchTerm, selectedCategory, selectedStatus);
  };
  
  // Handle filter change
  const handleFilterChange = () => {
    fetchWarranties(1, 10, searchTerm, selectedCategory, selectedStatus);
  };
  
  // Calculate warranty status
  const getWarrantyStatus = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    
    if (expiry < today) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    
    const daysRemaining = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining <= 30) {
      return <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">Expiring Soon</Badge>;
    }
    
    return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      // Check if dateString is valid
      if (!dateString || typeof dateString !== 'string') {
        return 'Invalid date';
      }
      
      // Validate date string format
      if (!/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
        return 'Invalid date format';
      }
      
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return 'Invalid date';
    }
  };
  
  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
    }
  }, [error, toast]);
  
  // Fetch warranties when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      fetchWarranties();
      fetchExpiringWarranties();
    }
  }, [isAuthenticated]);
  
  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Authentication Required</CardTitle>
          <CardDescription>
            Please log in to view your warranties.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link href="/login">
            <Button>Log In</Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Warranties</h1>
        <Link href="/warranties/new">
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Warranty
          </Button>
        </Link>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Warranties</TabsTrigger>
          <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Warranties</CardTitle>
              <CardDescription>
                Manage all your product warranties in one place.
              </CardDescription>
              
              <div className="flex flex-col md:flex-row gap-4 mt-4">
                <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                  <Input
                    placeholder="Search warranties..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit">
                    <SearchIcon className="h-4 w-4" />
                  </Button>
                </form>
                
                <div className="flex gap-2">
                  <select
                    className="px-3 py-2 border rounded-md"
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      handleFilterChange();
                    }}
                  >
                    <option value="">All Categories</option>
                    <option value="electronics">Electronics</option>
                    <option value="appliances">Appliances</option>
                    <option value="furniture">Furniture</option>
                    <option value="automotive">Automotive</option>
                    <option value="other">Other</option>
                  </select>
                  
                  <select
                    className="px-3 py-2 border rounded-md"
                    value={selectedStatus}
                    onChange={(e) => {
                      setSelectedStatus(e.target.value);
                      handleFilterChange();
                    }}
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="expiring">Expiring Soon</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner size="lg" />
                </div>
              ) : warranties.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No warranties found.</p>
                  <p className="mt-2">
                    <Link href="/warranties/new">
                      <Button variant="outline" className="mt-2">
                        Add your first warranty
                      </Button>
                    </Link>
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {warranties.map((warranty) => (
                    <Card key={warranty._id} className="h-full">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{warranty.productName}</CardTitle>
                          {getWarrantyStatus(warranty.expiryDate)}
                        </div>
                        <CardDescription>
                          {warranty.productBrand} • {warranty.productCategory}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p><strong>Purchase Date:</strong> {formatDate(warranty.purchaseDate)}</p>
                          <p><strong>Expiry Date:</strong> {formatDate(warranty.expiryDate)}</p>
                          {warranty.retailer && (
                            <p><strong>Retailer:</strong> {warranty.retailer}</p>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Link href={`/warranties/${warranty._id}`}>
                          <Button variant="outline">View Details</Button>
                        </Link>
                        <Link href={`/warranties/${warranty._id}/edit`}>
                          <Button variant="secondary">Edit</Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
              
              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="expiring">
          <Card>
            <CardHeader>
              <CardTitle>Expiring Soon</CardTitle>
              <CardDescription>
                Warranties that will expire within the next 30 days.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner size="lg" />
                </div>
              ) : expiringWarranties.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No warranties expiring soon.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {expiringWarranties.map((warranty) => (
                    <Card key={warranty._id} className="h-full">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{warranty.productName}</CardTitle>
                          {getWarrantyStatus(warranty.expiryDate)}
                        </div>
                        <CardDescription>
                          {warranty.productBrand} • {warranty.productCategory}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p><strong>Purchase Date:</strong> {formatDate(warranty.purchaseDate)}</p>
                          <p><strong>Expiry Date:</strong> {formatDate(warranty.expiryDate)}</p>
                          <p className="text-warning font-medium">
                            Expires {(() => {
                              try {
                                // Validate the date string before creating a Date object
                                if (!warranty.expiryDate || !/^\d{4}-\d{2}-\d{2}/.test(warranty.expiryDate)) {
                                  return 'soon';
                                }
                                const expiryDate = new Date(warranty.expiryDate);
                                // Check if the date is valid
                                if (isNaN(expiryDate.getTime())) {
                                  return 'soon';
                                }
                                return formatDistanceToNow(expiryDate, { addSuffix: true });
                              } catch (error) {
                                console.error('Error formatting date:', error, warranty.expiryDate);
                                return 'soon';
                              }
                            })()}
                          </p>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Link href={`/warranties/${warranty._id}`}>
                          <Button variant="outline">View Details</Button>
                        </Link>
                        <Link href={`/warranties/${warranty._id}/edit`}>
                          <Button variant="secondary">Edit</Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WarrantyDashboard;
