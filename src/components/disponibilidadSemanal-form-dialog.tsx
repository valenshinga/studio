
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
import type { DisponibilidadSemanal, Docente, Lenguaje } from '@/types/types';
import { getLenguajes } from '@/lib/data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge, Edit, Trash2 } from 'lucide-react';
import { AlertDialog } from '@radix-ui/react-alert-dialog';
import { AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from './ui/select';

const disponibilidadFormSchema = z.object({
    diaSemana: z.string(),
    horaDesde: z.string(z.date()),
    horaHasta: z.string(z.date()),
});

type disponibilidadFormValues = z.infer<typeof disponibilidadFormSchema>;

interface DisponibilidadSemanalFormDialogProps {
    disponibilidad: {disponibilidadId?:string | null,diaSemana:string,horaDesde:string,horaHasta:string} | null;
    onSave: (data: disponibilidadFormValues, index?:number) => void;
    children: React.ReactNode;
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    index?: number;
}

export function DisponibilidadSemanalFormDialog({ disponibilidad, onSave, children, isOpen, onOpenChange, index }: DisponibilidadSemanalFormDialogProps) {
    console.log("INDEX RECIBIDO AL INICIO", index)
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [internalOpen, setInternalOpen] = useState(false);
    const [disponibilidadInterna, setDisponibilidadInterna] = useState<{
                                                                        disponibilidadId?: string | null;
                                                                        diaSemana: string;
                                                                        horaDesde: string;
                                                                        horaHasta: string;
                                                                        }>({disponibilidadId:"",diaSemana:"",horaDesde:"",horaHasta:""});

    const open = isOpen !== undefined ? isOpen : internalOpen;
    const setOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen;

    useEffect(() => {
    if (!open) return; // Solo cuando está abierto
        if (disponibilidad) {
            setDisponibilidadInterna(disponibilidad);
        } else {
            setDisponibilidadInterna({disponibilidadId:"", diaSemana: "", horaDesde: "", horaHasta: "" }); 
        }
    }, [open]);

    const handleClose = () => {
        setOpen(false)
    }
    
    const handleGuardar = () => {
        setIsSubmitting(true);
        try {
            console.log("INDEX AL GUARRDAR", index)
            onSave(disponibilidadInterna, index ?? undefined)
            setOpen(false);
            toast({
                title: disponibilidad ? "Disponibilidad Actualizada" : "Disponibilidad Creada",
                description: `La Disponibilidad ha sido ${disponibilidad ? 'actualizada' : 'creada'} exitosamente.`,
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || `Hubo un problema al ${disponibilidad ? 'actualizar' : 'crear'} el Docente.`,
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[880px] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{disponibilidad ? 'Editar Disponibilidad' : 'Agregar Nueva Disponibilidad'}</DialogTitle>
                    <DialogDescription>
                        {disponibilidad ? 'Modifica los detalles del Docente.' : 'Completa los campos para agregar un nuevo Docente.'}
                    </DialogDescription>
                </DialogHeader>
                <SelectGroup>
                    <SelectLabel>
                        Dia de la semana
                    </SelectLabel>
                    <Select
                        value={disponibilidadInterna.diaSemana || ''}
                        onValueChange={(diaSemana) => {
                            setDisponibilidadInterna(prev => ({ ...prev, diaSemana: diaSemana }))
                        }}
                    >
                        <SelectTrigger id="diaSemana-select">
                            <SelectValue placeholder="Selecciona un día de la semana" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem key="lunes" value="lunes">Lunes</SelectItem>
                            <SelectItem key="martes" value="martes">Martes</SelectItem>
                            <SelectItem key="miércoles" value="miércoles">Miércoles</SelectItem>
                            <SelectItem key="jueves" value="jueves">Jueves</SelectItem>
                            <SelectItem key="viernes" value="viernes">Viernes</SelectItem>
                        </SelectContent>
                    </Select>
                </SelectGroup>
                <div className='flex gap-4 w-full'>
                    <div className='w-full'>
                        <label htmlFor="inputDesde">Hora desde</label>
                        <Input id='inputDesde' type='time' value={disponibilidadInterna.horaDesde || ''} onChange={(valor) => {setDisponibilidadInterna(prev=>({...prev, horaDesde:valor.target.value}))}} />
                    </div>
                    <div className='w-full'>
                        <label htmlFor="inputHasta">Hora hasta</label>
                        <Input id='inputHasta' type='time' value={disponibilidadInterna.horaHasta || ''} onChange={(valor) => {setDisponibilidadInterna(prev=>({...prev, horaHasta:valor.target.value}))}}/>
                    </div>
                </div>
                <div className='flex w-full justify-end gap-4'>
                    <Button onClick={handleClose} type="button" variant="outline" disabled={isSubmitting} className='text-[1em]'>
                        Cancelar
                    </Button>
                    <Button type="button" form="form-disponibilidad" disabled={isSubmitting} className='text-[1em]' onClick={handleGuardar}>
                        {isSubmitting ? (disponibilidad ? 'Guardando Cambios...' : 'Guardando Disponibilidad...') : (disponibilidad ? 'Guardar Cambios' : 'Agregar Disponibilidad')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}