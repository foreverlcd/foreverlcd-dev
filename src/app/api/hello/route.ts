export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (
      typeof body !== "object" ||
      typeof body.name !== "string" ||
      body.name.trim() === ""
    ) {
      return Response.json(
        {
          message: "Name must be a non-empty string",
        },
        {
          status: 400,
        },
      );
    }
    return Response.json(
      {
        message: `Hello ${body.name}`,
      },
      {
        status: 200,
      },
    );
  } catch {
    return Response.json(
      {
        message: "Invalid JSON body",
      },
      {
        status: 400,
      },
    );
  }
}
