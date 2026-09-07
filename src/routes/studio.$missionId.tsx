import { createFileRoute } from "@tanstack/react-router";
import { BookBuilderStudio } from "@/components/studio/BookBuilderStudio";

export const Route = createFileRoute("/studio/$missionId")({
  component: StudioRoute,
});

function StudioRoute() {
  const { missionId } = Route.useParams();
  return <BookBuilderStudio missionId={missionId} />;
}
