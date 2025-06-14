
docker compose logs -f db

Haz clic en "Add New Server" en pgAdmin.
Pestaña "General":

    Name: Agenda DB (o el nombre que quieras)

Pestaña "Connection":

    Host name/address: db (Recuerda que pgAdmin está en la misma red Docker que la DB, así que se refieren por el nombre del servicio).
    Port: 5432
    Maintenance database: agenda_db
    Username: agenda_user
    Password: agenda_password
    Marca "Save password?".

Haz clic en "Save".

SELECT * FROM users;
SELECT * FROM events;
SELECT * FROM tasks;

DATABASE_URL="postgresql://agenda_user:agenda_password@localhost:5432/agenda_db?schema=public"

### Reinicio
docker compose down -v
docker compose up -d
npx prisma generate
npm run dev


Cómo Usar curl para tu API de Agenda
1. Probar Usuarios (/api/users y /api/users/[id])

A. Crear un Usuario (POST)
Bash

curl -X POST \
  http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "curluser",
    "email": "curl@example.com",
    "password": "curlpassword123"
  }'

    -X POST: Especifica el método HTTP.
    -H "Content-Type: application/json": Le dice al servidor que el cuerpo de la solicitud es JSON.
    -d '...': Proporciona los datos del cuerpo de la solicitud en formato JSON.

B. Obtener Todos los Usuarios (GET)
Bash

curl http://localhost:3000/api/users

    Por defecto, curl usa el método GET.

C. Obtener un Usuario por ID (GET)

(Primero, revisa la salida del POST para obtener el id del usuario que creaste. Asumiremos que es 1 para los ejemplos)
Bash

curl http://localhost:3000/api/users/1

D. Actualizar un Usuario por ID (PUT)
Bash

curl -X PUT \
  http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "username": "curl_updated_user",
    "email": "updated_curl@example.com"
    // "password": "new_curlpassword"  <- Si quieres actualizar la contraseña
  }'

E. Eliminar un Usuario por ID (DELETE)
Bash

curl -X DELETE \
  http://localhost:3000/api/users/1

    Esperarás un código de estado HTTP/1.1 204 No Content en la cabecera, pero curl no mostrará nada en el cuerpo de la respuesta si es exitosa. Puedes usar -v para ver las cabeceras: curl -v -X DELETE http://localhost:3000/api/users/1.

2. Probar Eventos (/api/events y /api/events/[id])

(Asegúrate de que el userId que uses en las solicitudes POST/PUT exista en tu base de datos.)

A. Crear un Evento (POST)
Bash

curl -X POST \
  http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "title": "Cita dental",
    "description": "Limpieza y revisión anual.",
    "location": "Clínica Sonrisas",
    "startTime": "2025-07-01T09:00:00-06:00",
    "endTime": "2025-07-01T10:00:00-06:00",
    "isAllDay": false,
    "reminderTime": "2025-07-01T08:30:00-06:00",
    "category": "Personal",
    "priority": 2
  }'

B. Obtener Todos los Eventos (GET)
Bash

curl http://localhost:3000/api/events

C. Obtener Eventos por Usuario (GET)
Bash

curl "http://localhost:3000/api/events?userId=1"
# Importante: Usa comillas dobles para la URL si contiene el signo de interrogación "?"

D. Obtener un Evento por ID (GET)

(Asumiendo que el ID del evento es 1)
Bash

curl http://localhost:3000/api/events/1

E. Actualizar un Evento por ID (PUT)
Bash

curl -X PUT \
  http://localhost:3000/api/events/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Cita dental actualizada",
    "location": "Clínica Sonrisas, nueva dirección",
    "priority": 3
  }'

F. Eliminar un Evento por ID (DELETE)
Bash

curl -X DELETE \
  http://localhost:3000/api/events/1

3. Probar Tareas (/api/tasks y /api/tasks/[id])

(Asegúrate de que el userId que uses en las solicitudes POST/PUT exista en tu base de datos.)

A. Crear una Tarea (POST)
Bash

curl -X POST \
  http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "title": "Comprar víveres",
    "description": "Leche, pan, huevos, frutas.",
    "dueDate": "2025-06-25",
    "dueTime": "18:30:00-06",
    "isCompleted": false,
    "priority": 1,
    "category": "Casa"
  }'

    Para dueTime, asegúrate de usar un string en un formato que tu base de datos PostgreSQL (TIME WITH TIME ZONE) pueda entender. HH:MM:SS-TZ como 18:30:00-06 es una buena opción para México (Zona horaria CDT).

B. Obtener Todas las Tareas (GET)
Bash

curl http://localhost:3000/api/tasks

C. Obtener Tareas por Usuario (GET)
Bash

curl "http://localhost:3000/api/tasks?userId=1"

D. Obtener una Tarea por ID (GET)

(Asumiendo que el ID de la tarea es 1)
Bash

curl http://localhost:3000/api/tasks/1

E. Actualizar una Tarea por ID (PUT)
Bash

curl -X PUT \
  http://localhost:3000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{
    "isCompleted": true,
    "priority": 0
  }'

F. Eliminar una Tarea por ID (DELETE)
Bash

curl -X DELETE \
  http://localhost:3000/api/tasks/1

Consejos adicionales para curl:

    Verificar Cabeceras: Usa curl -v para ver las cabeceras de la solicitud y la respuesta, lo cual es muy útil para depurar.
    Formato JSON bonito: Puedes usar jq (si lo tienes instalado: sudo apt-get install jq o brew install jq) para formatear la salida JSON:
    Bash

    curl http://localhost:3000/api/users | jq .

Con estos comandos de curl, tienes una forma robusta de interactuar y probar tus endpoints API. ¡Mucha suerte!