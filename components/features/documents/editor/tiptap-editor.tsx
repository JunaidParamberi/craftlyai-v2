"use client";

import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import { EditorContent, useEditor, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";
import type { TiptapDoc } from "@/types";

import { EditorToolbar } from "./editor-toolbar";

type TiptapEditorProps = {
  value: TiptapDoc;
  onChange: (next: TiptapDoc) => void;
  placeholder?: string;
  className?: string;
};

export function TiptapEditor({
  value,
  onChange,
  placeholder = "Start writing…",
  className,
}: TiptapEditorProps) {
  const skipExternalSyncRef = useRef(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false,
      }),
      Placeholder.configure({ placeholder }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline underline-offset-4 hover:opacity-80",
          rel: "noopener noreferrer",
        },
      }),
      Typography,
    ],
    content: value as JSONContent,
    editorProps: {
      attributes: {
        class:
          "doc-prose min-h-[24rem] focus:outline-none px-10 py-10 sm:px-16 sm:py-14",
      },
    },
    onUpdate: ({ editor: ed }) => {
      skipExternalSyncRef.current = true;
      onChange(ed.getJSON() as TiptapDoc);
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (skipExternalSyncRef.current) {
      skipExternalSyncRef.current = false;
      return;
    }
    const current = JSON.stringify(editor.getJSON());
    const next = JSON.stringify(value);
    if (current !== next) {
      editor.commands.setContent(value as JSONContent, { emitUpdate: false });
    }
  }, [value, editor]);

  return (
    <div
      className={cn(
        "border border-border/70 rounded-2xl bg-card shadow-[0_1px_0_0_rgba(0,0,0,0.02),0_24px_48px_-32px_rgba(15,23,42,0.18)] overflow-hidden",
        className,
      )}
    >
      <EditorToolbar editor={editor} />
      <div className="bg-[oklch(0.995_0_0)] dark:bg-card border-t border-border/60">
        <EditorContent editor={editor} className="mx-auto max-w-[68ch]" />
      </div>
    </div>
  );
}
