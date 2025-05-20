import { NextRequest, NextResponse } from 'next/server';
import apiClient from '@/lib/api-client';

interface CalendarEvent {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location?: string;
  type: 'warranty' | 'service' | 'reminder' | 'other';
  relatedItemId?: string; // ID of warranty or service item
  createdAt: string;
  updatedAt: string;
}

// GET /api/calendar/events - Get all calendar events
export async function GET(request: NextRequest) {
  try {
    // Get query parameters for filtering
    const url = new URL(request.url);
    const startDate = url.searchParams.get('startDate') || '';
    const endDate = url.searchParams.get('endDate') || '';
    const type = url.searchParams.get('type') || '';
    
    // Get authentication token from cookies or headers
    const authHeader = request.headers.get('authorization');
    const token = authHeader ? authHeader.split(' ')[1] : null;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Build query string
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    if (type) queryParams.append('type', type);
    
    // Fetch calendar events from the external API
    const events = await apiClient<{ events: CalendarEvent[] }>(
      `/calendar/events${queryParams.toString() ? `?${queryParams.toString()}` : ''}`, 
      { token }
    );

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    const apiError = error as Error & { status?: number, data?: { message: string } };
    
    return NextResponse.json(
      { error: apiError.data?.message || 'Failed to fetch calendar events' },
      { status: apiError.status || 500 }
    );
  }
}

// POST /api/calendar/events - Create a new calendar event
export async function POST(request: NextRequest) {
  try {
    // Get authentication token from cookies or headers
    const authHeader = request.headers.get('authorization');
    const token = authHeader ? authHeader.split(' ')[1] : null;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const eventData = await request.json();
    
    // Create calendar event via external API
    const newEvent = await apiClient<CalendarEvent>('/calendar/events', {
      method: 'POST',
      data: eventData,
      token
    });

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    const apiError = error as Error & { status?: number, data?: { message: string } };
    
    return NextResponse.json(
      { error: apiError.data?.message || 'Failed to create calendar event' },
      { status: apiError.status || 500 }
    );
  }
}
