
"use client";

import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
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
import type { DisponibilidadSemanal, Docente, Lenguaje } from '@/types/types';
import { getLenguajes, updateDisponibilidad } from '@/lib/data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge, Edit, Trash2 } from 'lucide-react';
import { AlertDialog } from '@radix-ui/react-alert-dialog';
import { AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DisponibilidadSemanalFormDialog } from './disponibilidadSemanal-form-dialog';

const docenteFormSchema = z.object({
  nombre: z.string().min(2, { message: "El Nombre debe tener al menos 2 caracteres." }).max(50, { message: "El Nombre no puede exceder los 50 caracteres." }),
  apellido: z.string().min(2, { message: "El Apellido debe tener al menos 2 caracteres." }).max(50, { message: "El Apellido no puede exceder los 50 caracteres." }),
  dni: z.string().length(8, { message: "El DNI debe poseer 8 caracteres." }),
  email: z.string().email({ message: "El Correo electrónico debe tener un formato válido." }),
  telefono: z.string().optional(),
  lenguajesIds: z.array(z.string()),
  disponibilidades: z.array(z.object({
    disponibilidadId: z.string().nullable().optional(),
    diaSemana: z.string(),
    horaDesde: z.string(),
    horaHasta: z.string()
  }))
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
  const [openDisponibilidad, setOpenDisponibilidad] = useState(false);
  const [disponibilidadEditada, setDisponibilidadEditada] = useState<DisponibilidadSemanal | null>(null);
  const [indexDisponibilidad, setIndexDisponibilidad] = useState<number | null>(null)

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
      disponibilidades: [],
    },
  });
  const { control, setValue, reset } = form;
  const { fields: disponibilidadFields, append, remove, update, replace } =
    useFieldArray({ control, name: 'disponibilidades' });
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
        reset({
          nombre: docente.nombre,
          apellido: docente.apellido,
          dni: docente.dni ?? "",
          email: docente.email ?? "",
          telefono: docente.telefono ?? "",
          lenguajesIds: docente.lenguajes.map(lang => lang.id),
          disponibilidades: docente.disponibilidades?.map(disp => ({
            disponibilidadId: disp.id,
            diaSemana: disp.diaSemana,
            horaDesde: disp.horaDesde,
            horaHasta: disp.horaHasta
          })) ?? []
        });
        // setDisponibilidades(docente.disponibilidades ?? [])
      } else {
        reset({
          nombre: '',
          apellido: '',
          dni: "",
          email: "",
          telefono: "",
          lenguajesIds: [],
          disponibilidades: []
        });
        replace([])
      }
    }
  }, [docente, open, reset, replace]);

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[880px] max-h-[90vh] overflow-y-auto">
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
                    <Input {...field} value={field.value || ''} />
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
                              <TableCell className='text-center'>
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
                                {/* <Button onClick={() => remove(index)}>Eliminar</Button> */}
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
                {isSubmitting ? (docente ? 'Guardando Cambios...' : 'Creando Docente...') : (docente ? 'Guardar Cambios' : 'Crear Docente')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}