
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { EventCard } from "@/components/event-card";
import { FilterControls, type CalendarFilters } from "@/components/filter-controls";
import { getEventsService, getUnavailabilitiesService } from '@/lib/data-service';
import type { ClassEvent, Availability, Teacher } from '@/types';
import { format, isSameDay } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CalendarCheck2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [filters, setFilters] = useState<CalendarFilters>({
    highlightConflicts: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [allEvents, setAllEvents] = useState<ClassEvent[]>([]);
  const [allUnavailabilities, setAllUnavailabilities] = useState<Availability[]>([]);

  useEffect(() => {
    if (!selectedDate) {
      setSelectedDate(new Date());
    }
  }, [selectedDate]);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [eventsData, unavailabilitiesData] = await Promise.all([
          getEventsService(),
          getUnavailabilitiesService(),
        ]);
        setAllEvents(eventsData);
        setAllUnavailabilities(unavailabilitiesData);
      } catch (error) {
        console.error("Failed to fetch calendar data:", error);
        // Optionally, set an error state and display a message to the user
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []); // Fetch once on mount

  // Helper function to get unavailability for a date and teacher from the state
  const getUnavailabilityForDateFromState = (date: Date, teacherId: string): Availability | undefined => {
    return allUnavailabilities.find(
      (ua) => ua.teacherId === teacherId && isSameDay(ua.date, date) && ua.isUnavailable
    );
  };
  
  const dailyEventsAndUnavailabilities = useMemo(() => {
    if (!selectedDate || isLoading) return [];

    const dayEvents = allEvents.filter(event =>
      isSameDay(event.date, selectedDate) &&
      (!filters.teacherId || event.teacher.id === filters.teacherId) &&
      (!filters.languageId || event.language.id === filters.languageId)
    );

    const unavailabilitiesForDay: ClassEvent[] = allUnavailabilities
      .filter(ua => 
        isSameDay(ua.date, selectedDate) && 
        ua.isUnavailable &&
        (!filters.teacherId || ua.teacherId === filters.teacherId)
      )
      .map(ua => {
        // Try to find teacher info from the fetched events (more robust would be a separate teacher fetch if needed)
        const teacherInvolved = allEvents.find(e => e.teacher.id === ua.teacherId)?.teacher || 
                                allEvents.find(e => e.id.includes(ua.teacherId))?.teacher; // Basic fallback
        
        const teacherData: Teacher = teacherInvolved || {
            id: ua.teacherId, 
            name: `Teacher ${ua.teacherId.substring(ua.teacherId.length - 2)}`, 
            languagesTaught:[]
        };

        return {
          id: ua.id,
          date: ua.date,
          startTime: "All Day",
          endTime: "",
          teacher: teacherData,
          language: {id: 'unavail', name: 'Unavailable'},
          classroom: '-',
          type: 'unavailable' as 'unavailable',
          description: ua.reason || "Marked as unavailable",
        };
      });
    
    return [...dayEvents, ...unavailabilitiesForDay].sort((a, b) => {
      if (a.type === 'unavailable' && b.type !== 'unavailable') return -1;
      if (a.type !== 'unavailable' && b.type === 'unavailable') return 1;
      return a.startTime.localeCompare(b.startTime);
    });

  }, [selectedDate, filters, allEvents, allUnavailabilities, isLoading]);

  const isEventConflict = (event: ClassEvent): boolean => {
    if (event.type !== 'class' && event.type !== 'special') return false;
    const teacherUnavailability = getUnavailabilityForDateFromState(event.date, event.teacher.id);
    return !!teacherUnavailability;
  };
  
  const calendarModifiers = useMemo(() => {
    const eventDays: Date[] = allEvents.map(e => e.date);
    const unavailableDays: Date[] = allUnavailabilities
      .filter(ua => ua.isUnavailable && (!filters.teacherId || ua.teacherId === filters.teacherId))
      .map(ua => ua.date);
    
    const conflictDays: Date[] = allEvents
      .filter(event => isEventConflict(event) && (!filters.teacherId || event.teacher.id === filters.teacherId))
      .map(e => e.date);

    return {
      event: eventDays,
      unavailable: unavailableDays,
      conflict: filters.highlightConflicts ? conflictDays : [],
    };
  }, [filters.teacherId, filters.highlightConflicts, allEvents, allUnavailabilities, isEventConflict]);

  const calendarModifierStyles = {
    event: { 
      borderRadius: '0.5rem', 
      border: '2px solid hsl(var(--primary))',
      fontWeight: 'bold',
    },
    unavailable: { 
      backgroundColor: 'hsl(var(--muted))', 
      color: 'hsl(var(--muted-foreground))',
      borderRadius: '0.5rem', 
      opacity: 0.7
    },
    conflict: { 
      backgroundColor: 'hsl(var(--destructive))', 
      color: 'hsl(var(--destructive-foreground))',
      borderRadius: '0.5rem', 
      fontWeight: 'bold',
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-2">
        <Card className="mb-6 shadow-sm"><CardContent className="p-4"><Skeleton className="h-10 w-1/2" /></CardContent></Card>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 shadow-lg">
            <CardHeader><CardTitle><Skeleton className="h-8 w-3/4" /></CardTitle><CardDescription><Skeleton className="h-4 w-1/2" /></CardDescription></CardHeader>
            <CardContent className="flex justify-center p-0 sm:p-2 md:p-4"><Skeleton className="h-[290px] w-[260px] rounded-md" /></CardContent>
          </Card>
          <Card className="lg:col-span-2 shadow-lg">
            <CardHeader><CardTitle><Skeleton className="h-8 w-3/4" /></CardTitle><CardDescription><Skeleton className="h-4 w-1/2" /></CardDescription></CardHeader>
            <Separator className="mb-4"/>
            <CardContent><Skeleton className="h-[calc(100vh-20rem)] w-full" /></CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-2">
      <FilterControls filters={filters} onFiltersChange={setFilters} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Calendar</CardTitle>
            <CardDescription>Select a date to view events.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center p-0 sm:p-2 md:p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md"
              modifiers={calendarModifiers}
              modifiersStyles={calendarModifierStyles}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">
              Events for {selectedDate ? format(selectedDate, 'PPP') : 'No date selected'}
            </CardTitle>
            <CardDescription>
              Scheduled classes and teacher unavailabilities for the selected day.
            </CardDescription>
          </CardHeader>
          <Separator className="mb-4"/>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-20rem)] pr-3">
              {dailyEventsAndUnavailabilities.length > 0 ? (
                dailyEventsAndUnavailabilities.map(event => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    isConflict={filters.highlightConflicts && isEventConflict(event)}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-10">
                  <CalendarCheck2 className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">No events scheduled for this day.</p>
                  <p className="text-sm text-muted-foreground">Try selecting another date or adjusting filters.</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
