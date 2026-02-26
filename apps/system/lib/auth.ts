import { jwtDecode } from "jwt-decode";

// Define what your Token looks like inside
interface TokenPayload {
  id: string;
  role: "ADMIN" | "MANAGER" | "AGENT";
  exp: number;
}

export const setToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
  }
};

export const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

// 👇 NEW FUNCTION: Decodes the token to get user info
export const getUser = (): TokenPayload | null => {
  const token = getToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode<TokenPayload>(token);
    return decoded;
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
};

export const logout = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }
};
