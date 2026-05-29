const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export function getWorkspaceId() {
  return localStorage.getItem("leadflow-workspace-id");
}

export function setWorkspaceId(id) {
  if (id) localStorage.setItem("leadflow-workspace-id", id);
  else localStorage.removeItem("leadflow-workspace-id");
}

export async function apiRequest(path, options = {}) {
  const { method = "GET", body, workspaceScoped = false, headers = {} } = options;

  const reqHeaders = { ...headers };

  if (body !== undefined) {
    reqHeaders["Content-Type"] = "application/json";
  }

  if (workspaceScoped) {
    const workspaceId = getWorkspaceId();
    if (!workspaceId) {
      throw new Error("No workspace selected");
    }
    reqHeaders["x-workspace-id"] = workspaceId;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    credentials: "include",
    headers: reqHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }

  return data;
}
