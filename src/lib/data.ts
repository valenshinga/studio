
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

export async function getDocente(docenteId:string): Promise<Docente | null> {
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

    const d = docente[0];
    return {
      id: d.id,
      nombre: d.nombre,
      apellido: d.apellido,
      dni: d.dni,
      email: d.email,
      telefono: d.telefono,
      lenguajes: d.lenguajes || [],
      disponibilidades: d.disponibilidades || []
    };
  } catch (error) {
    console.error('Database Error:', error);
    return null;
  }
}

export async function getDocenteByDni(dni:string): Promise<Docente | null> {
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
      WHERE d.dni = ${dni}
      GROUP BY d.id, d.nombre, d.apellido, d.dni, d.email, d.telefono;
    `;

    if (docente.length === 0) {
      return null;
    }

    const d = docente[0];
    return {
      id: d.id,
      nombre: d.nombre,
      apellido: d.apellido,
      dni: d.dni,
      email: d.email,
      telefono: d.telefono,
      lenguajes: d.lenguajes || [],
      disponibilidades: d.disponibilidades || []
    };
  } catch (error) {
    console.error('Database Error:', error);
    return null;
  }
}

export async function getAlumno(alumnoId:string): Promise<Alumno | null> {
  try{
    const alumno = await sql`
      SELECT 
      a.id,
      a.nombre,
      a.apellido,
      a.dni,
      a.email,
      a.telefono,
      ARRAY_AGG(
        CASE 
        WHEN ds.id IS NOT NULL 
        THEN jsonb_build_object('id', ds.id, 'diaSemana', ds.dia_semana, 'horaDesde', ds.hora_desde,'horaHasta', ds.hora_hasta)
        ELSE NULL
        END
    ) FILTER (WHERE ds.id IS NOT NULL) as disponibilidades
      FROM alumnos a
      LEFT JOIN disponibilidad_semanal ds ON ds.alumno_id = a.id
      WHERE a.id = ${alumnoId}
      GROUP BY a.id, a.nombre, a.apellido, a.dni, a.email, a.telefono;
    `;
    
    if (alumno.length === 0) {
      return null;
    }
    
    const al = alumno[0];
    return {
      id: al.id,
      nombre: al.nombre,
      apellido: al.apellido,
      dni: al.dni,
      email: al.email,
      telefono: al.telefono,
      disponibilidades: al.disponibilidades || []
    };
  } catch (error) {
    console.error('Database Error:', error);
    return null;
  }
}

export async function getAlumnoByDni(dni:string): Promise<Alumno | null> {
  try{
    const alumno = await sql`
      SELECT 
      a.id,
      a.nombre,
      a.apellido,
      a.dni,
      a.email,
      a.telefono,
      ARRAY_AGG(
        CASE 
        WHEN ds.id IS NOT NULL 
        THEN jsonb_build_object('id', ds.id, 'diaSemana', ds.dia_semana, 'horaDesde', ds.hora_desde,'horaHasta', ds.hora_hasta)
        ELSE NULL
        END
    ) FILTER (WHERE ds.id IS NOT NULL) as disponibilidades
      FROM alumnos a
      LEFT JOIN disponibilidad_semanal ds ON ds.alumno_id = a.id
      WHERE a.dni = ${dni}
      GROUP BY a.id, a.nombre, a.apellido, a.dni, a.email, a.telefono;
    `;

    if (alumno.length === 0) {
      return null;
    }

    const al = alumno[0];
    return {
      id: al.id,
      nombre: al.nombre,
      apellido: al.apellido,
      dni: al.dni,
      email: al.email,
      telefono: al.telefono,
      disponibilidades: al.disponibilidades || []
    };
  } catch (error) {
    console.error('Database Error:', error);
    return null;
  }
}

export async function getAlumnos(): Promise<Alumno[]> {
  try {
    const data = await sql<Alumno[]>
    `
      SELECT 
        a.id,
        a.nombre,
        a.apellido,
        a.dni,
        a.email,
        a.telefono,
        ARRAY_AGG(
          CASE 
          WHEN ds.id IS NOT NULL 
          THEN jsonb_build_object('id', ds.id, 'diaSemana', ds.dia_semana, 'horaDesde', ds.hora_desde,'horaHasta', ds.hora_hasta)
          ELSE NULL
          END
      ) FILTER (WHERE ds.id IS NOT NULL) as disponibilidades
        FROM alumnos a
        LEFT JOIN disponibilidad_semanal ds ON ds.alumno_id = a.id
        GROUP BY a.id, a.nombre, a.apellido, a.dni, a.email, a.telefono;
    `;

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
  dni: string;
  email: string;
  telefono: string;
  lenguajesIds: string[];
  disponibilidades?: {disponibilidadId?: string, diaSemana: string, horaDesde: string, horaHasta: string}[];
}

export async function crearDocente(entry: DocenteCreate){
  const docenteExistente = await getDocenteByDni(entry.dni);
  if (docenteExistente) {
    throw new Error('Ya existe un docente con ese DNI.');
  }
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
        
      // Usar for...of en lugar de forEach para manejar correctamente async/await
      for (const element of entry.lenguajesIds) {
        await transaction`
          INSERT INTO docentes_lenguajes 
          (docente_id, lenguaje_id)
          VALUES 
              (${newDocente.id},
                ${element} 
              )
          ;
        `;
      }
      
      if (entry.disponibilidades) {
        for (const element of entry.disponibilidades) {
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
        }
      }
    });
  } catch(e){
    console.error('Database Error creating docente:', e);
    throw new Error('ERROR: Error creando Docente.');
  }
}

export async function updateDocente(docenteId: string, entry: DocenteCreate) {
  const docente = await getDocente(docenteId);
  const lenguajesActuales = docente?.lenguajes.map(l => l.id) || [];
  const docenteExistente = await getDocenteByDni(entry.dni);
  if (docenteExistente && docenteExistente?.id != docente?.id) {
    throw new Error('Ya existe un docente con ese DNI.');
  }
  try {
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

      const aAgregar = entry.lenguajesIds.filter(id => !lenguajesActuales.includes(id));
      const aEliminar = lenguajesActuales.filter(id => !entry.lenguajesIds.includes(id));

      for (const id of aAgregar) {
        await transaction`
          INSERT INTO docentes_lenguajes (docente_id, lenguaje_id)
          VALUES (${docenteId}, ${id});
        `;
      }

      for (const id of aEliminar) {
        await transaction`
          DELETE FROM docentes_lenguajes
          WHERE docente_id=${docenteId} AND lenguaje_id=${id};
        `;
      }

      if (entry.disponibilidades) {
        for (const element of entry.disponibilidades) {
          if (docente?.disponibilidades?.find(d => d.id == element.disponibilidadId)) {
            continue;
          }
          const horaDesdeSQL = `${element.horaDesde}:00`;
          const horaHastaSQL = `${element.horaHasta}:00`;
          await transaction`
            INSERT INTO disponibilidad_semanal 
            (docente_id, alumno_id, tipo_persona, dia_semana, hora_desde, hora_hasta)
            VALUES (
              ${docenteId},
              null,
              'docente',
              ${element.diaSemana},
              ${horaDesdeSQL}::time,
              ${horaHastaSQL}::time
            );
          `;
        }
      }
    });
  } catch (e) {
    console.error('Database Error updating docente:', e);
    throw new Error('ERROR: Error actualizando Docente.');
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
    return {
      message: 'ERROR: Error actualizando Docente.',
      error: e
    };
  }
}

type AlumnoCreate = {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono: string;
  disponibilidades?: {disponibilidadId?: string, diaSemana: string, horaDesde: string, horaHasta: string}[];
}

export async function crearAlumno(entry: AlumnoCreate){
  const alumnoExistente = await getAlumnoByDni(entry.dni);
  if (alumnoExistente) {
    throw new Error('Ya existe un alumno con ese DNI.');
  }
  try {
    await sql.begin(async (transaction) => {
      const [alumno] = await transaction`
        INSERT INTO alumnos 
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
      
      // Usar for...of en lugar de forEach para manejar correctamente async/await
      if (entry.disponibilidades) {
        for (const element of entry.disponibilidades) {
          const horaDesdeSQL = `${element.horaDesde}:00`;
          const horaHastaSQL = `${element.horaHasta}:00`;
          await transaction`
            INSERT INTO disponibilidad_semanal 
            (docente_id, alumno_id, tipo_persona, dia_semana, hora_desde, hora_hasta)
            VALUES 
                (null,
                  ${alumno.id},
                  'alumno',
                  ${element.diaSemana},
                  ${horaDesdeSQL}::time,
                  ${horaHastaSQL}::time
                )
            ;
          `;
        }
      }
    });
  } catch(e) {
    console.error('Database Error creating alumno:', e);
    throw new Error('ERROR: Error creando Alumno.');
  }
}

