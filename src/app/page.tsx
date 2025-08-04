
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
import type { Clase, Disponibilidad, Docente } from '@/types/types';
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
import { getClases, getDisponibilidades } from '@/lib/data';


export default function CalendarPage() {
  const [clases, setClases] = useState<Clase[]>([]);
  const [indisponibilidades, setIndisponibilidades] = useState<Disponibilidad[]>([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | undefined>(new Date());
  const [filtros, setFiltros] = useState<CalendarFilters>({
    highlightConflicts: true,
  });
  const [formAbierto, setFormAbierto] = useState(false);
  const [claseEditada, setClaseEditada] = useState<Clase | null>(null);
  const [claseBorrada, setClaseBorrada] = useState<string | null>(null);
  const { toast } = useToast();
  const refrescarClases = useCallback(async () => {
    const clases = await getClases();
    const disponibilidades = await getDisponibilidades();
    setClases([...clases]); 
    setIndisponibilidades([...disponibilidades]);
  }, []);

  useEffect(() => {
    if (!fechaSeleccionada) {
      setFechaSeleccionada(new Date());
    }
  }, [fechaSeleccionada]);
  
  const dailyEventsAndUnavailabilities = useMemo(() => {
    if (!fechaSeleccionada) return [];

    const dayEvents = clases.filter(event =>
      isSameDay(event.fecha, fechaSeleccionada) &&
      (!filtros.docenteId || event.docente.id === filtros.docenteId) &&
      (!filtros.lenguajeId || event.lenguaje.id === filtros.lenguajeId)
    );

    const unavailabilitiesForDay: Clase[] = indisponibilidades
      .filter(ua => 
        isSameDay(ua.fecha, fechaSeleccionada) && 
        ua.estaDisponible &&
        (!filtros.docenteId || ua.docenteId === filtros.docenteId)
      )
      .map(ua => {
        const teacherInvolved = clases.find(e => e.docente.id === ua.docenteId)?.docente || 
                                clases.find(e => e.id.includes(ua.docenteId))?.docente; 
        
        const teacherData: Docente = teacherInvolved || {
            id: ua.docenteId, 
            nombre: `Profesor ${ua.docenteId.substring(ua.docenteId.length - 2)}`, 
            apellido: `Profesor ${ua.docenteId.substring(ua.docenteId.length - 2)}`, 
            lenguajes:[]
        };

        return {
          id: ua.id,
          fecha: ua.fecha,
          horaInicio: "Todo el día",
          horaFin: "",
          docente: teacherData,
          lenguaje: {id: 'unavail', name: 'No disponible'},
          docenteId: teacherData.id,
          lenguajeId: 'unavail',
          linkReunion: "",
          estado: 'cancelada' as 'cancelada', // This is correct for display but Clase expects 'class'|'special'
          description: ua.motivo || "Marcado como no disponible",
        } as unknown as Clase; // Cast because 'unavailable' type is special
      });
    
    return [...dayEvents, ...unavailabilitiesForDay].sort((a, b) => {
      // @ts-ignore
      if (a.estado === 'cancelada' && b.estado !== 'cancelada') return -1;
      // @ts-ignore
      if (a.estado !== 'cancelada' && b.estado === 'cancelada') return 1;
      return a.horaInicio.localeCompare(b.horaInicio);
    });

  }, [fechaSeleccionada, filtros, clases, indisponibilidades]);

  const isEventConflict = (event: Clase): boolean => {
    if (event.estado !== 'programada' && event.estado !== 'cancelada') return false;
    const teacherUnavailability = getUnavailabilityForDate(event.fecha, event.docente.id);
    return !!teacherUnavailability;
  };
  
  const calendarModifiers = useMemo(() => {
    const eventDays: Date[] = clases.map(e => e.fecha);
    const unavailableDays: Date[] = indisponibilidades
      .filter(ua => ua.estaDisponible && (!filtros.docenteId || ua.docenteId === filtros.docenteId))
      .map(ua => ua.fecha);
    
    const conflictDays: Date[] = clases
      .filter(event => isEventConflict(event) && (!filtros.docenteId || event.docente.id === filtros.docenteId))
      .map(e => e.fecha);

    return {
      event: eventDays,
      unavailable: unavailableDays,
      conflict: filtros.highlightConflicts ? conflictDays : [],
    };
  }, [filtros.docenteId, filtros.highlightConflicts, clases, indisponibilidades]);

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

  const abrirFormClase = () => {
    setClaseEditada(null);
    setFormAbierto(true);
  };

  const handleEditClass = (classEvent: Clase) => {
    setClaseEditada(classEvent);
    setFormAbierto(true);
  };

  const handleGuardarClase = (data: ClassEventFormData, classEventId?: string) => {
    if (classEventId) {
      updateClassEvent(classEventId, data);
    } else {
      addClassEvent(data);
    }
    refrescarClases();
  };

  const confirmDeleteClass = (eventId: string) => {
    setClaseBorrada(eventId);
  };

  const handleDeleteClase = () => {
    if (claseBorrada) {
      const success = deleteClassEvent(claseBorrada);
      if (success) {
        toast({ title: "Clase Eliminada", description: "La clase ha sido eliminada exitosamente." });
        refrescarClases();
      } else {
        toast({ title: "Error", description: "No se pudo eliminar la clase.", variant: "destructive" });
      }
      setClaseBorrada(null);
    }
  };

  return (
    <div className="container mx-auto py-2 ">
      <div className="flex justify-between items-center mb-4">
        <FilterControls filters={filtros} onFiltersChange={setFiltros} />
        <ClassFormDialog
          classEvent={claseEditada}
          onSave={handleGuardarClase}
          isOpen={formAbierto}
          onOpenChange={setFormAbierto}
        >
          <Button onClick={abrirFormClase} className="ml-4 text-[1em]">
            <PlusCircle className="mr-2 h-4 w-4" /> Crear Nueva Clase
          </Button>
        </ClassFormDialog>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Calendario</CardTitle>
            <CardDescription>Selecciona una fecha para ver los eventos.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center p-0 sm:p-2 md:p-4 w-full h-full">
            <Calendar
              mode="single"
              selected={fechaSeleccionada}
              onSelect={setFechaSeleccionada}
              className="rounded-md"
              modifiers={calendarModifiers}
              modifiersStyles={calendarModifierStyles}
              locale={es}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">
              Eventos para {fechaSeleccionada ? format(fechaSeleccionada, 'PPP', { locale: es }) : 'ninguna fecha seleccionada'}
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
                    isConflict={filtros.highlightConflicts && isEventConflict(event)}
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
      {claseBorrada && (
        <AlertDialog open={!!claseBorrada} onOpenChange={() => setClaseBorrada(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro de eliminar esta clase?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Esto eliminará permanentemente la clase del calendario.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setClaseBorrada(null)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteClase} className="bg-destructive hover:bg-destructive/90">
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
