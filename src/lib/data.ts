
'use server'; // Recommended for server-side data fetching or mutations if applicable

import type { Lenguaje, Docente, Clase, Disponibilidad, SimulatedUser, Alumno } from '@/types/types';
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
  try{
    const data = await sql`
      SELECT 
      d.id,
      d.nombre,
      d.apellido,
      d.dni,
      d.email,
      d.telefono,
      ARRAY_AGG(
        CASE 
        WHEN l.id IS NOT NULL 
        THEN jsonb_build_object('id', l.id, 'nombre', l.nombre)
        ELSE NULL
        END
      ) FILTER (WHERE l.id IS NOT NULL) as lenguajes,
      ARRAY_AGG(
        CASE 
        WHEN ds.id IS NOT NULL 
        THEN jsonb_build_object('id', ds.id, 'diaSemana', ds.dia_semana, 'horaDesde', ds.hora_desde,'horaHasta', ds.hora_hasta)
        ELSE NULL
        END
    ) FILTER (WHERE ds.id IS NOT NULL) as disponibilidades
      FROM docentes d
      LEFT JOIN docentes_lenguajes dl ON d.id = dl.docente_id
      LEFT JOIN lenguajes l ON l.id = dl.lenguaje_id
      LEFT JOIN disponibilidad_semanal ds ON ds.docente_id = d.id
      GROUP BY d.id, d.nombre, d.apellido, d.dni, d.email, d.telefono;
    `;

    return data.map((docente): Docente => ({
      id: docente.id,
      nombre: docente.nombre,
      apellido: docente.apellido,
      dni: docente.dni,
      email: docente.email,
      telefono: docente.telefono,
      lenguajes: docente.lenguajes || [],
      disponibilidades: docente.disponibilidades || []
    }));
  } catch (error) {
    console.error('Database Error:', error);
    return [];
  }
}

export async function getDocente(docenteId:string): Promise<Docente[]> {
  try{
    const docente = await sql`
      SELECT 
      d.id,
      d.nombre,
      d.apellido,
      d.dni,
      d.email,
      d.telefono,
      ARRAY_AGG(
        CASE 
        WHEN l.id IS NOT NULL 
        THEN jsonb_build_object('id', l.id, 'nombre', l.nombre)
        ELSE NULL
        END
      ) FILTER (WHERE l.id IS NOT NULL) as lenguajes,
      ARRAY_AGG(
        CASE 
        WHEN ds.id IS NOT NULL 
        THEN jsonb_build_object('id', ds.id, 'diaSemana', ds.dia_semana, 'horaDesde', ds.hora_desde,'horaHasta', ds.hora_hasta)
        ELSE NULL
        END
    ) FILTER (WHERE ds.id IS NOT NULL) as disponibilidades
      FROM docentes d
      LEFT JOIN docentes_lenguajes dl ON d.id = dl.docente_id
      LEFT JOIN lenguajes l ON l.id = dl.lenguaje_id
      LEFT JOIN disponibilidad_semanal ds ON ds.docente_id = d.id
      WHERE d.id = ${docenteId}
      GROUP BY d.id, d.nombre, d.apellido, d.dni, d.email, d.telefono;
    `;

    return docente.map((docente): Docente => ({
      id: docente.id,
      nombre: docente.nombre,
      apellido: docente.apellido,
      dni: docente.dni,
      email: docente.email,
      telefono: docente.telefono,
      lenguajes: docente.lenguajes || [],
      disponibilidades: docente.disponibilidades || []
    }));
  } catch (error) {
    console.error('Database Error:', error);
    return [];
  }
}

