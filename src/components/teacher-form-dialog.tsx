
"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import type { Teacher, Language } from '@/types';
import { mockLanguages } from '@/lib/mock-data'; // To get available languages

const teacherFormSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }).max(50, { message: "El nombre no puede exceder los 50 caracteres." }),
  avatarUrl: z.string().url({ message: "Por favor, introduce una URL válida para el avatar." }).optional().or(z.literal('')),
  languageIds: z.array(z.string()).min(1, { message: "Debe seleccionar al menos un idioma." }),
});

type TeacherFormValues = z.infer<typeof teacherFormSchema>;

interface TeacherFormDialogProps {
  teacher?: Teacher | null;
  onSave: (data: TeacherFormValues, teacherId?: string) => Promise<void>;
  children: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function TeacherFormDialog({ teacher, onSave, children, isOpen, onOpenChange }: TeacherFormDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [internalOpen, setInternalOpen] = React.useState(false);

  const open = isOpen !== undefined ? isOpen : internalOpen;
  const setOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen;

  const form = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: {
      name: '',
      avatarUrl: '',
      languageIds: [],
    },
  });

  useEffect(() => {
    if (open) {
      if (teacher) {
        form.reset({
          name: teacher.name,
          avatarUrl: teacher.avatarUrl || '',
          languageIds: teacher.languagesTaught.map(lang => lang.id),
        });
      } else {
        form.reset({
          name: '',
          avatarUrl: '',
          languageIds: [],
        });
      }
    }
  }, [teacher, form, open]);

  const onSubmit = async (data: TeacherFormValues) => {
    setIsSubmitting(true);
    try {
      await onSave(data, teacher?.id);
      toast({
        title: teacher ? "Profesor Actualizado" : "Profesor Creado",
        description: `El profesor ${data.name} ha sido ${teacher ? 'actualizado' : 'creado'} exitosamente.`,
      });
      setOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Hubo un problema al ${teacher ? 'actualizar' : 'crear'} el profesor.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{teacher ? 'Editar Profesor' : 'Agregar Nuevo Profesor'}</DialogTitle>
          <DialogDescription>
            {teacher ? 'Modifica los detalles del profesor.' : 'Completa los campos para agregar un nuevo profesor.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Prof. Albert Einstein" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL del Avatar (Opcional)</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://ejemplo.com/avatar.png" {...field} />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground pt-1">Si se deja vacío, se usará un placeholder con las iniciales.</p>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="languageIds"
              render={() => (
                <FormItem>
                  <FormLabel>Idiomas que Enseña</FormLabel>
                  <div className="space-y-2 rounded-md border p-4 max-h-48 overflow-y-auto">
                    {mockLanguages.map((language) => (
                      <FormField
                        key={language.id}
                        control={form.control}
                        name="languageIds"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={language.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(language.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), language.id])
                                      : field.onChange(
                                          (field.value || []).filter(
                                            (value) => value !== language.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {language.name}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (teacher ? 'Guardando Cambios...' : 'Creando Profesor...') : (teacher ? 'Guardar Cambios' : 'Crear Profesor')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
