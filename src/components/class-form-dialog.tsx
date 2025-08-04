
"use client";

import React, { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import type { ClassEvent, Teacher, Language, Student } from '@/types/types';
import { mockTeachers, mockLanguages, mockStudents, getTeacherById } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { CalendarIcon, ClockIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const classFormSchema = z.object({
  title: z.string().optional(),
  date: z.date({ required_error: "La fecha es requerida." }),
  startTime: z.string().regex(timeRegex, "Formato HH:MM requerido."),
  endTime: z.string().regex(timeRegex, "Formato HH:MM requerido."),
  teacherId: z.string().min(1, "Debe seleccionar un profesor."),
  languageId: z.string().min(1, "Debe seleccionar un idioma."),
  classroomId: z.string().min(1, "El nombre del salón es requerido."),
  type: z.enum(['class', 'special'], { required_error: "El tipo de evento es requerido." }),
  description: z.string().optional(),
  studentIds: z.array(z.string()).optional(),
}).refine(data => {
  if (data.startTime && data.endTime) {
    return data.endTime > data.startTime;
  }
  return true;
}, {
  message: "La hora de fin debe ser posterior a la hora de inicio.",
  path: ["endTime"],
});

type ClassFormValues = z.infer<typeof classFormSchema>;

interface ClassFormDialogProps {
  classEvent?: ClassEvent | null;
  onSave: (data: ClassFormValues, classEventId?: string) => void;
  children: React.ReactNode; // Trigger button
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ClassFormDialog({ classEvent, onSave, children, isOpen, onOpenChange }: ClassFormDialogProps) {
  const { toast } = useToast();
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [selectedTeacher, setSelectedTeacher] = React.useState<Teacher | null>(null);

  const open = isOpen !== undefined ? isOpen : internalOpen;
  const setOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen;

  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      title: '',
      date: new Date(),
      startTime: '09:00',
      endTime: '10:00',
      teacherId: '',
      languageId: '',
      classroomId: '',
      type: 'class',
      description: '',
      studentIds: [],
    },
  });

  const watchedTeacherId = form.watch('teacherId');

  useEffect(() => {
    if (watchedTeacherId) {
      const teacher = getTeacherById(watchedTeacherId);
      setSelectedTeacher(teacher || null);
      // Reset language if current language is not taught by new teacher
      if (teacher && form.getValues('languageId') && !teacher.languagesTaught.some(l => l.id === form.getValues('languageId'))) {
        form.setValue('languageId', '');
      }
    } else {
      setSelectedTeacher(null);
    }
  }, [watchedTeacherId, form]);

  useEffect(() => {
    if (classEvent && open) {
      form.reset({
        title: classEvent.title || '',
        date: classEvent.date,
        startTime: classEvent.startTime,
        endTime: classEvent.endTime,
        teacherId: classEvent.teacherId,
        languageId: classEvent.languageId,
        classroomId: classEvent.classroomId, // Use classroomId here
        type: classEvent.type,
        description: classEvent.description || '',
        studentIds: classEvent.studentIds || [],
      });
      setSelectedTeacher(getTeacherById(classEvent.teacherId) || null);
    } else if (!classEvent && open) {
      form.reset({
        title: '',
        date: new Date(),
        startTime: '09:00',
        endTime: '10:00',
        teacherId: '',
        languageId: '',
        classroomId: '',
        type: 'class',
        description: '',
        studentIds: [],
      });
      setSelectedTeacher(null);
    }
  }, [classEvent, form, open]);

  const onSubmit = (data: ClassFormValues) => {
    try {
      onSave(data, classEvent?.id);
      toast({
        title: classEvent ? "Clase Actualizada" : "Clase Creada",
        description: `La clase ha sido ${classEvent ? 'actualizada' : 'creada'} exitosamente.`,
      });
      setOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Hubo un problema al ${classEvent ? 'actualizar' : 'crear'} la clase.`,
        variant: "destructive",
      });
    }
  };
  
  const availableLanguages = useMemo(() => {
    if (selectedTeacher) {
      return selectedTeacher.languagesTaught;
    }
    return mockLanguages; // Show all if no teacher selected, or handle differently
  }, [selectedTeacher]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg md:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{classEvent ? 'Editar Clase/Evento' : 'Crear Nueva Clase/Evento'}</DialogTitle>
          <DialogDescription>
            {classEvent ? 'Modifica los detalles de la clase o evento.' : 'Completa los campos para programar una nueva clase o evento.'}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow pr-6 -mr-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Clase de Conversación Avanzada" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: es })
                          ) : (
                            <span>Selecciona una fecha</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1))}
                        initialFocus
                        locale={es}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora de Inicio</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora de Fin</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="teacherId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profesor(a)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un profesor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mockTeachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="languageId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Idioma</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={!watchedTeacherId}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={watchedTeacherId ? "Selecciona un idioma" : "Selecciona un profesor primero"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableLanguages.map((language) => (
                        <SelectItem key={language.id} value={language.id}>
                          {language.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!watchedTeacherId && <FormDescription>Debes seleccionar un profesor para ver los idiomas disponibles.</FormDescription>}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="classroomId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salón/Ubicación</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Salón 101, En línea" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Evento</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un tipo de evento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="class">Clase Regular</SelectItem>
                      <SelectItem value="special">Evento Especial</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Añade notas o detalles adicionales sobre la clase/evento." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="studentIds"
              render={() => (
                <FormItem>
                  <FormLabel>Alumnos Inscritos</FormLabel>
                    <FormDescription>Selecciona los alumnos que participarán en esta clase.</FormDescription>
                    <ScrollArea className="h-40 rounded-md border p-4">
                    {mockStudents.map((student) => (
                      <FormField
                        key={student.id}
                        control={form.control}
                        name="studentIds"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={student.id}
                              className="flex flex-row items-center space-x-3 space-y-0 mb-2"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(student.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), student.id])
                                      : field.onChange(
                                          (field.value || []).filter(
                                            (value) => value !== student.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal text-sm">
                                {student.name}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                    </ScrollArea>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit">
                {classEvent ? 'Guardar Cambios' : 'Crear Clase/Evento'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
