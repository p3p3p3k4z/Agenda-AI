// ~/Documents/web/Agenda-AI/src/app/api/tasks/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Función auxiliar para formatear la hora (HH:MM:SS)
function formatTime(date: Date | null): string | null {
  if (!date) return null;
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}


// GET /api/tasks/:id - Obtener una tarea específica por ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid Task ID provided.' }, { status: 400 });
    }

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ message: 'Task not found.' }, { status: 404 });
    }

    // Formatear dueTime a string HH:MM:SS para la respuesta
    const formattedTask = {
      ...task,
      dueTime: formatTime(task.dueTime),
    };

    return NextResponse.json(formattedTask);
  } catch (error: any) {
    console.error('Error fetching task by ID:', error);
    return NextResponse.json({ message: 'Error fetching task data.', error: error.message }, { status: 500 });
  }
}

// PUT /api/tasks/:id - Actualizar una tarea por ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid Task ID provided.' }, { status: 400 });
    }

    const data = await request.json();
    const { dueDate, dueTime, ...rest } = data; // Extraer dueTime

    let parsedDueTime: Date | undefined | null = undefined;
    if (dueTime !== undefined) {
      if (dueTime === null) {
        parsedDueTime = null; // Si se envía explícitamente null
      } else {
        parsedDueTime = new Date(`1970-01-01T${dueTime}`);
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        ...rest,
        userId: data.userId ? parseInt(data.userId, 10) : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        dueTime: parsedDueTime, // Pasa el objeto Date o null
        isCompleted: typeof data.isCompleted === 'boolean' ? data.isCompleted : undefined,
        priority: data.priority !== undefined ? parseInt(data.priority, 10) : undefined,
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
    const formattedUpdatedTask = {
      ...updatedTask,
      dueTime: formatTime(updatedTask.dueTime),
    };

    return NextResponse.json(formattedUpdatedTask);
  } catch (error: any) {
    console.error('Error updating task:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Task not found for update.' }, { status: 404 });
    }
    if (error.code === 'P2003') {
        return NextResponse.json({ message: 'User with the provided userId does not exist.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Error updating task.', error: error.message }, { status: 500 });
  }
}

// DELETE /api/tasks/:id - Eliminar una tarea por ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid Task ID provided.' }, { status: 400 });
    }

    await prisma.task.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error('Error deleting task:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Task not found for deletion.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Error deleting task.', error: error.message }, { status: 500 });
  }
}