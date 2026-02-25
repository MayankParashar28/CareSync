import { queryClient } from "./queryClient";

class AuthError extends Error {
  constructor() {
    super("Not authenticated");
    this.name = "AuthError";
  }
}

export async function fetchWithAuth(input: RequestInfo | URL, init: RequestInit = {}) {
  const res = await fetch(input, {
    ...init,
    credentials: init.credentials ?? "include",
  });

  if (res.status === 401) {
    // Set auth user to null and stop all queries from refiring
    queryClient.setQueryData(["/api/auth/user"], null);
    queryClient.cancelQueries();
    throw new AuthError();
  }

  return res;
}
