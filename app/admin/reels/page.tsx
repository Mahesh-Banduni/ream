import { Film, Plus } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminReels } from "@/app/lib/admin-data";
import { CreateReelDialog } from "@/components/create-reel-dialog";
import { ReelCard } from "@/components/reel-card";
import { DeleteReelButton } from "@/components/delete-reel-button";

export default async function ReelsPage() {
  const reels = await getAdminReels();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-4xl">
              <Film className="size-8 text-primary" />
              Reels
            </CardTitle>
            <CardDescription className="mt-1">
              Browse, play, and manage reels from your production queue.
            </CardDescription>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden rounded-full border border-border/60 bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground sm:inline-flex">
              {reels.length} total reels
            </span>
            <CreateReelDialog />
          </div>
        </CardHeader>
      </Card>

      {/* Reels Card Gallery */}
      {reels.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="grid size-16 place-items-center rounded-2xl bg-muted text-muted-foreground">
              <Film className="size-8" />
            </div>
            <div>
              <p className="font-semibold text-foreground">No reels yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create your first reel to see it here.
              </p>
            </div>
            <CreateReelDialog />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {reels.map((reel) => (
            <div key={reel.id} className="relative flex flex-col">
              <ReelCard reel={reel} />
              {/* Delete button below each card */}
              {/* <div className="mt-2 flex justify-end px-1">
                <DeleteReelButton reelId={reel.id} />
              </div> */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
