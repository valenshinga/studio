export interface Lenguaje {
  id: string;
  nombre: string;
}

export interface Docente {
  id: string;
  nombre: string;
  apellido: string;
  dni?: string | undefined;
  email?: string | undefined;
  telefono?: string | undefined;
  lenguajes: Lenguaje[];
}

export interface Alumno {
  id: string;
  nombre: string;
  apellido: string;
  email?: string | undefined;
  telefono?: string | undefined;
  dni?: string | undefined;
}

export type EstadoClase = 'programada' | 'cancelada' | 'pospuesta';

export interface Clase {
  id: string;
  titulo?: string; // Auto-generated if not provided, e.g. "Lenguaje with Docente"
  fecha: Date;
  horaInicio: string; // e.g., "09:00"
  horaFin: string; // e.g., "10:30"
  docente: Docente; // For display and existing structure
  lenguaje: Lenguaje; // For display and existing structure
  docenteId: string; // For form binding
  lenguajeId: string; // For form binding
  linkReunion: string; // Display name, can be same as classroomId if simple
  estado: EstadoClase; // 'unavailable' is handled separately
  description?: string;
  alumnosIds?: string[]; // Array of student IDs enrolled in this class
}

export interface Disponibilidad {
  id:string;
  docenteId: string;
  fecha: Date;
  estaDisponible: boolean;
  motivo?: string; // Optional reason for unavailability
}

export interface SimulatedUser {
  id: string; // Matches a teacher ID
  name: string;
  role: 'teacher';
}