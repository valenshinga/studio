
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
import { mockStudents, addStudent, updateStudent, deleteStudent, getStudents } from '@/lib/mock-data';
import type { Student } from '@/types';
import { PlusCircle, Edit, Trash2, Eye, GraduationCap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  const fetchStudents = useCallback(() => {
    setStudents(getStudents());
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleSaveStudent = async (data: { name: string; email: string }, studentId?: string) => {
    if (studentId) {
      updateStudent(studentId, data);
    } else {
      addStudent(data);
    }
    fetchStudents(); // Refrescar la lista
  };

  const handleDeleteStudent = (studentId: string) => {
    const success = deleteStudent(studentId);
    if (success) {
      toast({ title: "Alumno Eliminado", description: "El alumno ha sido eliminado exitosamente." });
      fetchStudents();
    } else {
      toast({ title: "Error", description: "No se pudo eliminar el alumno.", variant: "destructive" });
    }
  };

  const openEditDialog = (student: Student) => {
    setEditingStudent(student);
    setIsFormOpen(true);
  };

  const openNewDialog = () => {
    setEditingStudent(null);
    setIsFormOpen(true);
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
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
          student={editingStudent}
          onSave={handleSaveStudent}
          isOpen={isFormOpen}
          onOpenChange={setIsFormOpen}
        >
          <Button onClick={openNewDialog}>
            <PlusCircle className="mr-2 h-4 w-4" /> Agregar Alumno
          </Button>
        </StudentFormDialog>
      </div>

      <div className="rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right w-[200px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild className="mr-1">
                      <Link href={`/students/${student.id}`}>
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
                          <AlertDialogAction onClick={() => handleDeleteStudent(student.id)} className="bg-destructive hover:bg-destructive/90">
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
                <TableCell colSpan={3} className="h-24 text-center">
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
