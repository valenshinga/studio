
"use client";

import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  simulatedUser,
  mockTeachers,
  getUnavailabilitiesForTeacher,
  addUnavailability,
  removeUnavailability,
} from '@/lib/mock-data';
import type { Availability, SimulatedUser, Teacher } from '@/types';
import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const allTeachersData: Teacher[] = mockTeachers;

export function AvailabilityForm() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [reason, setReason] = useState('');
  const [currentUser, setCurrentUser] = useState<SimulatedUser | null>(simulatedUser);
  const [allTeachers, setAllTeachers] = useState<Teacher[]>(allTeachersData);
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadUnavailabilities = (teacherId: string) => {
    const unavailabilities = getUnavailabilitiesForTeacher(teacherId);
    const dates = unavailabilities.map(ua => ua.date);
    setUnavailableDates(dates);
  };
  
  useEffect(() => {
    if (currentUser?.id) {
      loadUnavailabilities(currentUser.id);
    }
  }, [currentUser?.id]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date && currentUser) {
      const existingUnavailability = unavailableDates.find(
        d => isSameDay(d, date)
      );
      setReason(''); 
    } else {
      setReason('');
    }
  };

  const handleSetAvailability = (available: boolean) => {
    if (!selectedDate || !currentUser) {
      toast({ title: "No se seleccionó fecha/usuario", description: "Por favor, selecciona una fecha y asegúrate de que el usuario esté cargado.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      if (!available) { 
        addUnavailability({ teacherId: currentUser.id, date: selectedDate, isUnavailable: true, reason });
        toast({ title: "Fecha marcada como no disponible", description: `${format(selectedDate, 'PPP', { locale: es })} ahora no está disponible.`, variant: "default" });
      } else { 
        removeUnavailability(selectedDate, currentUser.id);
        toast({ title: "Fecha marcada como disponible", description: `${format(selectedDate, 'PPP', { locale: es })} ahora está disponible.`, variant: "default" });
      }
      loadUnavailabilities(currentUser.id); 
      setReason(''); 
    } catch (error) {
      console.error("Error al establecer disponibilidad:", error);
      toast({ title: "Error", description: "No se pudo actualizar la disponibilidad.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSelectedDateUnavailable = selectedDate && unavailableDates.some(d => isSameDay(d, selectedDate));

  if (!currentUser) {
    return (
        <Card className="w-full max-w-2xl mx-auto shadow-xl">
            <CardHeader><CardTitle>Cargando Usuario...</CardTitle></CardHeader>
            <CardContent><p>Por favor, espera mientras se cargan los datos del usuario.</p></CardContent>
        </Card>
    );
  }


  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle>Gestiona Tu Disponibilidad</CardTitle>
        <CardDescription>
          Selecciona un profesor y fechas para marcarlas como no disponibles. Esto se reflejará en el calendario principal.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="teacher-select">Seleccionar Profesor</Label>
          <Select
            value={currentUser.id}
            onValueChange={(teacherId) => {
              const teacher = allTeachers.find(t => t.id === teacherId);
              if (teacher) {
                setCurrentUser({ id: teacher.id, name: teacher.name, role: 'teacher' });
              }
            }}
          >
            <SelectTrigger id="teacher-select">
              <SelectValue placeholder="Selecciona un profesor" />
            </SelectTrigger>
            <SelectContent>
              {allTeachers.map(teacher => (
                <SelectItem key={teacher.id} value={teacher.id}>{teacher.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground mt-1">Actualmente gestionando disponibilidad para: {currentUser.name}</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            className="rounded-md border self-center md:self-start"
            disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1)) || isSubmitting}
            modifiers={{ unavailable: unavailableDates }}
            modifiersStyles={{
              unavailable: { backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))', opacity: 0.8 },
              selected: { backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }
            }}
            locale={es}
          />
          <div className="flex-1 space-y-4 w-full">
            {selectedDate && (
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Fecha Seleccionada: {format(selectedDate, "PPP", { locale: es })}
                </h3>
                {isSelectedDateUnavailable ? (
                  <div className="flex items-center text-accent mb-2 p-2 rounded-md bg-accent/10">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    <span>Esta fecha está actualmente marcada como no disponible.</span>
                  </div>
                ) : (
                  <div className="flex items-center text-green-600 mb-2 p-2 rounded-md bg-green-500/10">
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    <span>Esta fecha está actualmente marcada como disponible.</span>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="reason">Motivo de indisponibilidad (opcional)</Label>
                  <Textarea 
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Ej: Cita médica" 
                    disabled={isSelectedDateUnavailable || isSubmitting}
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={() => handleSetAvailability(false)} disabled={isSelectedDateUnavailable || isSubmitting} className="w-full">
                    {isSubmitting ? 'Guardando...' : 'Marcar como No Disponible'}
                  </Button>
                  <Button onClick={() => handleSetAvailability(true)} variant="outline" disabled={!isSelectedDateUnavailable || isSubmitting} className="w-full">
                    {isSubmitting ? 'Guardando...' : 'Marcar como Disponible'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
