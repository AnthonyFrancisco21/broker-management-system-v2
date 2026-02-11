import { Router } from "express";
import * as UnitController from "../controllers/unit.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize(["ADMIN", "MANAGER", "AGENT", "CLIENT"]),
  UnitController.getUnits,
);

export default router;
