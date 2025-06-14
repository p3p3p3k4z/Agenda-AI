// ~/Documents/web/Agenda-AI/src/app/api/events/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/events - Obtener todos los eventos (se puede filtrar por userId)
// Ejemplo de uso: /api/events?userId=1 para obtener eventos del usuario con ID 1
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId'); // Obtiene el userId del query parameter

    const events = await prisma.event.findMany({
      where: userId ? { userId: parseInt(userId, 10) } : {}, // Aplica filtro si userId está presente
      include: { // Incluye datos del usuario asociado al evento
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc', // Ordenar eventos por su hora de inicio
      },
    });
    return NextResponse.json(events);
  } catch (error: any) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ message: 'Error fetching events.', error: error.message }, { status: 500 });
  }
}

// POST /api/events - Crear un nuevo evento
export async function POST(request: Request) {
  try {
    const { userId, title, description, location, startTime, endTime, isAllDay, reminderTime, category, priority } = await request.json();

    // Validación básica de campos requeridos
    if (!userId || !title || !startTime) {
      return NextResponse.json({ message: 'Missing required fields: userId, title, startTime.' }, { status: 400 });
    }

    const newEvent = await prisma.event.create({
      data: {
        userId: parseInt(userId, 10), // Asegura que userId sea un número entero
        title,
        description,
        location,
        startTime: new Date(startTime), // Convierte a objeto Date
        endTime: endTime ? new Date(endTime) : null,
        isAllDay: typeof isAllDay === 'boolean' ? isAllDay : false, // Asegura tipo booleano
        reminderTime: reminderTime ? new Date(reminderTime) : null,
        category,
        priority: priority !== undefined ? parseInt(priority, 10) : 0, // Asegura número entero
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

    return NextResponse.json(newEvent, { status: 201 }); // 201 Created
  } catch (error: any) {
    console.error('Error creating event:', error);
    if (error.code === 'P2003') { // Falla de restricción de clave foránea (userId no existe)
        return NextResponse.json({ message: 'User with the provided userId does not exist.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Error creating event.', error: error.message }, { status: 500 });
  }
}