"use client";

import React, { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
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
import type { Alumno, DisponibilidadSemanal } from '@/types/types';
import { DisponibilidadSemanalFormDialog } from './disponibilidadSemanal-form-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { deleteDisponibilidad, updateDisponibilidad } from '@/lib/data';

const AlumnoFormSchema = z.object({
  nombre: z.string().min(2, { message: "El Nombre debe tener al menos 2 caracteres." }).max(50, { message: "El Nombre no puede exceder los 50 caracteres." }),
  apellido: z.string().min(2, { message: "El Apellido debe tener al menos 2 caracteres." }).max(50, { message: "El Apellido no puede exceder los 50 caracteres." }),
  dni: z.string().length(8, { message: "El DNI debe poseer 8 caracteres." }),
  email: z.string().email({message: "El Correo electrónico debe tener un formato válido."}),
  telefono: z.string(),
  disponibilidades: z.array(z.object({
    disponibilidadId: z.string().nullable().optional(),
    diaSemana: z.string(),
    horaDesde: z.string(),
    horaHasta: z.string()
  }))
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
  const [openDisponibilidad, setOpenDisponibilidad] = useState(false);
  const [disponibilidadEditada, setDisponibilidadEditada] = useState<DisponibilidadSemanal | null>(null);
  const [indexDisponibilidad, setIndexDisponibilidad] = useState<number | null>(null)

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
      disponibilidades: [],
    },
  });
  const { control, setValue, reset } = form;
  const { fields: disponibilidadFields, append, remove, update, replace } =
    useFieldArray({ control, name: 'disponibilidades' });

  React.useEffect(() => {
    if (student && open) {
      form.reset({
        nombre: student.nombre,
        apellido: student.apellido,
        telefono: student.telefono,
        email: student.email,
        dni: student.dni,
        disponibilidades: student.disponibilidades?.map(disp => ({
            disponibilidadId: disp.id,
            diaSemana: disp.diaSemana,
            horaDesde: disp.horaDesde,
            horaHasta: disp.horaHasta
          })) ?? []
      });
    } else if (!student && open) {
      form.reset({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        dni: '',
        disponibilidades: [],
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
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || `Hubo un problema al ${student ? 'actualizar' : 'crear'} el Alumno.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSaveDisponibilidad = async (
    data: { disponibilidadId?: string; diaSemana: string; horaDesde: string; horaHasta: string },
    index?: number
  ) => {
    const hasValidId = !!(data.disponibilidadId && data.disponibilidadId.trim() !== "");
    const isEditing = index !== undefined && index !== null;
  
    if (!isEditing) {
      // 🆕 Caso 1: Crear desde cero
      const item: DisponibilidadSemanal = {
        diaSemana: data.diaSemana,
        horaDesde: data.horaDesde,
        horaHasta: data.horaHasta,
      };
      append(item);
    } 
    else if (isEditing && !hasValidId) {
      
      // ✏️ Caso 2: Editar un elemento sin disponibilidadId
      const item: DisponibilidadSemanal = {
        diaSemana: data.diaSemana,
        horaDesde: data.horaDesde,
        horaHasta: data.horaHasta,
      };
      update(index, item);
    } 
    else if (isEditing && hasValidId) {

      // 🔄 Caso 3: Editar un elemento con disponibilidadId
      const item: DisponibilidadSemanal = {
        id: data.disponibilidadId,
        diaSemana: data.diaSemana,
        horaDesde: data.horaDesde,
        horaHasta: data.horaHasta,
      };
      await updateDisponibilidad(data.disponibilidadId!, data);
      update(index, item);
    }
  
    setOpenDisponibilidad(false);
    setIndexDisponibilidad(null);
  };
  
    const openNewDialog = () => {
      setOpenDisponibilidad(true);
      setDisponibilidadEditada(null);
    };
  
    const openEditDialog = (disponibilidad: {disponibilidadId?:string, diaSemana: string, horaDesde: string, horaHasta: string}, index: number) => {
      setOpenDisponibilidad(true);
      setDisponibilidadEditada(disponibilidad);
      setIndexDisponibilidad(index)
    };
  
    const handleDeleteDisponibilidad = async (
      disponibilidad: {disponibilidadId?:string | null, diaSemana: string, horaDesde: string, horaHasta: string}, 
      index: number
    ) => { 
      const borrandoConId = !!(disponibilidad.disponibilidadId && disponibilidad.disponibilidadId.trim() !== "");
      const borrandoSinId = index !== undefined && index !== null;
      if (borrandoConId && disponibilidad.disponibilidadId != undefined) {
        // ✏️ Caso 2: Editar un elemento sin disponibilidadId
        await deleteDisponibilidad(disponibilidad.disponibilidadId).then((response)=>{
          if (response.error){
            toast({
              title: "Error",
              description: `Error eliminando la disponibilidad.`,
            });
          }else{
            remove(index);
            toast({
              title: "Disponibilidad eliminada",
              description: `La disponibilidad se ha eliminado exitosamente.`,
            });
          }
        }
        )
      } 
      else if (borrandoSinId && !borrandoConId) {
        remove(index);
        toast({
            title: "Disponibilidad eliminada",
            description: `La disponibilidad se ha eliminado exitosamente.`,
          });
      }
    }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
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
            <FormField
              control={form.control}
              name="disponibilidades"
              render={() => (
                <FormItem>
                  <FormLabel className='flex justify-between items-center'>
                    Disponibilidad semanal
                    <DisponibilidadSemanalFormDialog
                      disponibilidad={disponibilidadEditada ?? null}
                      onSave={onSaveDisponibilidad}
                      isOpen={openDisponibilidad}
                      onOpenChange={(isOpenDisponibilidad) => {
                        setOpenDisponibilidad(isOpenDisponibilidad)
                        if (!isOpenDisponibilidad){ 
                          setDisponibilidadEditada(null)
                          setIndexDisponibilidad(null)
                        }
                      }}
                      index={indexDisponibilidad ?? undefined}
                    >
                      <Button type="button" variant="default" className='text-[1em]' onClick={openNewDialog}>
                        Agregar
                      </Button>
                    </DisponibilidadSemanalFormDialog>
                  </FormLabel>
                  <div className="rounded-lg border shadow-sm overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className='text-center'>Dia</TableHead>
                          <TableHead className='text-center'>Desde</TableHead>
                          <TableHead className='text-center'>Hasta</TableHead>
                          <TableHead className='text-center'>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {disponibilidadFields.length > 0 ? (
                          disponibilidadFields.map((d, index) => (
                            <TableRow key={d.disponibilidadId ?? d.id}>
                              <TableCell className='text-center'>{d.diaSemana}</TableCell>
                              <TableCell className='text-center'>{d.horaDesde}</TableCell>
                              <TableCell className='text-center'>{d.horaHasta}</TableCell>
                              <TableCell className='text-center flex justify-center gap-2'>
                                <Button
                                  type='button'
                                  onClick={() => openEditDialog(
                                    {
                                      disponibilidadId: d.disponibilidadId ?? undefined,
                                      diaSemana: d.diaSemana,
                                      horaDesde: d.horaDesde,
                                      horaHasta: d.horaHasta
                                    },
                                    index
                                  )}
                                >
                                  Editar
                                </Button>
                                <Button 
                                  type='button' 
                                  onClick={() => handleDeleteDisponibilidad(d, index)}
                                >
                                  Eliminar
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow key={null}>
                            <TableCell colSpan={4} className="h-24 text-center">
                              No se cargaron horarios disponibles.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
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
