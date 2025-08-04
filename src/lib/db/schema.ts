import postgres from 'postgres';
const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function createSchema() {
  // Enable UUID extension
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  // Create Lenguajes table
  await sql`
    CREATE TABLE IF NOT EXISTS lenguajes (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL
    );
  `;

  // Create Docentes table
  await sql`
    CREATE TABLE IF NOT EXISTS docentes (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      apellido VARCHAR(255) NOT NULL,
      dni VARCHAR(255),
      email TEXT,
      telefono VARCHAR(50)
    );
  `;

  // Create Docentes_Lenguajes junction table for many-to-many relationship
  await sql`
    CREATE TABLE IF NOT EXISTS docentes_lenguajes (
      docente_id UUID REFERENCES docentes(id),
      lenguaje_id UUID REFERENCES lenguajes(id),
      PRIMARY KEY (docente_id, lenguaje_id)
    );
  `;

  // Create Alumnos table
  await sql`
    CREATE TABLE IF NOT EXISTS alumnos (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      apellido VARCHAR(255) NOT NULL,
      email TEXT,
      telefono VARCHAR(50),
      dni VARCHAR(255)
    );
  `;

  // Create Clases table
  await sql`
    CREATE TABLE IF NOT EXISTS clases (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      titulo VARCHAR(255),
      fecha DATE NOT NULL,
      hora_inicio TIME NOT NULL,
      hora_fin TIME NOT NULL,
      docente_id UUID REFERENCES docentes(id),
      lenguaje_id UUID REFERENCES lenguajes(id),
      link_reunion TEXT NOT NULL,
      estado VARCHAR(50) CHECK (estado IN ('programada', 'cancelada', 'pospuesta')),
      description TEXT
    );
  `;

  // Create Clases_Alumnos junction table for many-to-many relationship
  await sql`
    CREATE TABLE IF NOT EXISTS clases_alumnos (
      clase_id UUID REFERENCES clases(id),
      alumno_id UUID REFERENCES alumnos(id),
      PRIMARY KEY (clase_id, alumno_id)
    );
  `;

  // Create Disponibilidad table
  await sql`
    CREATE TABLE IF NOT EXISTS disponibilidad (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      docente_id UUID REFERENCES docentes(id),
      fecha DATE NOT NULL,
      esta_disponible BOOLEAN NOT NULL,
      motivo TEXT
    );
  `;
}

// Function to insert test data
export async function seedTestData() {
  // Insert test languages
  const [espanol, ingles] = await Promise.all([
    sql`
      INSERT INTO lenguajes (nombre)
      VALUES ('Español')
      RETURNING id
    `,
    sql`
      INSERT INTO lenguajes (nombre)
      VALUES ('Inglés')
      RETURNING id
    `
  ]);

  // Insert test teacher
  const [docente] = await sql`
    INSERT INTO docentes (nombre, apellido, email, telefono)
    VALUES ('Juan', 'Pérez', 'juan@example.com', '+1234567890')
    RETURNING id
  `;

  // Associate teacher with languages
  await Promise.all([
    sql`
      INSERT INTO docentes_lenguajes (docente_id, lenguaje_id)
      VALUES (${docente.id}, ${espanol[0].id})
    `,
    sql`
      INSERT INTO docentes_lenguajes (docente_id, lenguaje_id)
      VALUES (${docente.id}, ${ingles[0].id})
    `
  ]);

  // Insert test student
  const [alumno] = await sql`
    INSERT INTO alumnos (nombre, apellido, email)
    VALUES ('María', 'González', 'maria@example.com')
    RETURNING id
  `;

  // Insert test class
  const [clase] = await sql`
    INSERT INTO clases (
      titulo,
      fecha,
      hora_inicio,
      hora_fin,
      docente_id,
      lenguaje_id,
      link_reunion,
      estado
    )
    VALUES (
      'Clase de Español',
      CURRENT_DATE,
      '09:00',
      '10:30',
      ${docente.id},
      ${espanol[0].id},
      'https://meet.example.com/clase1',
      'programada'
    )
    RETURNING id
  `;

  // Associate student with class
  await sql`
    INSERT INTO clases_alumnos (clase_id, alumno_id)
    VALUES (${clase.id}, ${alumno.id})
  `;

  // Insert availability for teacher
  await sql`
    INSERT INTO disponibilidad (docente_id, fecha, esta_disponible, motivo)
    VALUES (
      ${docente.id},
      CURRENT_DATE,
      true,
      null
    )
  `;
}
