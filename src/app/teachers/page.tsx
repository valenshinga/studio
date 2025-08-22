
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableSkeleton,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { TeacherFormDialog } from '@/components/teacher-form-dialog';
import type { Docente, Lenguaje } from '@/types/types';
import { PlusCircle, Edit, Trash2, Users, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { crearDocente, deleteDocente, getDocentes, updateDocente } from '@/lib/data';

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Docente[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [docenteEditado, setDocenteEditado] = useState<Docente | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const fetchDocentes = useCallback(async () => {
    setIsLoading(true);
    getDocentes().then((data) => {
      setTeachers(data);
      setIsLoading(false);
    }).catch();
  }, []);

  useEffect(() => {
    fetchDocentes()
  }, []);

  const handleGuardarDocente = async (data: { nombre: string; apellido: string; dni: string; email: string; telefono?: string | undefined; lenguajesIds: string[], disponibilidades: {diaSemana: string, horaDesde: string, horaHasta: string}[] }, id?: string) => {
    if (id) {
      await updateDocente(id, data);
    } else {
      await crearDocente(data);
    }
    await fetchDocentes();
  };

  const handleBorrarDocente = async (teacherId: string) => {
    const success = await deleteDocente(teacherId);
    if (success) {
      toast({ title: "Docente Eliminado", description: "El Docente ha sido eliminado exitosamente." });
      fetchDocentes();
    } else {
      toast({ 
        title: "Error al Eliminar", 
        description: "No se pudo eliminar el Docente. Es posible que esté asignado a clases existentes.", 
        variant: "destructive" 
      });
    }
  };

  const openEditDialog = (teacher: Docente) => {
    setDocenteEditado(teacher);
    setIsFormOpen(true);
  };

  const openNewDialog = () => {
    setDocenteEditado(null);
    setIsFormOpen(true);
  };

  const filteredTeachers = teachers.filter(docente =>
    docente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    docente.lenguajes.some(lenguaje => lenguaje.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center bg-primary/10 text-primary p-3 rounded-full mb-4">
           <Users className="h-10 w-10" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Gestión de Docentes</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Administra la información de los Docentes y los idiomas que enseñan.
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <Input
          type="text"
          placeholder="Buscar Docentes o idiomas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:max-w-xs text-base"
        />
        <TeacherFormDialog
          docente={docenteEditado}
          onSave={handleGuardarDocente}
          isOpen={isFormOpen}
          onOpenChange={(isOpen) => {
            setIsFormOpen(isOpen);
            if (!isOpen) {
              setDocenteEditado(null);
              fetchDocentes();
            }
          }}
        >
          <Button onClick={openNewDialog} className='text-[1em]'>
            <PlusCircle className="mr-2 h-4 w-4" /> Agregar Docente
          </Button>
        </TeacherFormDialog>
      </div>

      <div className="rounded-lg border shadow-sm overflow-hidden">
          {isLoading ? (
              <TableSkeleton rows={0} columns={7}></TableSkeleton>
            ) 
          : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Apellido</TableHead>
              <TableHead>DNI</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Idiomas que Enseña</TableHead>
              <TableHead className="text-right w-[150px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTeachers.length > 0 ? (
              filteredTeachers.map((docente) => (
                <TableRow key={docente.id}>
                  <TableCell className="font-medium">{docente.nombre}</TableCell>
                  <TableCell className="font-medium">{docente.apellido}</TableCell>
                  <TableCell className="font-medium">{docente.dni}</TableCell>
                  <TableCell className="font-medium">{docente.email}</TableCell>
                  <TableCell className="font-medium">{docente.telefono ?? "No cargado"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {docente.lenguajes.map(lang => {
                        return (
                          <Badge key={lang.id} variant="secondary" className="flex items-center gap-1 text-xs py-0.5 px-1.5" style={{ backgroundColor: 'hsl(var(--foreground))20', borderColor: 'hsl(var(--foreground))', color: 'hsl(var(--foreground))' }}>
                            {lang.nombre}
                          </Badge>
                        );
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(docente)} className="mr-1">
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Eliminar</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente al Docente.
                            Si el Docente tiene clases asignadas, no podrá ser eliminado.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleBorrarDocente(docente.id)} className="bg-destructive hover:bg-destructive/90">
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No se encontraron Docentes.
                </TableCell>
              </TableRow>
            )
          }
          </TableBody>
        </Table>
        )}
      </div>
       {filteredTeachers.length === 0 && searchTerm && (
         <p className="text-center text-muted-foreground mt-6">
           Ningún Docente coincide con "{searchTerm}".
         </p>
       )}
    </div>
  );
}
