import { FormPageShell } from "@/components/shared/form-page-shell";

type SectionPlaceholderProps = {
  title: string;
  description?: string;
};

/** Full-width shell (left-aligned) to match list pages like Clients; description stays `max-w-md`. */
export function SectionPlaceholder({
  title,
  description = "This area will ship in the next milestone.",
}: SectionPlaceholderProps) {
  return (
    <FormPageShell maxWidth="full">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
          {title}
        </h1>
        <p className="max-w-md text-muted-foreground text-sm">{description}</p>
      </div>
    </FormPageShell>
  );
}
