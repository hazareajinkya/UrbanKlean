export default function WorkspacePage({ params }: { params: { wid: string } }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome to your workspace dashboard.
      </p>
    </div>
  );
}
