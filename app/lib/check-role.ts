import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function checkUserRole(requiredRole: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Response(
      JSON.stringify({ error: "Unauthorized" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  if (session.user.role !== requiredRole) {
    throw new Response(
      JSON.stringify({ error: "Forbidden" }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return session;
}