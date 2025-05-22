
"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { EventCard } from "@/components/event-card";
import { FilterControls, type CalendarFilters } from "@/components/filter-controls";
import { 
  mockEvents, 
  mockUnavailabilities, 
  getUnavailabilityForDate,
  addClassEvent,
  updateClassEvent,
  deleteClassEvent,
  type ClassEventFormData
} from '@/lib/mock-data';
import type { ClassEvent, Availability, Teacher } from '@/types';
import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { CalendarCheck2, PlusCircle } from 'lucide-react';
import { ClassFormDialog } from '@/components/class-form-dialog';
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';


export default function CalendarPage() {
  const [events, setEvents] = useState<ClassEvent[]>(mockEvents);
  const [unavailabilities, setUnavailabilities] = useState<Availability[]>(mockUnavailabilities);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [filters, setFilters] = useState<CalendarFilters>({
    highlightConflicts: true,
  });
  const [isClassFormOpen, setIsClassFormOpen] = useState(false);
  const [editingClassEvent, setEditingClassEvent] = useState<ClassEvent | null>(null);
  const [deletingClassEventId, setDeletingClassEventId] = useState<string | null>(null);
  const { toast } = useToast();

  const refreshEvents = useCallback(() => {
    // In a real app, you'd re-fetch. Here, we just re-reference the potentially mutated mock array.
    setEvents([...mockEvents]); 
    setUnavailabilities([...mockUnavailabilities]);
  }, []);

  useEffect(() => {
    if (!selectedDate) {
      setSelectedDate(new Date());
    }
  }, [selectedDate]);
  
  const dailyEventsAndUnavailabilities = useMemo(() => {
    if (!selectedDate) return [];

    const dayEvents = events.filter(event =>
      isSameDay(event.date, selectedDate) &&
      (!filters.teacherId || event.teacher.id === filters.teacherId) &&
      (!filters.languageId || event.language.id === filters.languageId)
    );

    const unavailabilitiesForDay: ClassEvent[] = unavailabilities
      .filter(ua => 
        isSameDay(ua.date, selectedDate) && 
        ua.isUnavailable &&
        (!filters.teacherId || ua.teacherId === filters.teacherId)
      )
      .map(ua => {
        const teacherInvolved = events.find(e => e.teacher.id === ua.teacherId)?.teacher || 
                                events.find(e => e.id.includes(ua.teacherId))?.teacher; 
        
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
          teacherId: teacherData.id,
          languageId: 'unavail',
          classroomId: '-',
          classroom: '-',
          type: 'unavailable' as 'unavailable', // This is correct for display but ClassEvent expects 'class'|'special'
          description: ua.reason || "Marcado como no disponible",
        } as unknown as ClassEvent; // Cast because 'unavailable' type is special
      });
    
    return [...dayEvents, ...unavailabilitiesForDay].sort((a, b) => {
      // @ts-ignore
      if (a.type === 'unavailable' && b.type !== 'unavailable') return -1;
      // @ts-ignore
      if (a.type !== 'unavailable' && b.type === 'unavailable') return 1;
      return a.startTime.localeCompare(b.startTime);
    });

  }, [selectedDate, filters, events, unavailabilities]);

  const isEventConflict = (event: ClassEvent): boolean => {
    if (event.type !== 'class' && event.type !== 'special') return false;
    const teacherUnavailability = getUnavailabilityForDate(event.date, event.teacher.id);
    return !!teacherUnavailability;
  };
  
  const calendarModifiers = useMemo(() => {
    const eventDays: Date[] = events.map(e => e.date);
    const unavailableDays: Date[] = unavailabilities
      .filter(ua => ua.isUnavailable && (!filters.teacherId || ua.teacherId === filters.teacherId))
      .map(ua => ua.date);
    
    const conflictDays: Date[] = events
      .filter(event => isEventConflict(event) && (!filters.teacherId || event.teacher.id === filters.teacherId))
      .map(e => e.date);

    return {
      event: eventDays,
      unavailable: unavailableDays,
      conflict: filters.highlightConflicts ? conflictDays : [],
    };
  }, [filters.teacherId, filters.highlightConflicts, events, unavailabilities]);

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

  const handleOpenNewClassForm = () => {
    setEditingClassEvent(null);
    setIsClassFormOpen(true);
  };

  const handleEditClass = (classEvent: ClassEvent) => {
    setEditingClassEvent(classEvent);
    setIsClassFormOpen(true);
  };

  const handleSaveClass = (data: ClassEventFormData, classEventId?: string) => {
    if (classEventId) {
      updateClassEvent(classEventId, data);
    } else {
      addClassEvent(data);
    }
    refreshEvents();
  };

  const confirmDeleteClass = (eventId: string) => {
    setDeletingClassEventId(eventId);
  };

  const executeDeleteClass = () => {
    if (deletingClassEventId) {
      const success = deleteClassEvent(deletingClassEventId);
      if (success) {
        toast({ title: "Clase Eliminada", description: "La clase ha sido eliminada exitosamente." });
        refreshEvents();
      } else {
        toast({ title: "Error", description: "No se pudo eliminar la clase.", variant: "destructive" });
      }
      setDeletingClassEventId(null);
    }
  };

  return (
    <div className="container mx-auto py-2">
      <div className="flex justify-between items-center mb-4">
        <FilterControls filters={filters} onFiltersChange={setFilters} />
        <ClassFormDialog
          classEvent={editingClassEvent}
          onSave={handleSaveClass}
          isOpen={isClassFormOpen}
          onOpenChange={setIsClassFormOpen}
        >
          <Button onClick={handleOpenNewClassForm} className="ml-4">
            <PlusCircle className="mr-2 h-4 w-4" /> Crear Nueva Clase
          </Button>
        </ClassFormDialog>
      </div>


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
            <ScrollArea className="h-[calc(100vh-22rem)] pr-3"> {/* Adjusted height */}
              {dailyEventsAndUnavailabilities.length > 0 ? (
                dailyEventsAndUnavailabilities.map(event => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    isConflict={filters.highlightConflicts && isEventConflict(event)}
                    onEdit={() => handleEditClass(event)}
                    onDelete={() => confirmDeleteClass(event.id)}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-10">
                  <CalendarCheck2 className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">No hay eventos programados para este día.</p>
                  <p className="text-sm text-muted-foreground">Intenta seleccionar otra fecha, ajustar los filtros o crear una nueva clase.</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      {deletingClassEventId && (
        <AlertDialog open={!!deletingClassEventId} onOpenChange={() => setDeletingClassEventId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro de eliminar esta clase?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Esto eliminará permanentemente la clase del calendario.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeletingClassEventId(null)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={executeDeleteClass} className="bg-destructive hover:bg-destructive/90">
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
