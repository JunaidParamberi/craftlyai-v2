import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProjectDetailRedirectPage({ params }: PageProps) {
  const { id } = await params;
  redirect(`/projects?project=${id}&tab=tasks`);
}