export async function updateAlumno(alumnoId: string, entry: AlumnoCreate) {
  const alumno = await getAlumno(alumnoId);
  const alumnoExistente = await getAlumnoByDni(entry.dni);
  if (alumnoExistente && alumnoExistente?.id != alumno?.id) {
    throw new Error('Ya existe un alumno con ese DNI.');
  }
  try {
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

      // Usar for...of en lugar de forEach para manejar correctamente async/await
      if (entry.disponibilidades) {
        for (const element of entry.disponibilidades) {
          if (alumno?.disponibilidades?.find(d => d.id == element.disponibilidadId)) {
            continue;
          }
          const horaDesdeSQL = `${element.horaDesde}:00`;
          const horaHastaSQL = `${element.horaHasta}:00`;
          await transaction`
            INSERT INTO disponibilidad_semanal 
            (docente_id, alumno_id, tipo_persona, dia_semana, hora_desde, hora_hasta)
            VALUES (
              null,
              ${alumnoId},
              'alumno',
              ${element.diaSemana},
              ${horaDesdeSQL}::time,
              ${horaHastaSQL}::time
            );
          `;
        }
      }
    });
  } catch (e) {
    console.error('Database Error updating alumno:', e);
    throw new Error('ERROR: Error actualizando Alumno.');
  }
}

export async function deleteAlumno(alumnoId: string){
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

export async function deleteDisponibilidad(disponibilidadId: string){
  try{
    await sql.begin(async (transaction) => {
      await transaction`
        DELETE FROM disponibilidad_semanal 
        WHERE id=${disponibilidadId.trim()}::uuid;
      `;
    });
    console.log("BORRADO")
    return {
      message: 'ELIMINADO CON EXITO.',
    };
  } catch(e){
    return {
      message: 'ERROR: Error actualizando Docente.',
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