import { createFileRoute } from "@tanstack/react-router";
import { HqHome } from "@/components/hq/HqHome";

export const Route = createFileRoute("/")({ component: HqHome });
