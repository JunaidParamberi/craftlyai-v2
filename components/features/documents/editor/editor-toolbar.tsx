"use client";

import type { Editor } from "@tiptap/react";
import {
  Bold,
  Heading1,
  Heading2,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Undo2,
} from "lucide-react";
import { useCallback } from "react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { VariableMenu } from "./variable-menu";

type EditorToolbarProps = {
  editor: Editor | null;
};

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const insertVariable = useCallback(
    (key: string) => {
      if (!editor) return;
      editor.chain().focus().insertContent(`{{${key}}}`).run();
    },
    [editor],
  );

  const promptLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  }, [editor]);

  if (!editor) {
    return (
      <div className="h-12 border-b border-border/60 bg-muted/40" aria-hidden />
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border/60 bg-muted/40 px-2 py-1.5">
      <ToolbarBtn
        label="Undo"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        <Undo2 className="size-4" />
      </ToolbarBtn>
      <ToolbarBtn
        label="Redo"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        <Redo2 className="size-4" />
      </ToolbarBtn>
      <ToolbarSep />
      <ToolbarBtn
        label="Heading 1"
        active={editor.isActive("heading", { level: 1 })}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 1 }).run()
        }
      >
        <Heading1 className="size-4" />
      </ToolbarBtn>
      <ToolbarBtn
        label="Heading 2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
      >
        <Heading2 className="size-4" />
      </ToolbarBtn>
      <ToolbarSep />
      <ToolbarBtn
        label="Bold"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="size-4" />
      </ToolbarBtn>
      <ToolbarBtn
        label="Italic"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="size-4" />
      </ToolbarBtn>
      <ToolbarBtn
        label="Strikethrough"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="size-4" />
      </ToolbarBtn>
      <ToolbarSep />
      <ToolbarBtn
        label="Bullet list"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="size-4" />
      </ToolbarBtn>
      <ToolbarBtn
        label="Ordered list"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="size-4" />
      </ToolbarBtn>
      <ToolbarBtn
        label="Quote"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="size-4" />
      </ToolbarBtn>
      <ToolbarBtn
        label="Divider"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Minus className="size-4" />
      </ToolbarBtn>
      <ToolbarSep />
      <ToolbarBtn label="Link" active={editor.isActive("link")} onClick={promptLink}>
        <Link2 className="size-4" />
      </ToolbarBtn>
      <ToolbarSep />
      <VariableMenu onInsert={insertVariable} />
    </div>
  );
}

function ToolbarSep() {
  return (
    <Separator
      orientation="vertical"
      className="mx-1 h-5 bg-border/70"
    />
  );
}

function ToolbarBtn({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "size-8 rounded-md text-muted-foreground hover:bg-background hover:text-foreground",
        active && "bg-background text-foreground shadow-[inset_0_0_0_1px_var(--border)]",
      )}
    >
      {children}
    </Button>
  );
}
