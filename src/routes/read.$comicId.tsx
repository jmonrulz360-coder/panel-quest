import { createFileRoute } from "@tanstack/react-router";
import { ComicReader } from "@/components/reader/ComicReader";

export const Route = createFileRoute("/read/$comicId")({
  component: ReadRoute,
});

function ReadRoute() {
  const { comicId } = Route.useParams();
  return <ComicReader comicId={comicId} />;
}
