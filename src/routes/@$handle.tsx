import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/@$handle")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/u/$handle", params: { handle: params.handle } });
  },
});
