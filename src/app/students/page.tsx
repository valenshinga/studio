
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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
import { StudentFormDialog } from '@/components/student-form-dialog';
import type { Alumno } from '@/types/types';
import { PlusCircle, Edit, Trash2, Eye, GraduationCap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { crearAlumno, deleteAlumno, getAlumnos, updateAlumno } from '@/lib/data';

export default function StudentsPage() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [alumnoEditado, setAlumnoEditado] = useState<Alumno | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  const fetchAlumnos = useCallback(async () => {
      const alumnosData = await getAlumnos();
      setAlumnos(alumnosData);
    }, []);  

  useEffect(() => {
    fetchAlumnos();
  }, [fetchAlumnos]);

  const handleGuardarAlumno = async (data: { nombre: string; apellido: string; dni: string; email: string; telefono: string; }, studentId?: string) => {
    if (studentId) {
      updateAlumno(studentId, data);
    } else {
      crearAlumno(data);
    }
    fetchAlumnos(); // Refrescar la lista
  };

  const handleBorrarAlumno = async (studentId: string) => {
    const success = await deleteAlumno(studentId);
    if (success) {
      toast({ title: "Alumno Eliminado", description: "El alumno ha sido eliminado exitosamente." });
      fetchAlumnos();
    } else {
      toast({ title: "Error", description: "No se pudo eliminar el alumno.", variant: "destructive" });
    }
  };

  const openEditDialog = (student: Alumno) => {
    setAlumnoEditado(student);
    setIsFormOpen(true);
  };

  const openNewDialog = () => {
    setAlumnoEditado(null);
    setIsFormOpen(true);
  };

  const filteredStudents = alumnos.filter(student =>
    student.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center bg-primary/10 text-primary p-3 rounded-full mb-4">
          <GraduationCap className="h-10 w-10" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Gestión de Alumnos</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Administra la información de los alumnos inscritos.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <Input
          type="text"
          placeholder="Buscar alumnos por nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:max-w-xs text-base"
        />
        <StudentFormDialog
          student={alumnoEditado}
          onSave={handleGuardarAlumno}
          isOpen={isFormOpen}
          onOpenChange={setIsFormOpen}
        >
          <Button onClick={openNewDialog} className='text-[1em]'>
            <PlusCircle className="mr-2 h-4 w-4" /> Agregar Alumno
          </Button>
        </StudentFormDialog>
      </div>

      <div className="rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Apellido</TableHead>
              <TableHead>DNI</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead className="text-right w-[200px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.nombre}</TableCell>
                  <TableCell className="font-medium">{student.apellido}</TableCell>
                  <TableCell className="font-medium">{student.dni}</TableCell>
                  <TableCell className="font-medium">{student.email}</TableCell>
                  <TableCell className="font-medium">{student.telefono}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild className="mr-1">
                      <Link href={`/alumnos/${student.id}`}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Ver Detalles</span>
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(student)} className="mr-1">
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
                            Esta acción no se puede deshacer. Esto eliminará permanentemente al alumno
                            y quitará su inscripción de todas las clases.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleBorrarAlumno(student.id)} className="bg-destructive hover:bg-destructive/90">
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
                  No se encontraron alumnos.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
       {filteredStudents.length === 0 && searchTerm && (
         <p className="text-center text-muted-foreground mt-6">
           Ningún alumno coincide con "{searchTerm}".
         </p>
       )}
    </div>
  );
}
