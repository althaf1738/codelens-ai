const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export { backendUrl };

export async function backendFetch<T = any>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${backendUrl}${path}`, init);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}
