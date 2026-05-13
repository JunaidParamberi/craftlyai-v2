import { BrandLockupLink } from "@/components/shared/brand-lockup";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center gap-10 p-6 md:p-10">
      <BrandLockupLink href="/" linkClassName="shrink-0" />
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
