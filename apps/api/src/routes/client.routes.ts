import { Router } from "express";
import * as ClientController from "../controllers/client.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize(["ADMIN", "MANAGER"]),
  ClientController.getClients,
);
router.post("/", authenticate, ClientController.createClient);

export default router;
