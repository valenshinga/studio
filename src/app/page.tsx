"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { EventCard } from "@/components/event-card";
import { FilterControls, type CalendarFilters } from "@/components/filter-controls";
import { mockEvents, mockUnavailabilities, getUnavailabilityForDate } from '@/lib/mock-data';
import type { ClassEvent, Availability } from '@/types';
import { format, isSameDay } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CalendarCheck2 } from 'lucide-react';

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [filters, setFilters] = useState<CalendarFilters>({
    highlightConflicts: true,
  });

  // Effect to ensure selectedDate always has a value on mount if undefined
  useEffect(() => {
    if (!selectedDate) {
      setSelectedDate(new Date());
    }
  }, [selectedDate]);


  const dailyEventsAndUnavailabilities = useMemo(() => {
    if (!selectedDate) return [];

    const dayEvents = mockEvents.filter(event =>
      isSameDay(event.date, selectedDate) &&
      (!filters.teacherId || event.teacher.id === filters.teacherId) &&
      (!filters.languageId || event.language.id === filters.languageId)
    );

    const unavailabilitiesForDay: ClassEvent[] = mockUnavailabilities
      .filter(ua => isSameDay(ua.date, selectedDate) && ua.isUnavailable)
      .filter(ua => !filters.teacherId || ua.teacherId === filters.teacherId)
      .map(ua => {
        const teacher = mockEvents.find(e => e.teacher.id === ua.teacherId)?.teacher; // Try to find teacher info
        return {
          id: ua.id,
          date: ua.date,
          startTime: "All Day",
          endTime: "",
          teacher: teacher || {id: ua.teacherId, name: `Teacher ${ua.teacherId.slice(-2)}`, languagesTaught:[]}, // Fallback teacher
          language: {id: 'unavail', name: 'Unavailable'}, // Placeholder language
          classroom: '-',
          type: 'unavailable' as 'unavailable',
          description: ua.reason || "Marked as unavailable",
        };
      });
    
    // Combine and sort
    return [...dayEvents, ...unavailabilitiesForDay].sort((a, b) => {
      if (a.type === 'unavailable' && b.type !== 'unavailable') return -1; // Unavailabilities first
      if (a.type !== 'unavailable' && b.type === 'unavailable') return 1;
      return a.startTime.localeCompare(b.startTime);
    });

  }, [selectedDate, filters]);

  const isEventConflict = (event: ClassEvent): boolean => {
    if (event.type !== 'class' && event.type !== 'special') return false;
    const teacherUnavailability = getUnavailabilityForDate(event.date, event.teacher.id);
    return !!teacherUnavailability;
  };
  
  const calendarModifiers = useMemo(() => {
    const eventDays: Date[] = mockEvents.map(e => e.date);
    const unavailableDays: Date[] = mockUnavailabilities
      .filter(ua => ua.isUnavailable && (!filters.teacherId || ua.teacherId === filters.teacherId))
      .map(ua => ua.date);
    
    const conflictDays: Date[] = mockEvents
      .filter(event => isEventConflict(event) && (!filters.teacherId || event.teacher.id === filters.teacherId))
      .map(e => e.date);

    return {
      event: eventDays,
      unavailable: unavailableDays,
      conflict: filters.highlightConflicts ? conflictDays : [],
    };
  }, [filters.teacherId, filters.highlightConflicts]);

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
            <ScrollArea className="h-[calc(100vh-20rem)] pr-3"> {/* Adjust height as needed */}
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
