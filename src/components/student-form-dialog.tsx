
"use client";

import React from 'react';
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
import { useToast } from '@/hooks/use-toast';
import type { Student } from '@/types';

const studentFormSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }).max(50, { message: "El nombre no puede exceder los 50 caracteres." }),
  email: z.string().email({ message: "Por favor, introduce un correo electrónico válido." }),
});

type StudentFormValues = z.infer<typeof studentFormSchema>;

interface StudentFormDialogProps {
  student?: Student | null; // For editing
  onSave: (data: StudentFormValues, studentId?: string) => Promise<void>;
  children: React.ReactNode; // Trigger button
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function StudentFormDialog({ student, onSave, children, isOpen, onOpenChange }: StudentFormDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [internalOpen, setInternalOpen] = React.useState(false);

  const open = isOpen !== undefined ? isOpen : internalOpen;
  const setOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen;

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      name: student?.name || '',
      email: student?.email || '',
    },
  });

  React.useEffect(() => {
    if (student && open) {
      form.reset({
        name: student.name,
        email: student.email,
      });
    } else if (!student && open) {
      form.reset({
        name: '',
        email: '',
      });
    }
  }, [student, form, open]);

  const onSubmit = async (data: StudentFormValues) => {
    setIsSubmitting(true);
    try {
      await onSave(data, student?.id);
      toast({
        title: student ? "Alumno Actualizado" : "Alumno Creado",
        description: `El alumno ${data.name} ha sido ${student ? 'actualizado' : 'creado'} exitosamente.`,
      });
      setOpen(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: `Hubo un problema al ${student ? 'actualizar' : 'crear'} el alumno.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{student ? 'Editar Alumno' : 'Agregar Nuevo Alumno'}</DialogTitle>
          <DialogDescription>
            {student ? 'Modifica los detalles del alumno.' : 'Completa los campos para agregar un nuevo alumno.'}
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
                    <Input placeholder="Ej: Juan Pérez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Ej: juan.perez@example.com" {...field} />
                  </FormControl>
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
                {isSubmitting ? (student ? 'Guardando Cambios...' : 'Creando Alumno...') : (student ? 'Guardar Cambios' : 'Crear Alumno')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
