export async function getHealth() {
  const response = await fetch("/api/health");
  return response.json();
}
