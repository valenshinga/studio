
'use server'; // Recommended for server-side data fetching or mutations if applicable

import type { Lenguaje, Docente, Clase, Disponibilidad, SimulatedUser } from '@/types/types';
import postgres from 'postgres';
const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function getLenguajes(): Promise<Lenguaje[]> {
  try {
    const data = await sql<Lenguaje[]>`SELECT * FROM lenguajes`;
    return data;
  } catch (error) {
    console.error('Database Error:', error);
    return [];
  }
}

export async function getDocentes(): Promise<Docente[]> {
  try {
    const data = await sql<Docente[]>`SELECT * FROM docentes`;

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    return [];
  }
}

export async function getClases(): Promise<Clase[]> {
  try {
    const data = await sql<Clase[]>`SELECT * FROM clases`;

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    return [];
  }
}

export async function getDisponibilidades(): Promise<Disponibilidad[]> {
  try {
    const data = await sql<Disponibilidad[]>`SELECT * FROM disponibilidades`;

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    return [];
  }
}

type DocenteCreate = {
  id?: string | undefined;
  nombre: string;
  apellido: string;
  dni?: string | undefined;
  email?: string | undefined;
  telefono?: string | undefined;
  lenguajesIds: string[];
}

export async function crearDocente(entry: Omit<DocenteCreate, 'id'>){
  // console.log("holaaa", entry)
  try{
    await sql`
        INSERT INTO docentes 
        (nombre, apellido, dni, email, telefono)
        VALUES 
            (${entry.nombre}, 
              ${entry.apellido}, 
              ${entry.dni ?? ""}, 
              ${entry.email ?? ""}, 
              ${entry.telefono ?? ""}
            )
        ;
    `;
  } catch(e){
    return {
      message: 'ERROR: Error creando Docente.',
    };
  }
}

export async function updateDocente(entry: Docente){
  // console.log("holaaa", entry)
  try{
    await sql`
        UPDATE docentes 
        SET nombre=${entry.nombre}, 
            apellido=${entry.apellido}, 
            dni=${entry.dni ?? ""}, 
            email=${entry.email ?? ""}, 
            telefono=${entry.telefono ?? ""}
        WHERE id=${entry.id};
    `;
  } catch(e){
    return {
      message: 'ERROR: Error actualizando Docente.',
    };
  }
}

export async function deleteDocente(docenteId: string){
  // console.log("holaaa", entry)
  try{
    await sql`
        DELETE FROM docentes 
        WHERE id=${docenteId};
    `;
    return true;
  } catch(e){
    return false;
  }
}

// export async function agregarDisponibilidad(entry: Omit<Disponibilidad, 'id'>): Promise<Disponibilidad> {
//   // In a real scenario, this would insert into an 'unavailabilities' table.
//   const newEntry = addMockUnavailability(entry); // This mutates mockUnavailabilities in mock-data.ts
//   return Promise.resolve(newEntry);
// }

// export async function removeAvailabilityEntryService(date: Date, teacherId: string): Promise<void> {
//   // In a real scenario, this would delete from an 'unavailabilities' table.
//   removeMockUnavailability(date, teacherId); // This mutates mockUnavailabilities
//   return Promise.resolve();
// }

// export async function getTeacherUnavailabilitiesService(teacherId: string): Promise<Disponibilidad[]> {
//   // In a real scenario, this would query 'unavailabilities' table by teacherId.
//   return Promise.resolve(getMockUnavailabilitiesForTeacher(teacherId));
// }

// export async function getUnavailabilityByDateAndTeacherService(date: Date, teacherId: string): Promise<Disponibilidad | undefined> {
//   // In a real scenario, this would query 'unavailabilities' table.
//   return Promise.resolve(getMockUnavailabilityForDate(date, teacherId));
// }

// export async function getCurrentSimulatedUserService(): Promise<SimulatedUser> {
//   // In a real scenario, this would fetch current user data.
//   return Promise.resolve(simulatedUser);
// }