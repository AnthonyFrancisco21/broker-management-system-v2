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
  authorize(["ADMIN", "MANAGER"]), // Adjust roles if necessary based on your setup
  BrokerController.getBrokers,
);

// Add upload.single("picture") middleware to process the file field named "picture"
router.post(
  "/",
  authenticate,
  upload.single("picture"),
  BrokerController.createBroker,
);

// NEW: Update broker route (Matches the PUT request from EditAgentForm)
// Uses "profilePicture" because that's what the frontend submitData appends
router.put(
  "/:id",
  authenticate,
  upload.single("profilePicture"),
  BrokerController.updateBroker,
);

// Add this near your other routes in broker.routes.ts

// NEW: Delete broker route
router.delete(
  "/:id",
  authenticate,
  authorize(["ADMIN", "MANAGER"]), // Optional: secure this so only admins can delete
  BrokerController.deleteBroker,
);

export default router;
