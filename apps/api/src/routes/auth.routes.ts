// apps/api/src/routes/auth.routes.ts
import { Router } from "express";
import * as AuthController from "../controllers/auth.controller";

const router = Router();

// POST http://localhost:5000/auth/login
router.post("/login", AuthController.login);

export default router;
