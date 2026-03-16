import { useEffect, useState } from "react";

export type Route =
  | { view: "landing" }
  | { view: "lead" }
  | { view: "agent"; slug: string };

export function parseHash(hash: string): Route {
  const path = hash.replace(/^#\/?/, "");

  if (path === "" || path === "/") {
    return { view: "landing" };
  }

  if (path === "lead") {
    return { view: "lead" };
  }

  const agentMatch = path.match(/^agent\/(.+)$/);
  if (agentMatch) {
    return { view: "agent", slug: agentMatch[1] };
  }

  return { view: "landing" };
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() =>
    parseHash(window.location.hash),
  );

  useEffect(() => {
    function onHashChange() {
      setRoute(parseHash(window.location.hash));
      window.scrollTo(0, 0);
    }

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return route;
}

export function navigate(path: string): void {
  window.location.hash = path;
}
