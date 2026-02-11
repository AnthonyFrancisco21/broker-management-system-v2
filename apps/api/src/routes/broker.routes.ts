import { Router } from "express";
import * as BrokerController from "../controllers/broker.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize(["ADMIN", "MANAGER"]),
  BrokerController.getBrokers,
);
router.post("/", authenticate, BrokerController.createBroker);

export default router;
