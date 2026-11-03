export async function GET() {
  return Response.json(
    {
      status: "ok",
      service: "foreverlcd.dev",
    },
    {
      status: 200,
    },
  );
}
