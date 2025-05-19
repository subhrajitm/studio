"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, Plus, Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export default function EventsPage() {
  const { token, user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data: events, isLoading, error, refetch } = useQuery<Event[]>({
    queryKey: ['events', selectedDate],
    queryFn: async () => {
      if (!token) throw new Error("User not authenticated");
      
      const endpoint = selectedDate 
        ? `/api/events/date/${selectedDate}` 
        : '/api/events';
        
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      
      return response.json();
    },
    enabled: !!token
  });

  const handleDeleteEvent = async (id: string) => {
    if (!token) return;
    
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        toast({
          title: "Event deleted",
          description: "Event has been successfully deleted.",
        });
        refetch();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete event.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Events</h1>
          <Button asChild>
            <Link href="/events/add">
              <Plus className="mr-2 h-4 w-4" /> Add Event
            </Link>
          </Button>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="p-4 pb-2">
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex items-center mt-4 gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Events</h1>
          <Button asChild>
            <Link href="/events/add">
              <Plus className="mr-2 h-4 w-4" /> Add Event
            </Link>
          </Button>
        </div>
        <Card className="p-6 text-center">
          <p className="text-destructive mb-4">Failed to load events</p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Events</h1>
        <Button asChild>
          <Link href="/events/add">
            <Plus className="mr-2 h-4 w-4" /> Add Event
          </Link>
        </Button>
      </div>

      {events && events.length > 0 ? (
        <div className="grid gap-4">
          {events.map((event) => (
            <Card key={event._id} className="overflow-hidden">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg">{event.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <p className="text-muted-foreground mb-4">{event.description}</p>
                <div className="flex items-center text-sm text-muted-foreground gap-4">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(new Date(event.date), 'MMM dd, yyyy')}
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    {event.time}
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/events/${event._id}/edit`}>
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Link>
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleDeleteEvent(event._id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground mb-4">No events found</p>
          <Button asChild>
            <Link href="/events/add">
              <Plus className="mr-2 h-4 w-4" /> Add Your First Event
            </Link>
          </Button>
        </Card>
      )}
    </div>
  );
}
