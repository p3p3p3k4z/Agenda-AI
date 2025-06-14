// ~/Documents/web/Agenda-AI/src/app/api/tasks/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/tasks/:id - Obtener una tarea específica por ID
export async function GET(request: Request, { params }: { params: { id: string } }) { // CAMBIO AQUÍ
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
    return NextResponse.json(task);
  } catch (error: any) {
    console.error('Error fetching task by ID:', error);
    return NextResponse.json({ message: 'Error fetching task data.', error: error.message }, { status: 500 });
  }
}

// PUT /api/tasks/:id - Actualizar una tarea por ID
export async function PUT(request: Request, { params }: { params: { id: string } }) { // CAMBIO AQUÍ
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid Task ID provided.' }, { status: 400 });
    }

    const data = await request.json();
    const { dueDate, ...rest } = data;

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        ...rest,
        userId: data.userId ? parseInt(data.userId, 10) : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        dueTime: data.dueTime !== undefined ? data.dueTime : undefined,
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

    return NextResponse.json(updatedTask);
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
export async function DELETE(request: Request, { params }: { params: { id: string } }) { // CAMBIO AQUÍ
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