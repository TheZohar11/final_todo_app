import { API_URL } from "../config";

export default async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return false;

  const response = await fetch(`${API_URL}/users/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) return false;

  const data = await response.json();
  localStorage.setItem("accessToken", data.accessToken);
  return true;
}
