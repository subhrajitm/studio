import { NextRequest, NextResponse } from 'next/server';
import apiClient from '@/lib/api-client';

// GET /api/products/categories - Get all product categories
export async function GET(request: NextRequest) {
  try {
    // Get authentication token from cookies or headers
    const authHeader = request.headers.get('authorization');
    const token = authHeader ? authHeader.split(' ')[1] : null;
    
    // Fetch categories from the external API
    const categories = await apiClient<{ categories: string[] }>(
      '/products/categories', 
      token ? { token } : {}
    );

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching product categories:', error);
    const apiError = error as Error & { status?: number, data?: { message: string } };
    
    return NextResponse.json(
      { error: apiError.data?.message || 'Failed to fetch product categories' },
      { status: apiError.status || 500 }
    );
  }
}
