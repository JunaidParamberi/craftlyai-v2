import { describe, expect, it } from "vitest";

import { pickEmbed } from "@/lib/supabase/pick-embed";

describe("pickEmbed", () => {
  it("reads a single embedded object", () => {
    const result = pickEmbed({ id: "a", name: "Acme" }, "name");
    expect(result).toEqual({ id: "a", name: "Acme" });
  });

  it("reads the first element of an embedded array", () => {
    const result = pickEmbed([{ id: "a", title: "Website" }], "title");
    expect(result).toEqual({ id: "a", title: "Website" });
  });

  it("returns null when the label field is missing", () => {
    expect(pickEmbed({ id: "a" }, "name")).toBeNull();
    expect(pickEmbed(null, "name")).toBeNull();
  });
});
