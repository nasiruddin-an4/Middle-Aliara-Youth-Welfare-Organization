import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request) {
  const cookie = request.cookies.get("admin_token");
  return cookie?.value || null;
}

export function isAuthenticated(request) {
  const token = getTokenFromRequest(request);
  if (!token) return false;
  return verifyToken(token);
}
export const ROLES = {
  SUPER_ADMIN: "super_admin",
  MEMBER_ADMIN: "member_admin",
  PAYMENT_ADMIN: "payment_admin",
  VIEWER: "viewer",
};

export function hasPermission(user, requiredRole) {
  if (!user) return false;
  if (user.role === ROLES.SUPER_ADMIN) return true;
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(user.role);
  }
  return user.role === requiredRole;
}
