// ~/Documents/web/Agenda-AI/src/app/api/tasks/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Función auxiliar para formatear la hora (HH:MM:SS)
function formatTime(date: Date | null): string | null {
  if (!date) return null;
  // Obtener la hora, minutos y segundos, asegurando dos dígitos
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}


// GET /api/tasks - Obtener todas las tareas (se puede filtrar por userId)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const tasks = await prisma.task.findMany({
      where: userId ? { userId: parseInt(userId, 10) } : {},
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Formatear dueTime a string HH:MM:SS para la respuesta
    const formattedTasks = tasks.map(task => ({
      ...task,
      dueTime: formatTime(task.dueTime), // Usa la función auxiliar
    }));

    return NextResponse.json(formattedTasks);
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ message: 'Error fetching tasks.', error: error.message }, { status: 500 });
  }
}

// POST /api/tasks - Crear una nueva tarea
export async function POST(request: Request) {
  try {
    const { userId, title, description, dueDate, dueTime, isCompleted, priority, category } = await request.json();

    if (!userId || !title) {
      return NextResponse.json({ message: 'Missing required fields: userId, title.' }, { status: 400 });
    }

    // Convertir dueTime string (ej. "18:00:00") a un objeto Date con fecha por defecto (1970-01-01)
    // Esto es lo que Prisma espera para un tipo @db.Time(6)
    let parsedDueTime: Date | null = null;
    if (dueTime) {
      // Combina una fecha por defecto (1970-01-01) con la hora para crear un Date object
      // Esto es necesario para el tipo DateTime en Prisma que mapea a TIME WITH TIME ZONE
      parsedDueTime = new Date(`1970-01-01T${dueTime}`);
      // Ojo con la zona horaria. Si dueTime no tiene Z, se interpreta como hora local
      // Considera new Date(`1970-01-01T${dueTime}Z`) si es UTC
    }

    const newTask = await prisma.task.create({
      data: {
        userId: parseInt(userId, 10),
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        dueTime: parsedDueTime, // Pasa el objeto Date (con fecha 1970-01-01)
        isCompleted: typeof isCompleted === 'boolean' ? isCompleted : false,
        priority: priority !== undefined ? parseInt(priority, 10) : 0,
        category,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    // Formatear dueTime a string HH:MM:SS para la respuesta
    const formattedNewTask = {
      ...newTask,
      dueTime: formatTime(newTask.dueTime),
    };

    return NextResponse.json(formattedNewTask, { status: 201 });
  } catch (error: any) {
    console.error('Error creating task:', error);
    if (error.code === 'P2003') {
        return NextResponse.json({ message: 'User with the provided userId does not exist.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Error creating task.', error: error.message }, { status: 500 });
  }
}