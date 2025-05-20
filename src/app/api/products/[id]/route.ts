import { NextRequest, NextResponse } from 'next/server';
import apiClient from '@/lib/api-client';
import { Product } from '@/types';

// GET /api/products/:id - Get detailed product information
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authentication token from cookies or headers
    const authHeader = request.headers.get('authorization');
    const token = authHeader ? authHeader.split(' ')[1] : null;
    
    // Fetch product details from the external API
    const product = await apiClient<Product>(`/products/${params.id}`, 
      token ? { token } : {}
    );

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product details:', error);
    const apiError = error as Error & { status?: number, data?: { message: string } };
    
    return NextResponse.json(
      { error: apiError.data?.message || 'Failed to fetch product details' },
      { status: apiError.status || 500 }
    );
  }
}
