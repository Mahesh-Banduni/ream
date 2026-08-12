import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      name,
      email,
      password,
      phone,
    }: {
      name: string;
      email: string;
      password: string;
      phone?: string;
    } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "All required fields are missing." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          message: "Email already exists.",
        },
        { status: 409 }
      );
    }

    const role = await prisma.role.findUnique({
      where: {
        role_name: "CLIENT",
      },
    });

    if (!role) {
      return NextResponse.json(
        {
          message: "CLIENT role not found.",
        },
        { status: 500 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone ?? `${Date.now()}`, // replace if phone becomes optional
        password_hash: passwordHash,
        auth_provider: "EMAIL",
        role_id: role.role_id,

        client: {
          create: {
            name,
            email,
            phone: phone ?? `${Date.now()}`,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        userId: user.user_id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Something went wrong.",
      },
      { status: 500 }
    );
  }
}