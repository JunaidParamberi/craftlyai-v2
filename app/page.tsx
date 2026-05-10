import { Logo } from "@/components/shared/logo";

export default function HomePage() {
  return (
    <main className="p-8">
      <Logo />
      <p className="mt-4 text-muted-foreground">
        Next.js app router scaffold. Add routes under{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
          app/
        </code>
        .
      </p>
    </main>
  );
}
