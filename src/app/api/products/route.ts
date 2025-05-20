import { NextRequest, NextResponse } from 'next/server';
import apiClient from '@/lib/api-client';
import { Product } from '@/types';

// GET /api/products - Browse products with enhanced features
export async function GET(request: NextRequest) {
  try {
    // Get query parameters for pagination, search, filtering, and sorting
    const url = new URL(request.url);
    const page = url.searchParams.get('page') || '1';
    const limit = url.searchParams.get('limit') || '10';
    const search = url.searchParams.get('search') || '';
    const category = url.searchParams.get('category') || '';
    const manufacturer = url.searchParams.get('manufacturer') || '';
    const sort = url.searchParams.get('sort') || 'nameAsc'; // Default sort
    
    // Get authentication token from cookies or headers
    const authHeader = request.headers.get('authorization');
    const token = authHeader ? authHeader.split(' ')[1] : null;
    
    // Build query string
    const queryParams = new URLSearchParams();
    queryParams.append('page', page);
    queryParams.append('limit', limit);
    if (search) queryParams.append('search', search);
    if (category) queryParams.append('category', category);
    if (manufacturer) queryParams.append('manufacturer', manufacturer);
    queryParams.append('sort', sort);
    
    // Fetch products from the external API
    const products = await apiClient<{ products: Product[], total: number, pages: number }>(
      `/products?${queryParams.toString()}`, 
      token ? { token } : {}
    );

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    const apiError = error as Error & { status?: number, data?: { message: string } };
    
    return NextResponse.json(
      { error: apiError.data?.message || 'Failed to fetch products' },
      { status: apiError.status || 500 }
    );
  }
}
