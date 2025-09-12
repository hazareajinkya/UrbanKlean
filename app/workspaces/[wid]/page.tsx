export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ wid: string }>;
}) {
  const { wid } = await params;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome to your workspace dashboard.
      </p>
    </div>
  );
}
