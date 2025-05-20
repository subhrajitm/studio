import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import apiClient from '@/lib/api-client';
import { Product } from '@/types';

interface ProductContextType {
  products: Product[];
  categories: string[];
  isLoading: boolean;
  error: string | null;
  totalProducts: number;
  totalPages: number;
  currentPage: number;
  fetchProducts: (page?: number, limit?: number, search?: string, category?: string, manufacturer?: string, sort?: string) => Promise<void>;
  fetchCategories: () => Promise<void>;
  getProductById: (id: string) => Promise<Product | null>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  const { token } = useAuth();

  // Fetch products with pagination, filtering, and sorting
  const fetchProducts = async (
    page: number = 1, 
    limit: number = 10, 
    search: string = '', 
    category: string = '', 
    manufacturer: string = '',
    sort: string = 'nameAsc'
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      if (search) queryParams.append('search', search);
      if (category) queryParams.append('category', category);
      if (manufacturer) queryParams.append('manufacturer', manufacturer);
      queryParams.append('sort', sort);
      
      const response = await apiClient<{ products: Product[], total: number, pages: number }>(
        `/api/products?${queryParams.toString()}`,
        token ? { token } : {}
      );
      
      setProducts(response.products);
      setTotalProducts(response.total);
      setTotalPages(response.pages);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to fetch products. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch product categories
  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient<{ categories: string[] }>(
        '/api/products/categories',
        token ? { token } : {}
      );
      
      setCategories(response.categories);
    } catch (err) {
      console.error('Error fetching product categories:', err);
      setError('Failed to fetch product categories. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get a single product by ID
  const getProductById = async (id: string): Promise<Product | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const product = await apiClient<Product>(
        `/api/products/${id}`,
        token ? { token } : {}
      );
      
      return product;
    } catch (err) {
      console.error('Error fetching product details:', err);
      setError('Failed to fetch product details. Please try again later.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const value = {
    products,
    categories,
    isLoading,
    error,
    totalProducts,
    totalPages,
    currentPage,
    fetchProducts,
    fetchCategories,
    getProductById
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
};
