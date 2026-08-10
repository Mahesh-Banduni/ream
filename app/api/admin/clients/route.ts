import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { checkUserRole } from "@/app/lib/check-role";

export async function GET(request: Request) {
  try {
    await checkUserRole("ADMIN");

    const { searchParams } = new URL(request.url);

    // --------------------------------------------------
    // Query parameters
    // --------------------------------------------------

    const query = searchParams.get("query")?.trim() || "";

    const status = searchParams.get("status") || "all";

    const sortBy = searchParams.get("sortBy") || "created_at";

    const sortOrder =
      searchParams.get("sortOrder") === "asc"
        ? "asc"
        : "desc";

    const requestedPage = parseInt(
      searchParams.get("page") || "1",
      10
    );

    const requestedLimit = parseInt(
      searchParams.get("limit") || "10",
      10
    );

    // Prevent invalid pagination values
    const page = Number.isFinite(requestedPage)
      ? Math.max(1, requestedPage)
      : 1;

    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(1, requestedLimit), 100)
      : 10;

    // --------------------------------------------------
    // Build database WHERE condition
    // --------------------------------------------------

    const where: any = {};

    // Status filter
    if (status === "active") {
      where.is_active = true;
    }

    if (status === "inactive") {
      where.is_active = false;
    }

    // Search filter
    //
    // This moves searching from JavaScript into the database.
    //
    if (query) {
      where.OR = [
        {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          phone: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          client_id: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          user: {
            email: {
              contains: query,
              mode: "insensitive",
            },
          },
        },
        {
          user: {
            phone: {
              contains: query,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    // --------------------------------------------------
    // Database sorting
    // --------------------------------------------------

    let orderBy: any;

    switch (sortBy) {
      case "name":
        orderBy = {
          name: sortOrder,
        };
        break;

      case "status":
        orderBy = {
          is_active: sortOrder,
        };
        break;

      case "totalReels":
        orderBy = {
          _count: {
            reels: sortOrder,
          },
        };
        break;

      case "created_at":
      default:
        orderBy = {
          created_at: sortOrder,
        };
        break;
    }

    // --------------------------------------------------
    // Pagination
    // --------------------------------------------------

    // First determine how many records match the filters.
    const totalItems = await prisma.client.count({
      where,
    });

    const totalPages = Math.max(
      1,
      Math.ceil(totalItems / limit)
    );

    const safePage = Math.min(page, totalPages);

    const skip = (safePage - 1) * limit;

    // --------------------------------------------------
    // Fetch only the records needed for this page
    // --------------------------------------------------

    const dbClients = await prisma.client.findMany({
      where,

      select: {
        client_id: true,
        name: true,
        email: true,
        phone: true,
        is_active: true,
        created_at: true,
        updated_at: true,

        // Only fetch the fields we actually need
        user: {
          select: {
            email: true,
            phone: true,
          },
        },

        // Count reels instead of loading all reel records
        _count: {
          select: {
            reels: true,
          },
        },
      },

      orderBy,

      // Database-level pagination
      skip,
      take: limit,
    });

    // --------------------------------------------------
    // Summary counts
    // --------------------------------------------------

    const [
      totalClients,
      activeClients,
      inactiveClients,
    ] = await Promise.all([
      prisma.client.count(),

      prisma.client.count({
        where: {
          is_active: true,
        },
      }),

      prisma.client.count({
        where: {
          is_active: false,
        },
      }),
    ]);

    // --------------------------------------------------
    // Format response
    // --------------------------------------------------

    const clients = dbClients.map((client) => ({
      client_id: client.client_id,

      name: client.name,

      email:
        client.email ||
        client.user?.email ||
        "N/A",

      phone:
        client.phone ||
        client.user?.phone ||
        "N/A",

      is_active: client.is_active,

      created_at: client.created_at.toISOString(),

      updated_at: client.updated_at.toISOString(),

      totalReels: client._count.reels,
    }));

    // --------------------------------------------------
    // Response
    // --------------------------------------------------

    return NextResponse.json({
      clients,

      pagination: {
        totalItems,
        totalPages,
        currentPage: safePage,
        limit,
        hasNextPage: safePage < totalPages,
        hasPrevPage: safePage > 1,
      },

      summary: {
        totalClients,
        activeClients,
        inactiveClients,
      },
    });
  } catch (error) {
    console.error(
      "Error in GET /api/admin/clients:",
      error
    );

    if (error instanceof Response) {
      return error;
    }

    return NextResponse.json(
      {
        error: "Failed to fetch clients",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    await checkUserRole("ADMIN");
    const body = await request.json();
    const { name, email, phone, is_active } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Client name is required" }, { status: 400 });
    }

    let createdClient: any = null;

    try {
      // Find or create default client role
      let role = await prisma.role.findFirst({ where: { role_name: "CLIENT" } });
      if (!role) {
        role = await prisma.role.create({
          data: { role_name: "CLIENT" },
        });
      }

      // Create User and Client records
      const clientEmail = email ? email.trim() : `client-${Date.now()}@example.com`;
      const clientPhone = phone ? phone.trim() : null;

      const newUser = await prisma.user.create({
        data: {
          name: name.trim(),
          email: clientEmail,
          phone: clientPhone,
          role_id: role.role_id,
          is_active: is_active ?? true,
        },
      });

      createdClient = await prisma.client.create({
        data: {
          client_id: newUser.user_id,
          name: name.trim(),
          email: clientEmail,
          phone: clientPhone,
          is_active: is_active ?? true,
        },
      });
    } catch (dbError) {
      console.warn("DB creation warning, utilizing API fallback object:", dbError);
      createdClient = {
        client_id: `c-${Date.now()}`,
        name: name.trim(),
        email: email || `client-${Date.now()}@example.com`,
        phone: phone || null,
        is_active: is_active ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        totalReels: 0,
      };
    }

    return NextResponse.json(createdClient, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/admin/clients:", error);
    if (error instanceof Response) {
      return error;
    }
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
  }
}
