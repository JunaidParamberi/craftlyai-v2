import Image from "next/image";
import Link from "next/link";

import { branding } from "@/config/branding";
import { cn } from "@/lib/utils";

type BrandLockupProps = {
  className?: string;
  /** Extra classes on the wordmark wrapper (e.g. sidebar `group-data-[collapsible=icon]:hidden`). */
  wordmarkWrapperClassName?: string;
};

/**
 * Default-colored mark + theme-aware wordmark (dark type on light bg, light type on dark bg).
 */
export function BrandLockup({
  className,
  wordmarkWrapperClassName,
}: BrandLockupProps) {
  return (
    <div className={cn("flex shrink-0 items-end gap-2", className)}>
      <Image
        src={branding.mark}
        alt=""
        width={32}
        height={32}
        unoptimized
        className="size-6 shrink-0 object-contain sm:size-7 group-data-[collapsible=icon]:size-8"
      />
      <span
        className={cn(
          "flex min-w-0 items-end",
          wordmarkWrapperClassName,
        )}
      >
        <Image
          src={branding.wordmarkOnLightBg}
          alt=""
          width={160}
          height={36}
          unoptimized
          className="h-[1.125rem] w-auto max-w-[min(100%,11rem)] object-contain object-left object-bottom dark:hidden sm:h-5"
        />
        <Image
          src={branding.wordmarkOnDarkBg}
          alt=""
          width={160}
          height={36}
          unoptimized
          className="hidden h-[1.125rem] w-auto max-w-[min(100%,11rem)] object-contain object-left object-bottom dark:block sm:h-5"
        />
      </span>
    </div>
  );
}

type BrandLockupLinkProps = BrandLockupProps & {
  href?: string;
};

export function BrandLockupLink({
  href = "/dashboard",
  className,
  wordmarkWrapperClassName,
}: BrandLockupLinkProps) {
  return (
    <Link
      href={href}
      aria-label="CraftlyAI home"
      className={cn(
        "inline-flex shrink-0 items-end transition-opacity hover:opacity-90",
        className,
      )}
    >
      <BrandLockup wordmarkWrapperClassName={wordmarkWrapperClassName} />
    </Link>
  );
}
