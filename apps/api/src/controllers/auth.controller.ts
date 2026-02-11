// apps/api/src/controllers/auth.controller.ts
import { Request, Response } from "express";
import * as AuthService from "../services/auth.service";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const result = await AuthService.loginSystemUser(email, password);
    res.json(result);
  } catch (error: any) {
    // Security Best Practice: Don't tell them exactly what failed (email vs password)
    res.status(401).json({ error: error.message });
  }
};
