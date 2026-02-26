// apps/api/src/routes/broker.routes.ts

import { Router } from "express";
import multer from "multer";
import * as BrokerController from "../controllers/broker.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

// Configure multer to store files in memory as a Buffer so we can write it manually in the service
const upload = multer({ storage: multer.memoryStorage() });

router.get(
  "/",
  authenticate,
  authorize(["ADMIN", "MANAGER"]),
  BrokerController.getBrokers,
);

// Add upload.single("picture") middleware to process the file field named "picture"
router.post(
  "/",
  authenticate,
  upload.single("picture"),
  BrokerController.createBroker,
);

export default router;
