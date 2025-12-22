export const BASE_URL = process.env.REACT_APP_API_URL;
console.log("BASE URL:", BASE_URL);
export async function apiGet(path) {
  const token = localStorage.getItem("jwt");

  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : ""
    }
  });

  return response.json();
}


export async function apiPost(path, body) {
  const token = localStorage.getItem("jwt");

  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : ""
    },
    body: JSON.stringify(body)
  });

  return response.json();
}
