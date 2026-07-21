"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogMedia,
} from "@/components/ui/alert-dialog";

export function DeleteReelButton({ reelId }: { reelId: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/reels/${reelId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        window.alert(payload?.error ?? "Unable to delete reel.");
        setIsDeleting(false);
        setIsOpen(false);
        return;
      }

      router.refresh();
      router.push("/admin/reels");
    } catch (error) {
      console.error(error);
      window.alert("An unexpected error occurred.");
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger
        render={
          <Button
            type="button"
            size="lg"
            variant="destructive"
            className="gap-2"
            title="Delete Reel"
          >
            <Trash2 className="size-4" />
            Delete Reel
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader >
          <AlertDialogMedia className="bg-destructive/15 text-destructive">
            <AlertTriangle className="size-5" />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete Reel</AlertDialogTitle>
          <AlertDialogDescription>
            Are you absolutely sure you want to delete this reel? This action will permanently remove all associated frames, images, voiceovers, and rendered videos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className={"cursor-pointer"} disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            variant="destructive"
            className="cursor-pointer bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {isDeleting ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Deleting...
              </>
            ) : (
              <p className="text-primary-foreground">"Yes, Delete"</p>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
