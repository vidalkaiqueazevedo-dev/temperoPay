import { useEffect } from "react";
import { useLocation } from "wouter";

const USERNAME = "temperododia2025";
const PASSWORD = "tempero123";

/**
 * Check if the current visitor is authenticated.
 */
export function isLoggedIn(): boolean {
  return localStorage.getItem("loggedIn") === "true";
}

/**
 * Attempt to log the user in with the provided credentials.
 * Returns true if successful, false otherwise.
 */
export function login(username: string, password: string): boolean {
  if (username === USERNAME && password === PASSWORD) {
    localStorage.setItem("loggedIn", "true");
    return true;
  }
  return false;
}

/**
 * Remove authentication data.
 */
export function logout() {
  localStorage.removeItem("loggedIn");
}

/**
 * A simple route guard for Wouter routes.
 * If the user is not authenticated, they are redirected to "/login".
 */
export function PrivateRoute({
  component: Component,
}: {
  component: React.ComponentType<any>;
}): JSX.Element | null {
  const [, navigate] = useLocation();
  const authed = isLoggedIn();

  useEffect(() => {
    if (!authed) navigate("/login");
  }, [authed]);

  if (!authed) return null;
  return <Component />;
}
