
import type { LucideIcon } from 'lucide-react';

export interface Language {
  id: string;
  name: string;
  icon?: LucideIcon; // Or string for SVG path / emoji
  color?: string; // Optional: for visual distinction
}

export interface Teacher {
  id: string;
  name: string;
  avatarUrl?: string;
  languagesTaught: Language[];
}

export interface Student {
  id: string;
  name: string;
  email: string;
}

export type EventType = 'class' | 'unavailable' | 'special';

export interface ClassEvent {
  id: string;
  title?: string; // Auto-generated if not provided, e.g. "Language with Teacher"
  date: Date;
  startTime: string; // e.g., "09:00"
  endTime: string; // e.g., "10:30"
  teacher: Teacher;
  language: Language;
  classroom: string;
  type: EventType;
  description?: string;
  studentIds?: string[]; // Array of student IDs enrolled in this class
}

export interface Availability {
  id:string;
  teacherId: string;
  date: Date;
  isUnavailable: boolean;
  reason?: string; // Optional reason for unavailability
}

export interface SimulatedUser {
  id: string; // Matches a teacher ID
  name: string;
  role: 'teacher';
}

