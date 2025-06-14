// ~/Documents/web/Agenda-AI/src/app/api/events/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/events/:id - Obtener un evento específico por ID
export async function GET(request: Request, { params }: { params: { id: string } }) { // CAMBIO AQUÍ
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid Event ID provided.' }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
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

    if (!event) {
      return NextResponse.json({ message: 'Event not found.' }, { status: 404 });
    }
    return NextResponse.json(event);
  } catch (error: any) {
    console.error('Error fetching event by ID:', error);
    return NextResponse.json({ message: 'Error fetching event data.', error: error.message }, { status: 500 });
  }
}

// PUT /api/events/:id - Actualizar un evento por ID
export async function PUT(request: Request, { params }: { params: { id: string } }) { // CAMBIO AQUÍ
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid Event ID provided.' }, { status: 400 });
    }

    const data = await request.json();
    const { startTime, endTime, reminderTime, ...rest } = data;

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        ...rest,
        userId: data.userId ? parseInt(data.userId, 10) : undefined,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        reminderTime: reminderTime ? new Date(reminderTime) : undefined,
        priority: data.priority !== undefined ? parseInt(data.priority, 10) : undefined,
        isAllDay: typeof data.isAllDay === 'boolean' ? data.isAllDay : undefined,
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

    return NextResponse.json(updatedEvent);
  } catch (error: any) {
    console.error('Error updating event:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Event not found for update.' }, { status: 404 });
    }
    if (error.code === 'P2003') {
        return NextResponse.json({ message: 'User with the provided userId does not exist.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Error updating event.', error: error.message }, { status: 500 });
  }
}

// DELETE /api/events/:id - Eliminar un evento por ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) { // CAMBIO AQUÍ
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid Event ID provided.' }, { status: 400 });
    }

    await prisma.event.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  }
  catch (error: any) {
    console.error('Error deleting event:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Event not found for deletion.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Error deleting event.', error: error.message }, { status: 500 });
  }
}