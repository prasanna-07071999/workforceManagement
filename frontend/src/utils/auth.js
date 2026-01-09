import { jwtDecode } from "jwt-decode";

export const getAuthState = () => {
  const token = localStorage.getItem("jwt");
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);

    return {
      token,
      userId: decoded.userId,
      name: decoded.name,
      email: decoded.email,
      isAdmin: decoded.isAdmin,
      mustChangePassword: decoded.mustChangePassword,
    };
  } catch (err) {
    console.error("Invalid token", err);
    return null;
  }
};
