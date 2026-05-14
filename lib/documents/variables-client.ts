import type { ClientRow, ProjectListRow } from "@/types";
import type { VariableContext } from "./variables";

export function buildClientSideContext({
  clientId,
  projectId,
  clients,
  projects,
  initialCtx,
}: {
  clientId: string | undefined;
  projectId: string | undefined;
  clients: ClientRow[];
  projects: ProjectListRow[];
  initialCtx: VariableContext;
}): VariableContext {
  const client = clientId
    ? (clients.find((c) => c.id === clientId) ?? null)
    : null;

  const project = projectId
    ? (projects.find((p) => p.id === projectId) ?? null)
    : null;

  return {
    brand: initialCtx.brand,
    now: new Date(),
    client: client
      ? {
          name: client.name,
          contact_name: client.contact_name,
          email: client.email,
          company: client.company,
        }
      : null,
    project: project ? { title: project.title } : null,
  };
}
