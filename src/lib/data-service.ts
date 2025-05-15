
'use server'; // Recommended for server-side data fetching or mutations if applicable

import type { Language, Teacher, ClassEvent, Availability, SimulatedUser } from '@/types';
import {
  mockLanguages,
  mockTeachers,
  mockEvents,
  mockUnavailabilities, // This is the mutable array from mock-data
  addUnavailability as addMockUnavailability,
  removeUnavailability as removeMockUnavailability,
  getUnavailabilitiesForTeacher as getMockUnavailabilitiesForTeacher,
  getUnavailabilityForDate as getMockUnavailabilityForDate,
  simulatedUser,
} from './mock-data';

/**
 * NOTE TO DEVELOPER:
 * This data service currently uses mock data. To integrate with a real database:
 * 1. Replace the imports from './mock-data' with your database client/ORM setup.
 * 2. Update the function bodies to fetch/mutate data from/to your database.
 * 3. Ensure the function signatures (parameters and return types) remain consistent
 *    to minimize changes in the components that use these services.
 */

export async function getLanguagesService(): Promise<Language[]> {
  // In a real scenario, this would fetch from a 'languages' table.
  return Promise.resolve([...mockLanguages]); // Return a copy
}

export async function getTeachersService(): Promise<Teacher[]> {
  // In a real scenario, this would fetch from a 'teachers' table.
  return Promise.resolve([...mockTeachers]); // Return a copy
}

export async function getEventsService(): Promise<ClassEvent[]> {
  // In a real scenario, this would fetch from an 'events' table.
  return Promise.resolve([...mockEvents]); // Return a copy
}

export async function getUnavailabilitiesService(): Promise<Availability[]> {
  // In a real scenario, this would fetch from an 'unavailabilities' table.
  // We return a direct reference here to reflect mutations in the mock data for the demo.
  // For a real DB, you'd fetch fresh data.
  return Promise.resolve(mockUnavailabilities);
}

export async function addAvailabilityEntryService(entry: Omit<Availability, 'id'>): Promise<Availability> {
  // In a real scenario, this would insert into an 'unavailabilities' table.
  const newEntry = addMockUnavailability(entry); // This mutates mockUnavailabilities in mock-data.ts
  return Promise.resolve(newEntry);
}

export async function removeAvailabilityEntryService(date: Date, teacherId: string): Promise<void> {
  // In a real scenario, this would delete from an 'unavailabilities' table.
  removeMockUnavailability(date, teacherId); // This mutates mockUnavailabilities
  return Promise.resolve();
}

export async function getTeacherUnavailabilitiesService(teacherId: string): Promise<Availability[]> {
  // In a real scenario, this would query 'unavailabilities' table by teacherId.
  return Promise.resolve(getMockUnavailabilitiesForTeacher(teacherId));
}

export async function getUnavailabilityByDateAndTeacherService(date: Date, teacherId: string): Promise<Availability | undefined> {
  // In a real scenario, this would query 'unavailabilities' table.
  return Promise.resolve(getMockUnavailabilityForDate(date, teacherId));
}

export async function getCurrentSimulatedUserService(): Promise<SimulatedUser> {
  // In a real scenario, this would fetch current user data.
  return Promise.resolve(simulatedUser);
}
