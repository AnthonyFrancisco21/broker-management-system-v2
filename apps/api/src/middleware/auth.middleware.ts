import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "qwhrqyq123qwse1gcq4rbcq34r2#@!";

// This interface tells TypeScript what the decoded token looks like
interface AuthPayload {
  id: number;
  role: string;
  type: string;
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 1. Get the token from the Header (Format: Bearer <token>)
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ error: "Access denied. No token provided." });
    }

    // 2. Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;

    // 3. Attach the user data to the request object so controllers can use it
    // @ts-ignore (We'll fix the Request type properly later)
    req.user = decoded;

    // 4. Move to the next function (the Controller)
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token." });
  }
};

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const user = req.user;

    // Check if the user's role is in the allowed list
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({
        error: "Forbidden: You do not have permission to perform this action.",
      });
    }

    next();
  };
};
