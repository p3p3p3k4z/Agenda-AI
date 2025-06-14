// ~/Documents/web/Agenda-AI/src/app/api/users/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/users/:id - Obtener un usuario específico por ID (Perfil de usuario)
// NOTA CLAVE: Desestructura { params } directamente.
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid User ID provided.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error: any) {
    console.error('Error fetching user by ID:', error);
    return NextResponse.json({ message: 'Error fetching user data.', error: error.message }, { status: 500 });
  }
}

// PUT /api/users/:id - Actualizar los datos de un usuario (Actualizar perfil)
// NOTA CLAVE: Desestructura { params } directamente.
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid User ID provided.' }, { status: 400 });
    }

    const { username, email, password } = await request.json();

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        username,
        email,
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error('Error updating user:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ message: 'Email or username already exists.' }, { status: 409 });
    }
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'User not found for update.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Error updating user data.', error: error.message }, { status: 500 });
  }
}

// DELETE /api/users/:id - Eliminar un usuario
// NOTA CLAVE: Desestructura { params } directamente.
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid User ID provided.' }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'User not found for deletion.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Error deleting user.', error: error.message }, { status: 500 });
  }
}