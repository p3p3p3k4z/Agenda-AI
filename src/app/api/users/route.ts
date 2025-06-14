// ~/Documents/web/Agenda-AI/src/app/api/users/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
// import bcrypt from 'bcryptjs'; // Asegúrate de instalarlo con: npm install bcryptjs

// GET /api/users - Obtener todos los usuarios
// Útil para un administrador o para listar usuarios. En una app de agenda, podrías querer restringir esto.
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        // ¡IMPORTANTE!: Nunca incluyas la contraseña en las respuestas GET por seguridad.
      },
    });
    return NextResponse.json(users);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'Error fetching users', error: error.message }, { status: 500 });
  }
}

// POST /api/users - Crear un nuevo usuario (Registro)
export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json({ message: 'Missing required fields: username, email, password' }, { status: 400 });
    }

    // --- ¡¡¡IMPORTANTE!!!: En una aplicación real, SIEMPRE HASHEAR LA CONTRASEÑA ---
    // Instala bcryptjs (npm install bcryptjs) y descomenta las siguientes líneas:
    // const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password, // <-- Aquí usarías `hashedPassword` si lo implementas
      },
      select: { // Retorna solo los datos seguros del nuevo usuario
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });

    return NextResponse.json(newUser, { status: 201 }); // 201 Created
  } catch (error: any) {
    console.error('Error creating user:', error);
    if (error.code === 'P2002') { // Error de Prisma para violación de restricción única (username/email ya existen)
      return NextResponse.json({ message: 'Email or username already exists. Please choose a different one.' }, { status: 409 }); // 409 Conflict
    }
    return NextResponse.json({ message: 'Error creating user', error: error.message }, { status: 500 });
  }
}