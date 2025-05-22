
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { EventCard } from "@/components/event-card";
import { FilterControls, type CalendarFilters } from "@/components/filter-controls";
import { mockEvents, mockUnavailabilities, getUnavailabilityForDate } from '@/lib/mock-data';
import type { ClassEvent, Availability, Teacher } from '@/types';
import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CalendarCheck2 } from 'lucide-react';

// Directly use mock data
const allEvents: ClassEvent[] = mockEvents;
const allUnavailabilities: Availability[] = mockUnavailabilities;

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [filters, setFilters] = useState<CalendarFilters>({
    highlightConflicts: true,
  });

  useEffect(() => {
    if (!selectedDate) {
      setSelectedDate(new Date());
    }
  }, [selectedDate]);
  
  const dailyEventsAndUnavailabilities = useMemo(() => {
    if (!selectedDate) return [];

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
        const teacherInvolved = allEvents.find(e => e.teacher.id === ua.teacherId)?.teacher || 
                                allEvents.find(e => e.id.includes(ua.teacherId))?.teacher; 
        
        const teacherData: Teacher = teacherInvolved || {
            id: ua.teacherId, 
            name: `Profesor ${ua.teacherId.substring(ua.teacherId.length - 2)}`, 
            languagesTaught:[]
        };

        return {
          id: ua.id,
          date: ua.date,
          startTime: "Todo el día",
          endTime: "",
          teacher: teacherData,
          language: {id: 'unavail', name: 'No disponible'},
          classroom: '-',
          type: 'unavailable' as 'unavailable',
          description: ua.reason || "Marcado como no disponible",
        };
      });
    
    return [...dayEvents, ...unavailabilitiesForDay].sort((a, b) => {
      if (a.type === 'unavailable' && b.type !== 'unavailable') return -1;
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
            <CardTitle className="text-2xl">Calendario</CardTitle>
            <CardDescription>Selecciona una fecha para ver los eventos.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center p-0 sm:p-2 md:p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md"
              modifiers={calendarModifiers}
              modifiersStyles={calendarModifierStyles}
              locale={es}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">
              Eventos para {selectedDate ? format(selectedDate, 'PPP', { locale: es }) : 'ninguna fecha seleccionada'}
            </CardTitle>
            <CardDescription>
              Clases programadas e indisponibilidades de profesores para el día seleccionado.
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
                  <p className="text-lg font-medium text-muted-foreground">No hay eventos programados para este día.</p>
                  <p className="text-sm text-muted-foreground">Intenta seleccionar otra fecha o ajustar los filtros.</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
