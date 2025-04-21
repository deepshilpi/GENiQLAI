import { Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: React.ComponentType<any>;
}) {
  return (
    <Route path={path}>
      <Component />
    </Route>
  );
}