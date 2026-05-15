import Image from "next/image";

import { portalFontClass } from "@/lib/portal/portal-font";
import type { PortalBrandContext } from "@/lib/portal/public-queries";
import { cn } from "@/lib/utils";

type PortalShellProps = {
  brand: PortalBrandContext;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function PortalShell({
  brand,
  subtitle,
  children,
  footer,
}: PortalShellProps) {
  const fontClass = portalFontClass(brand.font);

  return (
    <div
      className={cn("min-h-screen bg-muted/30 px-4 py-16", fontClass)}
      style={
        {
          "--portal-primary": brand.primaryColor,
          "--portal-secondary": brand.secondaryColor,
        } as React.CSSProperties
      }
    >
      <div className="mx-auto max-w-2xl">
        <header className="mb-8 text-center">
          {brand.logoUrl ? (
            <div className="relative mx-auto mb-4 h-12 w-40">
              <Image
                src={brand.logoUrl}
                alt={brand.businessName}
                fill
                className="object-contain object-center"
                unoptimized
              />
            </div>
          ) : (
            <span
              className="font-display text-2xl font-bold tracking-tight"
              style={{ color: "var(--portal-primary)" }}
            >
              {brand.businessName}
            </span>
          )}
          {subtitle ? (
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          ) : brand.logoUrl ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {brand.businessName}
            </p>
          ) : null}
        </header>
        {children}
        {footer ? (
          <p className="mt-6 text-center text-xs text-muted-foreground">
            {footer}
          </p>
        ) : null}
      </div>
    </div>
  );
}
