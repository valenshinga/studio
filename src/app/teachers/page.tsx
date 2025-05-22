
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
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
import { TeacherFormDialog } from '@/components/teacher-form-dialog';
import { mockLanguages, getTeachers, addTeacher, updateTeacher, deleteTeacher } from '@/lib/mock-data';
import type { Teacher, Language } from '@/types';
import { PlusCircle, Edit, Trash2, Users, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  const fetchTeachers = useCallback(() => {
    setTeachers(getTeachers());
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const handleSaveTeacher = async (data: { name: string; avatarUrl?: string; languageIds: string[] }, teacherId?: string) => {
    if (teacherId) {
      updateTeacher(teacherId, data);
    } else {
      addTeacher(data);
    }
    fetchTeachers();
  };

  const handleDeleteTeacher = (teacherId: string) => {
    const success = deleteTeacher(teacherId);
    if (success) {
      toast({ title: "Profesor Eliminado", description: "El profesor ha sido eliminado exitosamente." });
      fetchTeachers();
    } else {
      toast({ 
        title: "Error al Eliminar", 
        description: "No se pudo eliminar el profesor. Es posible que esté asignado a clases existentes.", 
        variant: "destructive" 
      });
    }
  };

  const openEditDialog = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setIsFormOpen(true);
  };

  const openNewDialog = () => {
    setEditingTeacher(null);
    setIsFormOpen(true);
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.languagesTaught.some(lang => lang.name.toLowerCase().includes(searchTerm.toLowerCase()))
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
        <h1 className="text-4xl font-bold tracking-tight">Gestión de Profesores</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Administra la información de los profesores y los idiomas que enseñan.
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <Input
          type="text"
          placeholder="Buscar profesores o idiomas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:max-w-xs text-base"
        />
        <TeacherFormDialog
          teacher={editingTeacher}
          onSave={handleSaveTeacher}
          isOpen={isFormOpen}
          onOpenChange={(isOpen) => {
            setIsFormOpen(isOpen);
            if (!isOpen) setEditingTeacher(null);
          }}
        >
          <Button onClick={openNewDialog}>
            <PlusCircle className="mr-2 h-4 w-4" /> Agregar Profesor
          </Button>
        </TeacherFormDialog>
      </div>

      <div className="rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Avatar</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Idiomas que Enseña</TableHead>
              <TableHead className="text-right w-[150px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTeachers.length > 0 ? (
              filteredTeachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell>
                    <Avatar>
                      <AvatarImage src={teacher.avatarUrl} alt={teacher.name} data-ai-hint="person avatar" />
                      <AvatarFallback>{getInitials(teacher.name)}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{teacher.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {teacher.languagesTaught.map(lang => {
                        const LanguageIcon = lang.icon || BookOpen;
                        return (
                          <Badge key={lang.id} variant="secondary" className="flex items-center gap-1 text-xs py-0.5 px-1.5" style={{ backgroundColor: lang.color ? `${lang.color}20` : undefined, borderColor: lang.color, color: lang.color ? undefined : 'hsl(var(--foreground))' }}>
                            <LanguageIcon className="h-3 w-3" style={{ color: lang.color }}/>
                            {lang.name}
                          </Badge>
                        );
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(teacher)} className="mr-1">
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
                            Esta acción no se puede deshacer. Esto eliminará permanentemente al profesor.
                            Si el profesor tiene clases asignadas, no podrá ser eliminado.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteTeacher(teacher.id)} className="bg-destructive hover:bg-destructive/90">
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
                <TableCell colSpan={4} className="h-24 text-center">
                  No se encontraron profesores.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
       {filteredTeachers.length === 0 && searchTerm && (
         <p className="text-center text-muted-foreground mt-6">
           Ningún profesor coincide con "{searchTerm}".
         </p>
       )}
    </div>
  );
}