export async function getAlumnos(): Promise<Alumno[]> {
  try {
    const data = await sql<Alumno[]>`SELECT * FROM alumnos`;

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
  nombre: string;
  apellido: string;
  dni?: string | undefined;
  email?: string | undefined;
  telefono?: string | undefined;
  lenguajesIds: string[];
  disponibilidades?: {diaSemana: string, horaDesde: string, horaHasta: string}[];
}

export async function crearDocente(entry: DocenteCreate){
  try{
    await sql.begin(async (transaction) => {
      const [newDocente] = await transaction`
        INSERT INTO docentes 
        (nombre, apellido, dni, email, telefono)
        VALUES 
            (${entry.nombre}, 
              ${entry.apellido}, 
              ${entry.dni ?? ""}, 
              ${entry.email ?? ""}, 
              ${entry.telefono ?? ""}
            )
          RETURNING id;
        `;
      entry.lenguajesIds.forEach(async element => {
        await transaction`
          INSERT INTO docentes_lenguajes 
          (docente_id, lenguaje_id)
          VALUES 
              (${newDocente.id},
                ${element} 
              )
          ;
        `;
      });
      entry.disponibilidades?.forEach(async element => {
        const horaDesdeSQL = `${element.horaDesde}:00`;
        const horaHastaSQL = `${element.horaHasta}:00`;
        await transaction`
          INSERT INTO disponibilidad_semanal 
          (docente_id, alumno_id, tipo_persona, dia_semana, hora_desde, hora_hasta)
          VALUES 
              (${newDocente.id},
                null,
                'docente',
                ${element.diaSemana},
                ${horaDesdeSQL}::time,
                ${horaHastaSQL}::time
              )
          ;
        `;
      });
    });
  } catch(e){
    console.log(e )
    return {
      message: 'ERROR: Error creando Docente.',
    };
  }
}

export async function updateDocente(docenteId: string, entry: DocenteCreate){
  // console.log("holaaa", entry)
  const docente = await getDocente(docenteId)

  try{
    await sql.begin(async (transaction) => {
      await transaction`
        UPDATE docentes 
        SET nombre=${entry.nombre}, 
            apellido=${entry.apellido}, 
            dni=${entry.dni ?? ""}, 
            email=${entry.email ?? ""}, 
            telefono=${entry.telefono ?? ""}
        WHERE id=${docenteId};
      `;
      entry.lenguajesIds.forEach(async element => {
        if (docente[0].lenguajes.find((lenguaje) => lenguaje.id == element)){
          return
        }
        await transaction`
          INSERT INTO docentes_lenguajes 
          (docente_id, lenguaje_id)
          VALUES 
              (${docenteId},
                ${element} 
              )
          ;
        `;
      });
    });
  } catch(e){
    return {
      message: 'ERROR: Error actualizando Docente.',
    };
  }
}

export async function deleteDocente(docenteId: string){
  // console.log("holaaa", entry)
  try{
    await sql.begin(async (transaction) => {
      await transaction`
        DELETE FROM docentes 
        WHERE id=${docenteId};
      `;
    });
    return true;
  } catch(e){
    return false;
  }
}

type AlumnoCreate = {
  nombre: string;
  apellido: string;
  dni?: string | undefined;
  email?: string | undefined;
  telefono?: string | undefined;
}

export async function crearAlumno(entry: AlumnoCreate){
  try {
    await sql.begin(async (transaction) => {
      await transaction`
        INSERT INTO alumnos 
        (nombre, apellido, dni, email, telefono)
        VALUES 
            (${entry.nombre}, 
              ${entry.apellido}, 
              ${entry.dni ?? ""}, 
              ${entry.email ?? ""}, 
              ${entry.telefono ?? ""}
            )
      `;
    });
  } catch(e) {
    return {
      message: 'ERROR: Error creando Alumno.',
      error: e
    };
  }
}

export async function updateAlumno(alumnoId: string, entry: AlumnoCreate){
  // console.log("holaaa", entry)
  try{
    await sql.begin(async (transaction) => {
      await transaction`
        UPDATE alumnos 
        SET nombre=${entry.nombre}, 
            apellido=${entry.apellido}, 
            dni=${entry.dni ?? ""}, 
            email=${entry.email ?? ""}, 
            telefono=${entry.telefono ?? ""}
        WHERE id=${alumnoId};
      `;
    });
  } catch(e){
    return {
      message: 'ERROR: Error actualizando Alumno.',
    };
  }
}

export async function deleteAlumno(alumnoId: string){
  // console.log("holaaa", entry)
  try{
    await sql.begin(async (transaction) => {
      await transaction`
        DELETE FROM alumnos
        WHERE id=${alumnoId};
      `;
    });
    return true;
  } catch(e){
    return false;
  }
}

export async function updateDisponibilidad(disponibilidadId: any,entry: {diaSemana: string, horaDesde: string, horaHasta: string}){
  try{
    await sql.begin(async (transaction) => {
      await transaction`
        UPDATE disponibilidad_semanal 
        SET dia_semana=${entry.diaSemana}, 
            hora_desde=${entry.horaDesde}::time, 
            hora_hasta=${entry.horaHasta}::time 
        WHERE id=${disponibilidadId};
      `;
    });
  } catch(e){
    return {
      message: 'ERROR: Error actualizando Disponibilidad.',
      error: e
    };
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