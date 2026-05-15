export function PortalNotFound({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="max-w-md text-center">
        <p className="font-display text-2xl font-semibold text-foreground">
          {title}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
