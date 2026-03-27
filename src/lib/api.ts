const API_URL = "/api";

export const api = {
  baseUrl: API_URL,
  async get(endpoint: string, token?: string) {
    const headers: any = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${API_URL}${endpoint}`, { headers });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: "An unknown error occurred" }));
      throw new Error(errorData.error || "An unknown error occurred");
    }
    return res.json();
  },

  async post(endpoint: string, body: any, token?: string) {
    const headers: any = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: "An unknown error occurred" }));
      throw new Error(errorData.error || "An unknown error occurred");
    }
    return res.json();
  },
};
