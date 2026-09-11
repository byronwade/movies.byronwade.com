import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/tonight")({ component: Tonight });

function Tonight() {
  return <Navigate to="/" />;
}
