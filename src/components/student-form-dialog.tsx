
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
import type { Alumno } from '@/types/types';

const AlumnoFormSchema = z.object({
  nombre: z.string().min(2, { message: "El Nombre debe tener al menos 2 caracteres." }).max(50, { message: "El Nombre no puede exceder los 50 caracteres." }),
  apellido: z.string().min(2, { message: "El Apellido debe tener al menos 2 caracteres." }).max(50, { message: "El Apellido no puede exceder los 50 caracteres." }),
  dni: z.string().length(8, { message: "El DNI debe poseer 8 caracteres." }),
  email: z.string().email({message: "El Correo electrónico debe tener un formato válido."}),
  telefono: z.string(),
});

type AlumnoFormValues = z.infer<typeof AlumnoFormSchema>;

interface AlumnoFormDialogProps {
  student?: Alumno | null; // For editing
  onSave: (data: AlumnoFormValues, studentId?: string) => Promise<void>;
  children: React.ReactNode; // Trigger button
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function StudentFormDialog({ student, onSave, children, isOpen, onOpenChange }: AlumnoFormDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [internalOpen, setInternalOpen] = React.useState(false);

  const open = isOpen !== undefined ? isOpen : internalOpen;
  const setOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen;

  const form = useForm<AlumnoFormValues>({
    resolver: zodResolver(AlumnoFormSchema),
    defaultValues: {
      nombre: '',
      apellido: '',
      dni: '',
      email: '',
      telefono: '',
    },
  });

  React.useEffect(() => {
    if (student && open) {
      form.reset({
        nombre: student.nombre,
        apellido: student.apellido,
        telefono: student.telefono,
        email: student.email,
        dni: student.dni,
      });
    } else if (!student && open) {
      form.reset({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        dni: '',
      });
    }
  }, [student, form, open]);

  const onSubmit = async (data: AlumnoFormValues) => {
    setIsSubmitting(true);
    try {
      await onSave(data, student?.id);
      toast({
        title: student ? "Alumno Actualizado" : "Alumno Creado",
        description: `El Alumno ${data.apellido}, ${data.nombre} ha sido ${student ? 'actualizado' : 'creado'} exitosamente.`,
      });
      setOpen(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: `Hubo un problema al ${student ? 'actualizar' : 'crear'} el Alumno.`,
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
            {student ? 'Modifica los detalles del Alumno.' : 'Completa los campos para agregar un nuevo Alumno.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="apellido"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apellido</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dni"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>DNI</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="telefono"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting} className='text-[1em]'>
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting} className='text-[1em]'>
                {isSubmitting ? (student ? 'Guardando Cambios...' : 'Creando Alumno...') : (student ? 'Guardar Cambios' : 'Crear Alumno')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
