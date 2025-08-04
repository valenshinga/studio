
"use client";

import React, { useEffect, useState } from 'react';
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
import type { Docente, Lenguaje } from '@/types/types';
import { getLenguajes } from '@/lib/data';

const docenteFormSchema = z.object({
  nombre: z.string().min(2, { message: "El Nombre debe tener al menos 2 caracteres." }).max(50, { message: "El Nombre no puede exceder los 50 caracteres." }),
  apellido: z.string().min(2, { message: "El Apellido debe tener al menos 2 caracteres." }).max(50, { message: "El Apellido no puede exceder los 50 caracteres." }),
  dni: z.string().length(8, { message: "El DNI debe poseer 8 caracteres." }),
  email: z.string().email({message: "El Correo electrónico debe tener un formato válido."}),
  telefono: z.string(),
  lenguajesIds: z.array(z.string()).min(1, { message: "Debe seleccionar al menos un idioma." }),
});

type docenteFormValues = z.infer<typeof docenteFormSchema>;

interface TeacherFormDialogProps {
  docente?: Docente | null;
  onSave: (data: docenteFormValues, teacherId?: string) => Promise<void>;
  children: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function TeacherFormDialog({ docente, onSave, children, isOpen, onOpenChange }: TeacherFormDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);
  const [lenguajes, setLenguajes] = useState<Lenguaje[]>([]);

  const open = isOpen !== undefined ? isOpen : internalOpen;
  const setOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen;

  const form = useForm<docenteFormValues>({
    resolver: zodResolver(docenteFormSchema),
    defaultValues: {
      nombre: '',
      apellido: '',
      dni: '',
      email: '',
      telefono: '',
      lenguajesIds: [],
    },
  });

  useEffect(() => {
      const fetchData = async () => {
        const lenguajesData = await getLenguajes();
        setLenguajes(lenguajesData)
      };
      fetchData();
    }, []);

  useEffect(() => {
    if (open) {
      if (docente) {
        form.reset({
          nombre: docente.nombre,
          apellido: docente.apellido,
          dni: docente.dni || "",
          email: docente.email || "",
          telefono: docente.telefono || "",
          lenguajesIds: docente.lenguajes.map(lang => lang.id)
        });
      } else {
        form.reset({
          nombre: '',
          apellido: '',
          dni: "",
          email: "",
          telefono: "",
          lenguajesIds: []
        });
      }
    }
  }, [docente, form, open]);

  const onSubmit = async (data: docenteFormValues) => {
    setIsSubmitting(true);
    try {
      await onSave(data, docente?.id);
      toast({
        title: docente ? "Docente Actualizado" : "Docente Creado",
        description: `El Docente ${data.nombre} ha sido ${docente ? 'actualizado' : 'creado'} exitosamente.`,
      });
      setOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Hubo un problema al ${docente ? 'actualizar' : 'crear'} el Docente.`,
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
          <DialogTitle>{docente ? 'Editar Docente' : 'Agregar Nuevo Docente'}</DialogTitle>
          <DialogDescription>
            {docente ? 'Modifica los detalles del Docente.' : 'Completa los campos para agregar un nuevo Docente.'}
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
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lenguajesIds"
              render={() => (
                <FormItem>
                  <FormLabel>Idiomas que Enseña</FormLabel>
                  <div className="space-y-2 rounded-md border p-4 max-h-48 overflow-y-auto">
                    {lenguajes 
                    ? (lenguajes.map((lenguaje) => (
                      <FormField
                        key={lenguaje.id}
                        control={form.control}
                        name="lenguajesIds"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={lenguaje.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(lenguaje.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), lenguaje.id])
                                      : field.onChange(
                                          (field.value || []).filter(
                                            (value) => value !== lenguaje.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {lenguaje.nombre}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))) 
                    : ""
                    }
                  </div>
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
                {isSubmitting ? (docente ? 'Guardando Cambios...' : 'Creando Docente...') : (docente ? 'Guardar Cambios' : 'Crear Docente')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}