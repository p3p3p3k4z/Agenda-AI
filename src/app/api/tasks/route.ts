// ~/Documents/web/Agenda-AI/src/app/api/tasks/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/tasks - Obtener todas las tareas (se puede filtrar por userId)
// Ejemplo de uso: /api/tasks?userId=1 para obtener tareas del usuario con ID 1
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId'); // Obtiene el userId del query parameter

    const tasks = await prisma.task.findMany({
      where: userId ? { userId: parseInt(userId, 10) } : {}, // Aplica filtro si userId está presente
      include: { // Incluye datos del usuario asociado a la tarea
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc', // Ordenar tareas por su fecha de creación
      },
    });
    return NextResponse.json(tasks);
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ message: 'Error fetching tasks.', error: error.message }, { status: 500 });
  }
}

// POST /api/tasks - Crear una nueva tarea
export async function POST(request: Request) {
  try {
    const { userId, title, description, dueDate, dueTime, isCompleted, priority, category } = await request.json();

    // Validación básica de campos requeridos
    if (!userId || !title) {
      return NextResponse.json({ message: 'Missing required fields: userId, title.' }, { status: 400 });
    }

    const newTask = await prisma.task.create({
      data: {
        userId: parseInt(userId, 10), // Asegura que userId sea un número entero
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null, // Convierte a objeto Date para la fecha
        // dueTime se maneja como String, tal como lo definimos en schema.prisma para TIME WITH TIME ZONE
        dueTime: dueTime || null, // Asegúrate de que el formato de string sea el esperado por tu DB (ej. "HH:MM:SS-TZ")
        isCompleted: typeof isCompleted === 'boolean' ? isCompleted : false, // Asegura tipo booleano
        priority: priority !== undefined ? parseInt(priority, 10) : 0, // Asegura número entero
        category,
      },
      include: { // Incluye datos del usuario en la respuesta
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return NextResponse.json(newTask, { status: 201 }); // 201 Created
  } catch (error: any) {
    console.error('Error creating task:', error);
    if (error.code === 'P2003') { // Falla de restricción de clave foránea (userId no existe)
        return NextResponse.json({ message: 'User with the provided userId does not exist.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Error creating task.', error: error.message }, { status: 500 });
  }
}