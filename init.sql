-- ~/Documents/web/Agenda-AI/init.sql

-- Eliminar tablas si existen para empezar limpio.
-- Usamos CASCADE para asegurar que las dependencias (eventos, tareas)
-- que referencian a 'users' se eliminen antes de 'users'.
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Tabla de Usuarios
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Contraseña en texto plano (para fines escolares)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    -- Eliminamos 'updated_at' aquí, lo gestionará Prisma
);

-- Tabla de Eventos
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    is_all_day BOOLEAN DEFAULT FALSE,
    reminder_time TIMESTAMP WITH TIME ZONE,
    category VARCHAR(100),
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    -- Eliminamos 'updated_at' aquí, lo gestionará Prisma
);

-- Tabla de Tareas
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE,
    due_time VARCHAR(10),
    is_completed BOOLEAN DEFAULT FALSE,
    priority INTEGER DEFAULT 0,
    category VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    -- Eliminamos 'updated_at' aquí, lo gestionará Prisma
);

-- INSERCIÓN DE DATOS DE EJEMPLO
-- NOTA: Si usas SERIAL PRIMARY KEY, no necesitas especificar el 'id'
-- en el INSERT INTO, PostgreSQL lo asignará automáticamente (1, 2, etc.).
-- Si especificas el ID (ej. (1, 'usuario_agenda',...)), entonces asegúrate
-- de que esos IDs no estén en conflicto con secuencias existentes.
-- Para simplicidad en este contexto, lo mantendremos como lo tenías.

INSERT INTO users (username, email, password) VALUES
('usuario_agenda', 'usuario@example.com', 'password123'),
('ana_perez', 'ana.perez@example.com', 'mypassword');

INSERT INTO events (user_id, title, description, location, start_time, end_time, reminder_time, category, priority) VALUES
(1, 'Reunión de Proyecto', 'Discutir avances del proyecto Agenda.', 'Oficina Principal', '2025-06-15 10:00:00-06', '2025-06-15 11:00:00-06', '2025-06-15 09:30:00-06', 'Trabajo', 2),
(1, 'Cita con el dentista', 'Revisión anual', 'Clínica Dental Sonrisa', '2025-06-20 14:30:00-06', '2025-06-20 15:00:00-06', '2025-06-20 14:00:00-06', 'Salud', 1),
(2, 'Clase de Yoga', 'Sesión de yoga matutina', 'Gimnasio Fitness', '2025-06-16 07:00:00-06', '2025-06-16 08:00:00-06', '2025-06-16 06:45:00-06', 'Personal', 0),
(1, 'Cumpleaños de María', 'Fiesta de cumpleaños en su casa', 'Casa de María', '2025-07-01 19:00:00-06', NULL, '2025-07-01 18:00:00-06', 'Social', 1);

INSERT INTO tasks (user_id, title, description, due_date, due_time, is_completed, priority, category) VALUES
(1, 'Comprar víveres', 'Lista de compras semanal: leche, huevos, pan.', '2025-06-14', '18:00:00-06', FALSE, 1, 'Hogar'),
(1, 'Terminar informe trimestral', 'Revisar datos y redactar conclusiones.', '2025-06-18', NULL, FALSE, 2, 'Trabajo'),
(2, 'Pagar facturas', 'Agua, luz e internet.', '2025-06-15', NULL, FALSE, 1, 'Finanzas'),
(1, 'Llamar a Juan', 'Preguntar sobre el estado del proyecto B.', '2025-06-13', '17:00:00-06', FALSE, 0, 'Trabajo');