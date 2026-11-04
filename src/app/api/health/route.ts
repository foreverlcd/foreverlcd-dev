import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return Response.json(
      {
        status: "ok",
        service: "foreverlcd.dev",
        database: "ok",
      },
      {
        status: 200,
      },
    );
  } catch {
    return Response.json(
      {
        status: "error",
        service: "foreverlcd.dev",
        database: "disconnected",
      },
      {
        status: 503,
      },
    );
  }
}
