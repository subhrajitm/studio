import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import apiClient from '@/lib/api-client';
import { authOptions } from '@/lib/auth';

// GET /api/events/date/:date - Get events for a specific date
export async function GET(
  request: NextRequest,
  { params }: { params: { date: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const events = await apiClient(`/events/date/${params.date}`, {
      token: session.accessToken,
    });
    
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events by date:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events for the specified date' },
      { status: 500 }
    );
  }
}
